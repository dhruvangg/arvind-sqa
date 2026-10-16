import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InspectionCreatePayload, SupervisorProfile } from '../types';
import { InspectionForm } from '../components/InspectionForm';

interface InspectionCreatePageProps {
  onSubmit: (payload: InspectionCreatePayload) => Promise<boolean>;
  supervisor: SupervisorProfile;
  isSubmitting: boolean;
}

export const InspectionCreatePage: React.FC<InspectionCreatePageProps> = ({
  onSubmit,
  supervisor,
  isSubmitting,
}) => {
  const navigate = useNavigate();

  return (
    <div className="animate-fadeIn py-2">
      {/* Strictly Defect Creation Form - NO Defect Severity Summary here */}
      <InspectionForm
        onSubmit={onSubmit}
        supervisor={supervisor}
        isSubmitting={isSubmitting}
        onSuccessNavigate={() => navigate('/')}
      />
    </div>
  );
};
