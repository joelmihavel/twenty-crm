import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledFieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledLabel = styled.label`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledRequired = styled.span`
  color: ${themeCssVariables.font.color.danger};
  margin-left: 2px;
`;

const inputStyles = `
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  outline: none;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  transition: border-color 0.1s ease;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    border-color: ${themeCssVariables.accent.primary};
  }

  &:disabled {
    background: ${themeCssVariables.background.tertiary};
    cursor: not-allowed;
    opacity: 0.5;
  }

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
  }
`;

const StyledInput = styled.input`
  ${inputStyles}
  height: 36px;
`;

const StyledSelect = styled.select`
  ${inputStyles}
  cursor: pointer;
  height: 36px;
`;

const StyledTextArea = styled.textarea`
  ${inputStyles}
  min-height: 80px;
  resize: vertical;
`;

const StyledError = styled.span`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.xs};
`;

type BaseProps = {
  label: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
};

type TextFieldProps = BaseProps & {
  type: 'text' | 'email' | 'number' | 'date' | 'tel';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
};

type SelectFieldProps = BaseProps & {
  type: 'select';
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
};

type TextAreaFieldProps = BaseProps & {
  type: 'textarea';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

type CheckboxFieldProps = BaseProps & {
  type: 'checkbox';
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export type HawkeyeFormFieldProps =
  | TextFieldProps
  | SelectFieldProps
  | TextAreaFieldProps
  | CheckboxFieldProps;

const StyledCheckboxRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: 36px;
`;

const StyledCheckbox = styled.input`
  accent-color: ${themeCssVariables.accent.primary};
  cursor: pointer;
  height: 16px;
  width: 16px;
`;

export const HawkeyeFormField = (props: HawkeyeFormFieldProps) => {
  const { label, required, error, disabled } = props;

  return (
    <StyledFieldWrapper>
      <StyledLabel>
        {label}
        {required && <StyledRequired>*</StyledRequired>}
      </StyledLabel>

      {props.type === 'select' ? (
        <StyledSelect
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          disabled={disabled}
        >
          {props.placeholder && (
            <option value="">{props.placeholder}</option>
          )}
          {props.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </StyledSelect>
      ) : props.type === 'textarea' ? (
        <StyledTextArea
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          disabled={disabled}
        />
      ) : props.type === 'checkbox' ? (
        <StyledCheckboxRow>
          <StyledCheckbox
            type="checkbox"
            checked={props.checked}
            onChange={(e) => props.onChange(e.target.checked)}
            disabled={disabled}
          />
        </StyledCheckboxRow>
      ) : (
        <StyledInput
          type={props.type}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          disabled={disabled}
        />
      )}

      {error && <StyledError>{error}</StyledError>}
    </StyledFieldWrapper>
  );
};
