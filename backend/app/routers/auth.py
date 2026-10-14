from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

MOCK_SUPERVISORS = {
    "ramesh": {
        "username": "ramesh",
        "name": "Ramesh Patel",
        "role": "Weaving Shift Supervisor",
        "plant": "Naroda Weaving Unit",
        "token": "tok_ramesh_naroda_supervisor",
    },
    "pooja": {
        "username": "pooja",
        "name": "Pooja Shah",
        "role": "Plant Quality Lead",
        "plant": "Santej Processing Plant",
        "token": "tok_pooja_santej_lead",
    },
    "guest": {
        "username": "guest",
        "name": "Shop-floor Supervisor",
        "role": "General Shift Supervisor",
        "plant": "Arvind Fabric Plants",
        "token": "tok_guest_supervisor",
    },
}


class LoginRequest(BaseModel):
    username: str
    pin: Optional[str] = "1234"


class SupervisorResponse(BaseModel):
    username: str
    name: str
    role: str
    plant: str
    token: str


@router.post("/login", response_model=SupervisorResponse)
def login(request: LoginRequest):
    user_key = request.username.strip().lower()
    if user_key in MOCK_SUPERVISORS:
        return MOCK_SUPERVISORS[user_key]

    # Allow arbitrary supervisor name if pin is provided
    return {
        "username": user_key,
        "name": request.username.title(),
        "role": "Shift Supervisor",
        "plant": "Arvind Mills (Gujarat)",
        "token": f"tok_{user_key}_session",
    }


@router.get("/me", response_model=SupervisorResponse)
def get_current_user(token: Optional[str] = None):
    for sup in MOCK_SUPERVISORS.values():
        if sup["token"] == token:
            return sup
    return MOCK_SUPERVISORS["guest"]
