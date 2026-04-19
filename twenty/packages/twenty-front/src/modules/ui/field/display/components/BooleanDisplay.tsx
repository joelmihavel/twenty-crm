import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconSquareCheck, IconSquare } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const iconSizeSm = 14;

const StyledBooleanFieldValue = styled.div`
  margin-left: 4px;
`;

type BooleanDisplayProps = {
  value: boolean | null | undefined;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
`;

const StyledTrueIcon = styled.div`
  align-items: center;
  color: ${themeCssVariables.color.green};
  display: flex;
`;

const StyledFalseIcon = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
`;

export const BooleanDisplay = ({ value }: BooleanDisplayProps) => {
  if (value === null || value === undefined) {
    return <StyledContainer />;
  }

  const isTrue = value === true;

  return (
    <StyledContainer>
      {isTrue ? (
        <StyledTrueIcon>
          <IconSquareCheck size={iconSizeSm} />
        </StyledTrueIcon>
      ) : (
        <StyledFalseIcon>
          <IconSquare size={iconSizeSm} />
        </StyledFalseIcon>
      )}
      <StyledBooleanFieldValue>
        {isTrue ? t`True` : t`False`}
      </StyledBooleanFieldValue>
    </StyledContainer>
  );
};
