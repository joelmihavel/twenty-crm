import { useState, useCallback } from 'react';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { IconListCheck, IconPhoto } from 'twenty-ui/display';
import { Tag } from 'twenty-ui/components';

import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PagePanel } from '@/ui/layout/page/components/PagePanel';

// ── Types ─────────────────────────────────────────────────────────

type InspectionStatus = 'Pending' | 'Pass' | 'Fail' | 'NA';

type InspectionCategory =
  | 'Living Room'
  | 'Bedroom'
  | 'Kitchen'
  | 'Bathroom'
  | 'Common Area';

interface InspectionItem {
  id: string;
  category: InspectionCategory;
  item: string;
  status: InspectionStatus;
  notes: string;
  photo_required: boolean;
}

// ── Mock Data ─────────────────────────────────────────────────────

const initialItems: InspectionItem[] = [
  { id: 'INS-001', category: 'Living Room', item: 'Wall condition', status: 'Pending', notes: '', photo_required: true },
  { id: 'INS-002', category: 'Living Room', item: 'Flooring', status: 'Pending', notes: '', photo_required: true },
  { id: 'INS-003', category: 'Living Room', item: 'Light fixtures', status: 'Pending', notes: '', photo_required: false },
  { id: 'INS-004', category: 'Living Room', item: 'Electrical outlets', status: 'Pending', notes: '', photo_required: false },
  { id: 'INS-005', category: 'Living Room', item: 'Windows & curtains', status: 'Pending', notes: '', photo_required: true },
  { id: 'INS-006', category: 'Bedroom', item: 'Wall condition', status: 'Pending', notes: '', photo_required: true },
  { id: 'INS-007', category: 'Bedroom', item: 'Flooring', status: 'Pending', notes: '', photo_required: true },
  { id: 'INS-008', category: 'Bedroom', item: 'Wardrobe / closet', status: 'Pending', notes: '', photo_required: true },
  { id: 'INS-009', category: 'Bedroom', item: 'Fan / AC unit', status: 'Pending', notes: '', photo_required: false },
  { id: 'INS-010', category: 'Kitchen', item: 'Countertop & sink', status: 'Pending', notes: '', photo_required: true },
  { id: 'INS-011', category: 'Kitchen', item: 'Appliances', status: 'Pending', notes: '', photo_required: true },
  { id: 'INS-012', category: 'Kitchen', item: 'Exhaust / chimney', status: 'Pending', notes: '', photo_required: false },
  { id: 'INS-013', category: 'Kitchen', item: 'Cabinets & shelves', status: 'Pending', notes: '', photo_required: true },
  { id: 'INS-014', category: 'Bathroom', item: 'Fixtures (taps, shower)', status: 'Pending', notes: '', photo_required: true },
  { id: 'INS-015', category: 'Bathroom', item: 'Tiles & grouting', status: 'Pending', notes: '', photo_required: true },
  { id: 'INS-016', category: 'Bathroom', item: 'Geyser / water heater', status: 'Pending', notes: '', photo_required: false },
  { id: 'INS-017', category: 'Bathroom', item: 'Drainage', status: 'Pending', notes: '', photo_required: false },
  { id: 'INS-018', category: 'Common Area', item: 'Main door & lock', status: 'Pending', notes: '', photo_required: true },
  { id: 'INS-019', category: 'Common Area', item: 'Corridor / passage', status: 'Pending', notes: '', photo_required: false },
  { id: 'INS-020', category: 'Common Area', item: 'Meter readings', status: 'Pending', notes: '', photo_required: true },
];

const CATEGORIES: InspectionCategory[] = [
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Bathroom',
  'Common Area',
];

// ── Status → Tag color mapping ────────────────────────────────────

type TagColorName = 'green' | 'red' | 'gray' | 'orange';

const STATUS_TAG_COLOR: Record<InspectionStatus, TagColorName> = {
  Pending: 'orange',
  Pass: 'green',
  Fail: 'red',
  NA: 'gray',
};

// ── Styled Components ─────────────────────────────────────────────

const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const StyledMainContainer = styled.div`
  background: ${themeCssVariables.background.noisy};
  box-sizing: border-box;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: ${themeCssVariables.spacing[3]};
  padding-right: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledSummaryBar = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  flex-wrap: wrap;
`;

const StyledSummaryItem = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 100px;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledSummaryLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledSummaryCount = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledAccordion = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: 0 ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]};
`;

const StyledAccordionHeader = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  transition: background 100ms ease-linear;
  width: 100%;

  &:hover {
    background: ${themeCssVariables.background.tertiary};
  }
`;

const StyledChevron = styled.span<{ isOpen: boolean }>`
  display: inline-block;
  transition: transform 150ms ease;
  transform: ${({ isOpen }) => (isOpen ? 'rotate(90deg)' : 'rotate(0deg)')};
  font-size: 12px;
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledCategoryCount = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledAccordionBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding-left: ${themeCssVariables.spacing[2]};
`;

const StyledItemRow = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  transition: background 100ms ease-linear;

  &:hover {
    background: ${themeCssVariables.background.tertiary};
  }
`;

const StyledItemName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
  min-width: 0;
`;

