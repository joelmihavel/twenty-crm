import { styled } from '@linaria/react';
import { useEffect, useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Tag } from 'twenty-ui/components';

import { HawkeyeDrawer } from './HawkeyeDrawer';
import { transactionService } from '../services/transaction.service';
import { type Transaction } from '../types/transaction.types';
import { formatINR, formatDate } from '../utils/format';

// ── Styled ────────────────────────────────────────────────────────

const StyledSection = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledAmountRow = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledAmount = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xxl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
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

const StyledLoading = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[6]};
  text-align: center;
`;

// ── Component ─────────────────────────────────────────────────────

type TransactionDrawerProps = {
  transactionId: string | null;
  onClose: () => void;
};

export const TransactionDrawer = ({
  transactionId,
  onClose,
}: TransactionDrawerProps) => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!transactionId) {
      setTransaction(null);
      return;
    }
    setLoading(true);
    transactionService.getById(transactionId).then((t) => {
      setTransaction(t ?? null);
      setLoading(false);
    });
  }, [transactionId]);

  const isOpen = transactionId !== null;
  const title = transaction
    ? `${transaction.id} — ${transaction.credit_debit}`
    : 'Transaction';

  return (
    <HawkeyeDrawer isOpen={isOpen} title={title} onClose={onClose}>
      {loading && <StyledLoading>Loading...</StyledLoading>}
      {!loading && transaction && (
        <>
          <StyledSection>
            <StyledAmountRow>
              <StyledAmount>{formatINR(transaction.amount)}</StyledAmount>
              <Tag
                color={transaction.credit_debit === 'Credit' ? 'green' : 'red'}
                text={transaction.credit_debit}
              />
            </StyledAmountRow>

            <StyledFieldGrid>
              <StyledFieldLabel>Date</StyledFieldLabel>
              <StyledFieldValue>
                {formatDate(transaction.transaction_date)}
              </StyledFieldValue>

              <StyledFieldLabel>Purpose</StyledFieldLabel>
              <StyledFieldValue>
                {transaction.purpose_category_1}
                {transaction.purpose_category_2 &&
                  ` / ${transaction.purpose_category_2}`}
              </StyledFieldValue>

              <StyledFieldLabel>Description</StyledFieldLabel>
              <StyledFieldValue>
                {transaction.line_item_description || '—'}
              </StyledFieldValue>

              <StyledFieldLabel>From</StyledFieldLabel>
              <StyledFieldValue>
                {transaction.from_party} ({transaction.from_party_type})
              </StyledFieldValue>

              <StyledFieldLabel>To</StyledFieldLabel>
              <StyledFieldValue>
                {transaction.to_party} ({transaction.to_party_type})
              </StyledFieldValue>

              <StyledFieldLabel>Payment Channel</StyledFieldLabel>
              <StyledFieldValue>
                {transaction.payment_channel}
              </StyledFieldValue>

              <StyledFieldLabel>Provider</StyledFieldLabel>
              <StyledFieldValue>
                {transaction.payment_provider}
              </StyledFieldValue>

              <StyledFieldLabel>Gateway Ref</StyledFieldLabel>
              <StyledFieldValue>
                {transaction.gateway_reference_id || '—'}
              </StyledFieldValue>

              <StyledFieldLabel>Contract</StyledFieldLabel>
              <StyledFieldValue>
                {transaction.contract_uid || '—'}
              </StyledFieldValue>

              <StyledFieldLabel>PID / RID</StyledFieldLabel>
              <StyledFieldValue>
                {transaction.pid} / {transaction.rid}
              </StyledFieldValue>

              <StyledFieldLabel>Authorised By</StyledFieldLabel>
              <StyledFieldValue>
                {transaction.authorised_by || '—'}
              </StyledFieldValue>

              <StyledFieldLabel>Authorised Date</StyledFieldLabel>
              <StyledFieldValue>
                {transaction.authorised_date
                  ? formatDate(transaction.authorised_date)
                  : '—'}
              </StyledFieldValue>

              <StyledFieldLabel>Created By</StyledFieldLabel>
              <StyledFieldValue>
                {transaction.created_by}
              </StyledFieldValue>

              <StyledFieldLabel>Created Date</StyledFieldLabel>
              <StyledFieldValue>
                {formatDate(transaction.created_date)}
              </StyledFieldValue>
            </StyledFieldGrid>
          </StyledSection>

        </>
      )}
    </HawkeyeDrawer>
  );
};
