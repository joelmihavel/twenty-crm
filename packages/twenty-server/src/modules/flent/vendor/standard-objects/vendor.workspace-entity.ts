import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type VendorContactWorkspaceEntity } from 'src/modules/flent/vendor/standard-objects/vendor-contact.workspace-entity';
import { type VendorBillingWorkspaceEntity } from 'src/modules/flent/vendor/standard-objects/vendor-billing.workspace-entity';
import { type VendorCapabilityWorkspaceEntity } from 'src/modules/flent/vendor/standard-objects/vendor-capability.workspace-entity';
import { type VendorCommercialsWorkspaceEntity } from 'src/modules/flent/vendor/standard-objects/vendor-commercials.workspace-entity';

const VENDOR_NAME_FIELD = 'vendorName';
const VENDOR_CODE_FIELD = 'vendorCode';

export const SEARCH_FIELDS_FOR_VENDOR: FieldTypeAndNameMetadata[] = [
  { name: VENDOR_NAME_FIELD, type: FieldMetadataType.TEXT },
  { name: VENDOR_CODE_FIELD, type: FieldMetadataType.TEXT },
];

export class VendorWorkspaceEntity extends BaseWorkspaceEntity {
  vendorCode: string;
  vendorName: string;
  vendorType: string | null;
  status: string | null;

  // Relations to extensions
  vendorContacts: EntityRelation<VendorContactWorkspaceEntity[]>;
  vendorBillings: EntityRelation<VendorBillingWorkspaceEntity[]>;
  vendorCapabilities: EntityRelation<VendorCapabilityWorkspaceEntity[]>;
  vendorCommercials: EntityRelation<VendorCommercialsWorkspaceEntity[]>;

  searchVector: string;
}
