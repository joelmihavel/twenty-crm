import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { IconX } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

import { type FieldGroup } from '../types/entities';
import { HawkeyeDetailView } from './HawkeyeDetailView';

const SIDE_PANEL_WIDTH = 400;

// Matches Twenty's SidePanelForDesktop StyledSidePanelWrapper
const StyledPanelWrapper = styled.div<{ isOpen: boolean }>`
  flex-shrink: 0;
  min-width: 0;
  overflow: hidden;
  transition: width 0.2s ease-in-out;
  width: ${({ isOpen }) => (isOpen ? `${SIDE_PANEL_WIDTH}px` : '0px')};
`;

// Matches Twenty's SidePanelForDesktop StyledSidePanel
const StyledPanel = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const StyledPanelHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: space-between;
  min-height: 32px;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledPanelTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledPanelBody = styled.div`
  flex: 1;
  overflow-y: auto;
`;

type HawkeyeSidePanelProps<T> = {
  record: T | null;
  title: string;
  fieldGroups: FieldGroup<T>[];
  onClose: () => void;
};

export const HawkeyeSidePanel = <T,>({
  record,
  title,
  fieldGroups,
  onClose,
}: HawkeyeSidePanelProps<T>) => {
  const isOpen = record !== null;

  return (
    <StyledPanelWrapper isOpen={isOpen}>
      {record && (
        <StyledPanel>
          <StyledPanelHeader>
            <StyledPanelTitle>{title}</StyledPanelTitle>
            <LightIconButton
              Icon={IconX}
              accent="tertiary"
              size="small"
              onClick={onClose}
              aria-label="Close panel"
            />
          </StyledPanelHeader>
          <StyledPanelBody>
            <HawkeyeDetailView
              record={record}
              title={title}
              fieldGroups={fieldGroups}
              variant="panel"
            />
          </StyledPanelBody>
        </StyledPanel>
      )}
    </StyledPanelWrapper>
  );
};
