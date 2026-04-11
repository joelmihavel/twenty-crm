import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const PO_LINE_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'PO Lines',
  labelSingular: 'PO Line',
  namePlural: 'poLines',
  nameSingular: 'poLine',
  icon: 'IconListNumbers',
  description:
    'Individual line items within a Purchase Order with FSIN references, quantities, pricing, and auto-calculated line amounts',
  skipNameField: true,
};