const StyledPhotoIndicator = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: 4px;
  white-space: nowrap;
`;

const StyledStatusButtons = styled.div`
  display: flex;
  gap: 4px;
`;

const StyledStatusButton = styled.button<{ isActive: boolean; tagColor: TagColorName }>`
  background: ${({ isActive, tagColor }) =>
    isActive
      ? themeCssVariables.tag.background[tagColor]
      : 'transparent'};
  border: 1px solid ${({ isActive }) =>
    isActive
      ? themeCssVariables.border.color.medium
      : themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ isActive, tagColor }) =>
    isActive
      ? themeCssVariables.tag.text[tagColor]
      : themeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: 2px 8px;
  transition: all 100ms ease-linear;

  &:hover {
    background: ${({ tagColor }) => themeCssVariables.tag.background[tagColor]};
    color: ${({ tagColor }) => themeCssVariables.tag.text[tagColor]};
  }
`;

const StyledNotesInput = styled.input`
  background: transparent;
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  padding: 4px 8px;
  width: 160px;

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
  }

  &:focus {
    border-color: ${themeCssVariables.accent.primary};
    outline: none;
  }
`;

const StyledHeaderControls = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

// ── Component ─────────────────────────────────────────────────────

export const InspectionChecklistPage = () => {
  const [items, setItems] = useState<InspectionItem[]>(initialItems);
  const [openCategories, setOpenCategories] = useState<Set<InspectionCategory>>(
    new Set(CATEGORIES),
  );

  const toggleCategory = useCallback((category: InspectionCategory) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const handleStatusChange = useCallback(
    (itemId: string, status: InspectionStatus) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, status } : item,
        ),
      );
    },
    [],
  );

  const handleNotesChange = useCallback(
    (itemId: string, notes: string) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, notes } : item,
        ),
      );
    },
    [],
  );

  const totalItems = items.length;
  const passedCount = items.filter((i) => i.status === 'Pass').length;
  const failedCount = items.filter((i) => i.status === 'Fail').length;
  const pendingCount = items.filter((i) => i.status === 'Pending').length;

  return (
    <StyledPageContainer>
      <PageHeader title="Inspection Checklist" Icon={IconListCheck}>
        <StyledHeaderControls>
          <StyledCount>{totalItems} items</StyledCount>
        </StyledHeaderControls>
      </PageHeader>

      <StyledMainContainer>
        <PagePanel>
          <StyledSummaryBar>
            <StyledSummaryItem>
              <StyledSummaryLabel>Total</StyledSummaryLabel>
              <StyledSummaryCount>{totalItems}</StyledSummaryCount>
            </StyledSummaryItem>
            <StyledSummaryItem>
              <StyledSummaryLabel>Passed</StyledSummaryLabel>
              <StyledSummaryCount>{passedCount}</StyledSummaryCount>
            </StyledSummaryItem>
            <StyledSummaryItem>
              <StyledSummaryLabel>Failed</StyledSummaryLabel>
              <StyledSummaryCount>{failedCount}</StyledSummaryCount>
            </StyledSummaryItem>
            <StyledSummaryItem>
              <StyledSummaryLabel>Pending</StyledSummaryLabel>
              <StyledSummaryCount>{pendingCount}</StyledSummaryCount>
            </StyledSummaryItem>
          </StyledSummaryBar>

          <StyledAccordion>
            {CATEGORIES.map((category) => {
              const categoryItems = items.filter((i) => i.category === category);
              const isOpen = openCategories.has(category);
              const catPassed = categoryItems.filter((i) => i.status === 'Pass').length;
              const catTotal = categoryItems.length;

              return (
                <div key={category}>
                  <StyledAccordionHeader
                    onClick={() => toggleCategory(category)}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <StyledChevron isOpen={isOpen}>&#9654;</StyledChevron>
                      {category}
                    </span>
                    <StyledCategoryCount>
                      {catPassed}/{catTotal} done
                    </StyledCategoryCount>
                  </StyledAccordionHeader>

                  {isOpen && (
                    <StyledAccordionBody>
                      {categoryItems.map((item) => (
                        <StyledItemRow key={item.id}>
                          <StyledItemName>{item.item}</StyledItemName>
                          {item.photo_required && (
                            <StyledPhotoIndicator>
                              <IconPhoto size={12} />
                              Required
                            </StyledPhotoIndicator>
                          )}
                          <StyledStatusButtons>
                            {(['Pass', 'Fail', 'NA'] as InspectionStatus[]).map((s) => (
                              <StyledStatusButton
                                key={s}
                                isActive={item.status === s}
                                tagColor={STATUS_TAG_COLOR[s]}
                                onClick={() => handleStatusChange(item.id, s)}
                              >
                                {s}
                              </StyledStatusButton>
                            ))}
                          </StyledStatusButtons>
                          <StyledNotesInput
                            placeholder="Add notes..."
                            value={item.notes}
                            onChange={(e) =>
                              handleNotesChange(item.id, e.target.value)
                            }
                          />
                        </StyledItemRow>
                      ))}
                    </StyledAccordionBody>
                  )}
                </div>
              );
            })}
          </StyledAccordion>
        </PagePanel>
      </StyledMainContainer>
    </StyledPageContainer>
  );
};
