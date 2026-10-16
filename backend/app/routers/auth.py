import secrets
import hashlib
from typing import Optional, Dict
from fastapi import APIRouter, HTTPException, Depends, Header, status
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def hash_password(password: str) -> str:
    """Deterministic SHA-256 password hash for internal supervisor store."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


SUPERVISOR_DATABASE = {
    "ramesh": {
        "username": "ramesh",
        "name": "Ramesh Patel",
        "role": "Weaving Shift Supervisor",
        "plant": "Naroda Weaving Unit",
        "password_hash": hash_password("arvind123"),
    },
    "pooja": {
        "username": "pooja",
        "name": "Pooja Shah",
        "role": "Plant Quality Lead",
        "plant": "Santej Processing Plant",
        "password_hash": hash_password("arvind123"),
    },
    "vikram": {
        "username": "vikram",
        "name": "Vikram Desai",
        "role": "Spinning Shift Supervisor",
        "plant": "Naroda Spinning Unit",
        "password_hash": hash_password("arvind123"),
    },
}

# In-memory active session store: token -> user dict
ACTIVE_SESSIONS: Dict[str, dict] = {}


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, description="Supervisor username")
    password: str = Field(..., min_length=1, description="Supervisor password")


class SupervisorResponse(BaseModel):
    username: str
    name: str
    role: str
    plant: str
    token: str


def get_current_supervisor(
    authorization: Optional[str] = Header(None, description="Bearer token")
) -> dict:
    """Dependency validating Bearer token from Authorization header."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization scheme. Use 'Bearer <token>'.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = ACTIVE_SESSIONS.get(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


@router.post(
    "/login",
    response_model=SupervisorResponse,
    status_code=status.HTTP_200_OK,
    summary="Supervisor Credential Login",
)
def login(request: LoginRequest):
    username_key = request.username.strip().lower()
    user = SUPERVISOR_DATABASE.get(username_key)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    input_hash = hash_password(request.password)
    if input_hash != user["password_hash"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    # Issue secure session token
    token = f"arv_sec_{secrets.token_urlsafe(32)}"
    user_profile = {
        "username": user["username"],
        "name": user["name"],
        "role": user["role"],
        "plant": user["plant"],
        "token": token,
    }
    ACTIVE_SESSIONS[token] = user_profile

    return user_profile


@router.get(
    "/me",
    response_model=SupervisorResponse,
    summary="Get Authenticated Supervisor Profile",
)
def get_me(current_user: dict = Depends(get_current_supervisor)):
    return current_user


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Supervisor Logout",
)
def logout(authorization: Optional[str] = Header(None)):
    if authorization:
        _, _, token = authorization.partition(" ")
        ACTIVE_SESSIONS.pop(token, None)
    return {"status": "SUCCESS", "message": "Logged out successfully"}
