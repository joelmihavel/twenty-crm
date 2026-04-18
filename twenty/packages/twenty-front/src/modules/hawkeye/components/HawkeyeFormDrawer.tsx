import { type ReactNode } from 'react';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { HawkeyeDrawer } from './HawkeyeDrawer';

const StyledFormBody = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};

  & + & {
    border-top: 1px solid ${themeCssVariables.border.color.light};
    margin-top: ${themeCssVariables.spacing[4]};
    padding-top: ${themeCssVariables.spacing[4]};
  }
`;

const StyledSectionTitle = styled.h3`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0 0 ${themeCssVariables.spacing[1]} 0;
`;

const StyledFieldRow = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: 1fr 1fr;
`;

const StyledFooter = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const buttonBase = `
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  height: 36px;
  padding: 0 ${themeCssVariables.spacing[4]};
  transition: background 0.1s ease, border-color 0.1s ease;
`;

const StyledCancelButton = styled.button`
  ${buttonBase}
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.secondary};

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledSaveButton = styled.button`
  ${buttonBase}
  background: ${themeCssVariables.accent.primary};
  border: 1px solid ${themeCssVariables.accent.primary};
  color: ${themeCssVariables.background.primary};

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

type FormSection = {
  title: string;
  children: ReactNode;
};

type HawkeyeFormDrawerProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
  sections: FormSection[];
};

export const HawkeyeFormDrawer = ({
  isOpen,
  title,
  onClose,
  onSave,
  saving,
  sections,
}: HawkeyeFormDrawerProps) => (
  <HawkeyeDrawer isOpen={isOpen} title={title} onClose={onClose}>
    <StyledFormBody>
      <StyledScrollArea>
        {sections.map((section) => (
          <StyledSection key={section.title}>
            <StyledSectionTitle>{section.title}</StyledSectionTitle>
            {section.children}
          </StyledSection>
        ))}
      </StyledScrollArea>
      <StyledFooter>
        <StyledCancelButton onClick={onClose} type="button">
          Cancel
        </StyledCancelButton>
        <StyledSaveButton
          onClick={onSave}
          disabled={saving}
          type="button"
        >
          {saving ? 'Saving...' : 'Save'}
        </StyledSaveButton>
      </StyledFooter>
    </StyledFormBody>
  </HawkeyeDrawer>
);

// Re-export layout helpers for use in form pages
export { StyledFieldRow, StyledSection };
