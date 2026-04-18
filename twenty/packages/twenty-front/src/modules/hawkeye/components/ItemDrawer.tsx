import { styled } from '@linaria/react';
import { useEffect, useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Tag } from 'twenty-ui/components';

import { HawkeyeDrawer } from './HawkeyeDrawer';
import { HawkeyeTimeline } from './HawkeyeTimeline';
import { itemService } from '../services/item.service';
import { type Item } from '../types/item.types';
import { type LocationRecord } from '../types/history.types';
import { formatINR, formatDate } from '../utils/format';

// ── Styled ────────────────────────────────────────────────────────

const StyledSection = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledSectionTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledFieldGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
  grid-template-columns: 140px 1fr;
`;

const StyledFieldLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledFieldValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  font-size: ${themeCssVariables.font.size.sm};
  width: 100%;
`;

const StyledTh = styled.th`
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.tertiary};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing[2]};
  text-align: left;
`;

const StyledTd = styled.td`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.primary};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledLoading = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[6]};
  text-align: center;
`;

const stateColorMap: Record<string, 'green' | 'blue' | 'orange' | 'red' | 'gray'> = {
  BUY: 'blue',
  WIB: 'orange',
  WOB: 'orange',
  PIB: 'green',
  POB: 'green',
  WORK: 'blue',
  DEAD: 'red',
};

// ── Component ─────────────────────────────────────────────────────

type ItemDrawerProps = {
  itemId: string | null;
  onClose: () => void;
};

export const ItemDrawer = ({ itemId, onClose }: ItemDrawerProps) => {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!itemId) {
      setItem(null);
      return;
    }
    setLoading(true);
    itemService.getById(itemId).then((i) => {
      setItem(i ?? null);
      setLoading(false);
    });
  }, [itemId]);

  const isOpen = itemId !== null;
  const title = item
    ? `${item.item_code} — ${item.product_name}`
    : 'Item';

  return (
    <HawkeyeDrawer isOpen={isOpen} title={title} onClose={onClose}>
      {loading && <StyledLoading>Loading...</StyledLoading>}
      {!loading && item && (
        <>
          {/* ── Summary ──────────────────────────────────── */}
          <StyledSection>
            <StyledFieldGrid>
              <StyledFieldLabel>Item Code</StyledFieldLabel>
              <StyledFieldValue>{item.item_code}</StyledFieldValue>

              <StyledFieldLabel>FSIN Code</StyledFieldLabel>
              <StyledFieldValue>{item.fsin_code}</StyledFieldValue>

              <StyledFieldLabel>Product</StyledFieldLabel>
              <StyledFieldValue>{item.product_name}</StyledFieldValue>

              <StyledFieldLabel>Serial No</StyledFieldLabel>
              <StyledFieldValue>{item.serial_no}</StyledFieldValue>

              <StyledFieldLabel>Unit Price</StyledFieldLabel>
              <StyledFieldValue>{formatINR(item.unit_price)}</StyledFieldValue>

              <StyledFieldLabel>GST</StyledFieldLabel>
              <StyledFieldValue>{item.gst_percent}%</StyledFieldValue>

              <StyledFieldLabel>State</StyledFieldLabel>
              <StyledFieldValue>
                <Tag
                  color={stateColorMap[item.state] ?? 'gray'}
                  text={item.state}
                />
              </StyledFieldValue>

              <StyledFieldLabel>Location</StyledFieldLabel>
              <StyledFieldValue>{item.location}</StyledFieldValue>

              <StyledFieldLabel>Lock</StyledFieldLabel>
              <StyledFieldValue>{item.lock ? 'Yes' : 'No'}</StyledFieldValue>

              <StyledFieldLabel>QA Flag</StyledFieldLabel>
              <StyledFieldValue>{item.qa_flag || '—'}</StyledFieldValue>

              <StyledFieldLabel>Repair Cost</StyledFieldLabel>
              <StyledFieldValue>
                {formatINR(item.total_repair_cost)}
              </StyledFieldValue>

              <StyledFieldLabel>Repair Tickets</StyledFieldLabel>
              <StyledFieldValue>{item.repair_ticket_count}</StyledFieldValue>

              <StyledFieldLabel>Operational Months</StyledFieldLabel>
              <StyledFieldValue>{item.operational_months}</StyledFieldValue>

              <StyledFieldLabel>Created</StyledFieldLabel>
              <StyledFieldValue>
                {formatDate(item.created_at)}
              </StyledFieldValue>
            </StyledFieldGrid>
          </StyledSection>

          {/* ── Location History ──────────────────────────── */}
          {item.location_history.length > 0 && (
            <StyledSection>
              <StyledSectionTitle>Location History</StyledSectionTitle>
              <StyledTable>
                <thead>
                  <tr>
                    <StyledTh>From</StyledTh>
                    <StyledTh>To</StyledTh>
                    <StyledTh>Location</StyledTh>
                    <StyledTh>State</StyledTh>
                    <StyledTh>Tenant</StyledTh>
                  </tr>
                </thead>
                <tbody>
                  {item.location_history.map((loc: LocationRecord) => (
                    <tr key={loc.id}>
                      <StyledTd>{formatDate(loc.from_date)}</StyledTd>
                      <StyledTd>
                        {loc.to_date ? formatDate(loc.to_date) : 'Present'}
                      </StyledTd>
                      <StyledTd>{loc.location}</StyledTd>
                      <StyledTd>
                        <Tag
                          color={stateColorMap[loc.state] ?? 'gray'}
                          text={loc.state}
                        />
                      </StyledTd>
                      <StyledTd>{loc.tenant_name || '—'}</StyledTd>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </StyledSection>
          )}

          {/* ── Timeline ─────────────────────────────────── */}
          <HawkeyeTimeline history={item.history} />
        </>
      )}
    </HawkeyeDrawer>
  );
};
