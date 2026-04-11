import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type VendorWorkspaceEntity } from 'src/modules/flent/vendor/standard-objects/vendor.workspace-entity';

export class VendorBillingWorkspaceEntity extends BaseWorkspaceEntity {
  gstNumber: string | null;
  pan: string | null;
  billingName: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  ifscCode: string | null;
  msmeVendor: string | null;
  udyamAadhaar: string | null;

  // Relation to Vendor (MANY_TO_ONE, semantically 1:1)
  vendor: EntityRelation<VendorWorkspaceEntity> | null;
  vendorId: string | null;
}
