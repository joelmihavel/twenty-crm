import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { IconList, IconColumns } from 'twenty-ui/display';

export type ViewMode = 'list' | 'board';

type ViewToggleProps = {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
};

const StyledToggleContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.pill};
  display: flex;
  gap: 2px;
  padding: 2px;
`;

const StyledToggleButton = styled.button<{ isActive: boolean }>`
  align-items: center;
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.background.primary : 'transparent'};
  border: ${({ isActive }) =>
    isActive ? `1px solid ${themeCssVariables.border.color.light}` : '1px solid transparent'};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${({ isActive }) =>
    isActive ? themeCssVariables.font.color.primary : themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  transition: background 100ms ease-in-out, color 100ms ease-in-out;

  &:hover {
    color: ${themeCssVariables.font.color.secondary};
  }
`;

export const ViewToggle = ({ mode, onChange }: ViewToggleProps) => (
  <StyledToggleContainer>
    <StyledToggleButton
      isActive={mode === 'list'}
      onClick={() => onChange('list')}
      title="List view"
    >
      <IconList size={14} />
      List
    </StyledToggleButton>
    <StyledToggleButton
      isActive={mode === 'board'}
      onClick={() => onChange('board')}
      title="Board view"
    >
      <IconColumns size={14} />
      Kanban
    </StyledToggleButton>
  </StyledToggleContainer>
);
