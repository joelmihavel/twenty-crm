import { useState, useCallback, useMemo } from 'react';
import { type Item } from '../../types/item.types';
import { mockCatalogs } from '../../data/mock-catalogs';
import { HawkeyeFormDrawer, StyledFieldRow } from '@/hawkeye/components/HawkeyeFormDrawer';
import { HawkeyeFormField } from '@/hawkeye/components/HawkeyeFormField';

const stateOptions = [
  { value: 'WIB', label: 'WIB (Warehouse Inbound)' },
  { value: 'PIB', label: 'PIB (Property Inbound)' },
  { value: 'WORK', label: 'WORK (In Use)' },
  { value: 'REPAIR', label: 'REPAIR' },
  { value: 'DEAD', label: 'DEAD' },
];

const catalogOptions = mockCatalogs.map((c) => ({
  value: c.fsin_code,
  label: `${c.fsin_code} — ${c.item_name} (${c.category})`,
}));

type ItemFormData = {
  item_code: string;
  fsin_code: string;
  product_name: string;
  serial_no: string;
  unit_price: string;
  gst_percent: string;
  location: string;
  state: string;
  qa_flag: string;
  bill_document_id: string;
};

const emptyForm: ItemFormData = {
  item_code: '',
  fsin_code: '',
  product_name: '',
  serial_no: '',
  unit_price: '',
  gst_percent: '18',
  location: '',
  state: 'WIB',
  qa_flag: 'Passed',
  bill_document_id: '',
};

type ItemFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Item>) => void;
  item?: Item;
};

export const ItemForm = ({
  isOpen,
  onClose,
  onSave,
  item,
}: ItemFormProps) => {
  const [form, setForm] = useState<ItemFormData>(
    item
      ? {
          item_code: item.item_code,
          fsin_code: item.fsin_code,
          product_name: item.product_name,
          serial_no: String(item.serial_no),
          unit_price: String(item.unit_price),
          gst_percent: String(item.gst_percent),
          location: item.location,
          state: item.state,
          qa_flag: item.qa_flag,
          bill_document_id: item.bill_document_id,
        }
      : emptyForm,
  );
  const [saving, setSaving] = useState(false);

  const set = useCallback(
    <K extends keyof ItemFormData>(key: K) =>
      (value: ItemFormData[K]) =>
        setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const handleCatalogChange = useCallback((fsinCode: string) => {
    const catalog = mockCatalogs.find((c) => c.fsin_code === fsinCode);
    setForm((prev) => ({
      ...prev,
      fsin_code: fsinCode,
      product_name: catalog?.item_name ?? prev.product_name,
      unit_price: catalog ? String(catalog.perceived_value) : prev.unit_price,
    }));
  }, []);

  const selectedCatalog = useMemo(
    () => mockCatalogs.find((c) => c.fsin_code === form.fsin_code),
    [form.fsin_code],
  );

  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      onSave({
        ...form,
        serial_no: Number(form.serial_no) || 0,
        unit_price: Number(form.unit_price) || 0,
        gst_percent: Number(form.gst_percent) || 0,
        state: form.state as Item['state'],
      });
      setSaving(false);
      onClose();
    }, 300);
  }, [form, onSave, onClose]);

  return (
    <HawkeyeFormDrawer
      isOpen={isOpen}
      title={item ? 'Edit Item' : 'New Item'}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      sections={[
        {
          title: 'Catalog & Identification',
          children: (
            <>
              <HawkeyeFormField
                type="select"
                label="Catalog (FSIN)"
                value={form.fsin_code}
                onChange={handleCatalogChange}
                options={catalogOptions}
                required
                placeholder="Select a catalog item..."
              />
              {selectedCatalog && (
                <StyledFieldRow>
                  <HawkeyeFormField
                    type="text"
                    label="Category"
                    value={selectedCatalog.category}
                    onChange={() => {}}
                    disabled
                  />
                  <HawkeyeFormField
                    type="text"
                    label="Product Name"
                    value={form.product_name}
                    onChange={set('product_name')}
                    disabled
                  />
                </StyledFieldRow>
              )}
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Item Code"
                  value={form.item_code}
                  onChange={set('item_code')}
                  required
                  placeholder="ITM-BED-001-01"
                />
                <HawkeyeFormField
                  type="number"
                  label="Serial No"
                  value={form.serial_no}
                  onChange={set('serial_no')}
                  placeholder="1"
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="text"
                label="QA Flag"
                value={form.qa_flag}
                onChange={set('qa_flag')}
                placeholder="Passed"
              />
            </>
          ),
        },
        {
          title: 'State & Location',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="select"
                  label="State"
                  value={form.state}
                  onChange={set('state')}
                  options={stateOptions}
                  required
                />
                <HawkeyeFormField
                  type="text"
                  label="Location"
                  value={form.location}
                  onChange={set('location')}
                  placeholder="PID-09B / Warehouse"
                />
              </StyledFieldRow>
            </>
          ),
        },
        {
          title: 'Pricing & Documents',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="number"
                  label="Unit Price (₹)"
                  value={form.unit_price}
                  onChange={set('unit_price')}
                  required
                  placeholder="0"
                />
                <HawkeyeFormField
                  type="number"
                  label="GST (%)"
                  value={form.gst_percent}
                  onChange={set('gst_percent')}
                  placeholder="18"
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="text"
                label="Bill Document ID"
                value={form.bill_document_id}
                onChange={set('bill_document_id')}
                placeholder="BILL-2025-001"
              />
            </>
          ),
        },
      ]}
    />
  );
};
