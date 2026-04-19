import { useState, useCallback } from 'react';
import { type Fsin } from '../../types/fsin.types';
import { HawkeyeFormDrawer, StyledFieldRow } from '@/hawkeye/components/HawkeyeFormDrawer';
import { HawkeyeFormField } from '@/hawkeye/components/HawkeyeFormField';

const categoryOptions = [
  { value: 'Rug', label: 'Rug' },
  { value: 'Bed', label: 'Bed' },
  { value: 'AC', label: 'AC' },
  { value: 'Geyser', label: 'Geyser' },
  { value: 'Water Purifier', label: 'Water Purifier' },
  { value: 'Washing Machine', label: 'Washing Machine' },
  { value: 'Furniture', label: 'Furniture' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Appliance', label: 'Appliance' },
];

type CatalogFormData = {
  fsin_code: string;
  vendor_code: string;
  item_name: string;
  category: string;
  uom: string;
  reorder_point: string;
  annual_depreciation: string;
  perceived_value: string;
  dimensions: string;
  material: string;
  finish: string;
  color: string;
  style: string;
  packaging: string;
  lego: string;
};

const emptyForm: CatalogFormData = {
  fsin_code: '',
  vendor_code: '',
  item_name: '',
  category: 'Furniture',
  uom: '',
  reorder_point: '',
  annual_depreciation: '',
  perceived_value: '',
  dimensions: '',
  material: '',
  finish: '',
  color: '',
  style: '',
  packaging: '',
  lego: '',
};

type CatalogFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Fsin>) => void;
  catalog?: Fsin;
};

export const CatalogForm = ({
  isOpen,
  onClose,
  onSave,
  catalog,
}: CatalogFormProps) => {
  const [form, setForm] = useState<CatalogFormData>(
    catalog
      ? {
          fsin_code: catalog.fsin_code,
          vendor_code: catalog.vendor_code,
          item_name: catalog.item_name,
          category: catalog.category,
          uom: catalog.uom,
          reorder_point: String(catalog.reorder_point),
          annual_depreciation: String(catalog.annual_depreciation),
          perceived_value: String(catalog.perceived_value),
          dimensions: catalog.dimensions,
          material: catalog.material,
          finish: catalog.finish,
          color: catalog.color,
          style: catalog.style,
          packaging: catalog.packaging,
          lego: String(catalog.lego),
        }
      : emptyForm,
  );
  const [saving, setSaving] = useState(false);

  const set = useCallback(
    <K extends keyof CatalogFormData>(key: K) =>
      (value: CatalogFormData[K]) =>
        setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      onSave({
        ...form,
        reorder_point: Number(form.reorder_point) || 0,
        annual_depreciation: Number(form.annual_depreciation) || 0,
        perceived_value: Number(form.perceived_value) || 0,
        lego: Number(form.lego) || 0,
        category: form.category as Fsin['category'],
      });
      setSaving(false);
      onClose();
    }, 300);
  }, [form, onSave, onClose]);

  return (
    <HawkeyeFormDrawer
      isOpen={isOpen}
      title={catalog ? 'Edit Catalog Item' : 'New Catalog Item'}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      sections={[
        {
          title: 'Identification',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="FSIN Code"
                  value={form.fsin_code}
                  onChange={set('fsin_code')}
                  required
                  placeholder="FSN-BED-001"
                />
                <HawkeyeFormField
                  type="text"
                  label="Vendor Code"
                  value={form.vendor_code}
                  onChange={set('vendor_code')}
                  placeholder="VND-001"
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="text"
                label="Item Name"
                value={form.item_name}
                onChange={set('item_name')}
                required
                placeholder="Single Bed Frame"
              />
              <StyledFieldRow>
                <HawkeyeFormField
                  type="select"
                  label="Category"
                  value={form.category}
                  onChange={set('category')}
                  options={categoryOptions}
                  required
                />
                <HawkeyeFormField
                  type="text"
                  label="UOM"
                  value={form.uom}
                  onChange={set('uom')}
                  placeholder="pcs"
                />
              </StyledFieldRow>
            </>
          ),
        },
        {
          title: 'Specification',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Dimensions"
                  value={form.dimensions}
                  onChange={set('dimensions')}
                  placeholder="6x3 ft"
                />
                <HawkeyeFormField
                  type="text"
                  label="Material"
                  value={form.material}
                  onChange={set('material')}
                  placeholder="Engineered Wood"
                />
              </StyledFieldRow>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Color"
                  value={form.color}
                  onChange={set('color')}
                  placeholder="Walnut"
                />
                <HawkeyeFormField
                  type="text"
                  label="Finish"
                  value={form.finish}
                  onChange={set('finish')}
                  placeholder="Matte"
                />
              </StyledFieldRow>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Style"
                  value={form.style}
                  onChange={set('style')}
                  placeholder="Modern"
                />
                <HawkeyeFormField
                  type="text"
                  label="Packaging"
                  value={form.packaging}
                  onChange={set('packaging')}
                  placeholder="Carton"
                />
              </StyledFieldRow>
            </>
          ),
        },
        {
          title: 'Commercials',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="number"
                  label="Perceived Value (₹)"
                  value={form.perceived_value}
                  onChange={set('perceived_value')}
                  placeholder="0"
                />
                <HawkeyeFormField
                  type="number"
                  label="Annual Depreciation (%)"
                  value={form.annual_depreciation}
                  onChange={set('annual_depreciation')}
                  placeholder="10"
                />
              </StyledFieldRow>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="number"
                  label="Reorder Point"
                  value={form.reorder_point}
                  onChange={set('reorder_point')}
                  placeholder="5"
                />
                <HawkeyeFormField
                  type="number"
                  label="LEGO"
                  value={form.lego}
                  onChange={set('lego')}
                  placeholder="0"
                />
              </StyledFieldRow>
            </>
          ),
        },
      ]}
    />
  );
};
