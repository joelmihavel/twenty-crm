import { useState, useCallback } from 'react';
import { HawkeyeFormDrawer, StyledFieldRow } from '@/hawkeye/components/HawkeyeFormDrawer';
import { HawkeyeFormField } from '@/hawkeye/components/HawkeyeFormField';

const satisfactionOptions = [
  { value: '1', label: '1 - Very Dissatisfied' },
  { value: '2', label: '2 - Dissatisfied' },
  { value: '3', label: '3 - Neutral' },
  { value: '4', label: '4 - Satisfied' },
  { value: '5', label: '5 - Very Satisfied' },
];

const npsScoreOptions = Array.from({ length: 11 }, (_, i) => ({
  value: String(i),
  label: String(i),
}));

type CsatNpsSurveyFormData = {
  tenant_name: string;
  pid: string;
  rid: string;
  move_in_date: string;
  overall_satisfaction: string;
  property_condition: string;
  maintenance_response: string;
  staff_behavior: string;
  value_for_money: string;
  nps_score: string;
  nps_reason: string;
  positive_feedback: string;
  improvement_areas: string;
  would_recommend: boolean;
};

const emptyForm: CsatNpsSurveyFormData = {
  tenant_name: '',
  pid: '',
  rid: '',
  move_in_date: '',
  overall_satisfaction: '',
  property_condition: '',
  maintenance_response: '',
  staff_behavior: '',
  value_for_money: '',
  nps_score: '',
  nps_reason: '',
  positive_feedback: '',
  improvement_areas: '',
  would_recommend: false,
};

type CsatNpsSurveyFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<CsatNpsSurveyFormData>) => void;
};

export const CsatNpsSurveyForm = ({
  isOpen,
  onClose,
  onSave,
}: CsatNpsSurveyFormProps) => {
  const [form, setForm] = useState<CsatNpsSurveyFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = useCallback(
    <K extends keyof CsatNpsSurveyFormData>(key: K) =>
      (value: CsatNpsSurveyFormData[K]) =>
        setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      onSave({ ...form });
      setSaving(false);
      onClose();
    }, 300);
  }, [form, onSave, onClose]);

  return (
    <HawkeyeFormDrawer
      isOpen={isOpen}
      title="CSAT / NPS Survey"
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      sections={[
        {
          title: 'Tenant Info',
          children: (
            <>
              <HawkeyeFormField
                type="text"
                label="Tenant Name"
                value={form.tenant_name}
                onChange={set('tenant_name')}
                required
                placeholder="Enter tenant name"
              />
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Property ID (PID)"
                  value={form.pid}
                  onChange={set('pid')}
                  placeholder="Enter PID"
                />
                <HawkeyeFormField
                  type="text"
                  label="Room ID (RID)"
                  value={form.rid}
                  onChange={set('rid')}
                  placeholder="Enter RID"
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="date"
                label="Move-in Date"
                value={form.move_in_date}
                onChange={set('move_in_date')}
              />
            </>
          ),
        },
        {
          title: 'Satisfaction Ratings',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="select"
                  label="Overall Satisfaction"
                  value={form.overall_satisfaction}
                  onChange={set('overall_satisfaction')}
                  options={satisfactionOptions}
                  placeholder="Select rating"
                />
                <HawkeyeFormField
                  type="select"
                  label="Property Condition"
                  value={form.property_condition}
                  onChange={set('property_condition')}
                  options={satisfactionOptions}
                  placeholder="Select rating"
                />
              </StyledFieldRow>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="select"
                  label="Maintenance Response"
                  value={form.maintenance_response}
                  onChange={set('maintenance_response')}
                  options={satisfactionOptions}
                  placeholder="Select rating"
                />
                <HawkeyeFormField
                  type="select"
                  label="Staff Behavior"
                  value={form.staff_behavior}
                  onChange={set('staff_behavior')}
                  options={satisfactionOptions}
                  placeholder="Select rating"
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="select"
                label="Value for Money"
                value={form.value_for_money}
                onChange={set('value_for_money')}
                options={satisfactionOptions}
                placeholder="Select rating"
              />
            </>
          ),
        },
        {
          title: 'NPS',
          children: (
            <>
              <HawkeyeFormField
                type="select"
                label="NPS Score (0-10)"
                value={form.nps_score}
                onChange={set('nps_score')}
                options={npsScoreOptions}
                placeholder="Select score"
              />
              <HawkeyeFormField
                type="textarea"
                label="NPS Reason"
                value={form.nps_reason}
                onChange={set('nps_reason')}
                placeholder="Why did you give this score?"
              />
            </>
          ),
        },
        {
          title: 'Feedback',
          children: (
            <>
              <HawkeyeFormField
                type="textarea"
                label="Positive Feedback"
                value={form.positive_feedback}
                onChange={set('positive_feedback')}
                placeholder="What did you like most?"
              />
              <HawkeyeFormField
                type="textarea"
                label="Improvement Areas"
                value={form.improvement_areas}
                onChange={set('improvement_areas')}
                placeholder="What could be improved?"
              />
              <HawkeyeFormField
                type="checkbox"
                label="Would Recommend"
                checked={form.would_recommend}
                onChange={set('would_recommend')}
              />
            </>
          ),
        },
      ]}
    />
  );
};
