import { styled } from '@linaria/react';
import { IconCheck, IconX } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledButton = styled.button<{ variant: 'approve' | 'reject' }>`
  align-items: center;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  transition: opacity 0.1s ease;

  background: ${({ variant }) =>
    variant === 'approve' ? '#30a46c' : '#e5484d'};
  color: white;

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const StyledStatusLabel = styled.span<{ bgColor: string }>`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  background: ${({ bgColor }) => bgColor};
  color: white;
`;

type ApprovalActionsProps = {
  status: string;
  approvableStatuses: string[];
  approvedStatus: string;
  rejectedStatus: string;
  onApprove: () => void;
  onReject: () => void;
};

export const ApprovalActions = ({
  status,
  approvableStatuses,
  approvedStatus,
  rejectedStatus,
  onApprove,
  onReject,
}: ApprovalActionsProps) => {
  if (status === approvedStatus) {
    return (
      <StyledStatusLabel bgColor="#30a46c">
        <IconCheck size={14} />
        Approved
      </StyledStatusLabel>
    );
  }

  if (status === rejectedStatus) {
    return (
      <StyledStatusLabel bgColor="#e5484d">
        <IconX size={14} />
        Rejected
      </StyledStatusLabel>
    );
  }

  if (!approvableStatuses.includes(status)) {
    return null;
  }

  return (
    <>
      <StyledButton variant="approve" onClick={onApprove}>
        <IconCheck size={14} />
        Approve
      </StyledButton>
      <StyledButton variant="reject" onClick={onReject}>
        <IconX size={14} />
        Reject
      </StyledButton>
    </>
  );
};
