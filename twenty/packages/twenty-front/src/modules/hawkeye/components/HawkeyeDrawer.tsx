import { styled } from '@linaria/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { IconX } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

const DRAWER_WIDTH = 480;

const StyledOverlay = styled.div<{ isOpen: boolean }>`
  background: ${themeCssVariables.background.overlayPrimary};
  bottom: 0;
  left: 0;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  pointer-events: ${({ isOpen }) => (isOpen ? 'auto' : 'none')};
  position: fixed;
  right: 0;
  top: 0;
  transition: opacity ${themeCssVariables.animation.duration.normal}s;
  z-index: 100;
`;

const StyledDrawer = styled.aside<{ isOpen: boolean }>`
  background: ${themeCssVariables.background.primary};
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  bottom: 0;
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: flex;
  flex-direction: column;
  max-width: 90vw;
  position: fixed;
  right: 0;
  top: 0;
  transform: translateX(${({ isOpen }) => (isOpen ? '0' : '100%')});
  transition: transform ${themeCssVariables.animation.duration.normal}s ease;
  width: ${DRAWER_WIDTH}px;
  z-index: 101;
`;

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledHeaderTitle = styled.h2`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledBody = styled.div`
  flex: 1;
  overflow-y: auto;
`;

type HawkeyeDrawerProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export const HawkeyeDrawer = ({
  isOpen,
  title,
  onClose,
  children,
}: HawkeyeDrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      <StyledOverlay isOpen={isOpen} onClick={onClose} />
      <StyledDrawer isOpen={isOpen} ref={drawerRef}>
        <StyledHeader>
          <StyledHeaderTitle>{title}</StyledHeaderTitle>
          <LightIconButton
            Icon={IconX}
            accent="tertiary"
            size="small"
            onClick={onClose}
            aria-label="Close drawer"
          />
        </StyledHeader>
        <StyledBody>{children}</StyledBody>
      </StyledDrawer>
    </>
  );
};
