// This seed is added to the junctionFields array in DevSeederMetadataService.
// It creates PoLine.fsin (MANY_TO_ONE) and FSIN.poLines (ONE_TO_MANY inverse).

export const PO_LINE_FSIN_RELATION_FIELD_SEED: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
} = {
  sourceObjectName: 'poLine',
  name: 'fsin',
  label: 'FSIN',
  icon: 'IconBarcode',
  targetObjectName: 'fsin',
  targetFieldLabel: 'PO Lines',
  targetFieldIcon: 'IconFileInvoice',
};
