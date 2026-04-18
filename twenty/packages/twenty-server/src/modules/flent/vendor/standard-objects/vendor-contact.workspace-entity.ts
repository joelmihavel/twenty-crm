import {
  type AddressMetadata,
  type EmailsMetadata,
  type PhonesMetadata,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type VendorWorkspaceEntity } from 'src/modules/flent/vendor/standard-objects/vendor.workspace-entity';

export class VendorContactWorkspaceEntity extends BaseWorkspaceEntity {
  contactName: string | null;
  phones: PhonesMetadata;
  emails: EmailsMetadata;
  city: string | null;
  address: AddressMetadata | null;

  // Relation to Vendor (MANY_TO_ONE, semantically 1:1)
  vendor: EntityRelation<VendorWorkspaceEntity> | null;
  vendorId: string | null;
}
