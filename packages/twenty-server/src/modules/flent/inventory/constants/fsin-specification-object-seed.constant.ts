import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const FSIN_SPECIFICATION_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'FSIN Specifications',
  labelSingular: 'FSIN Specification',
  namePlural: 'fsinSpecifications',
  nameSingular: 'fsinSpecification',
  icon: 'IconListDetails',
  description:
    'Physical specifications and attributes for a FSIN product',
  skipNameField: true,
};
