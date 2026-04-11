import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type TenantWorkspaceEntity } from 'src/modules/flent/tenant/standard-objects/tenant.workspace-entity';

export class TenantAttributionWorkspaceEntity extends BaseWorkspaceEntity {
  // Attribution tracking
  createDate: string | null;
  firstInquiryChannel: string | null;
  sourceDrilldown1: string | null;
  sourceDrilldown2: string | null;
  waxCode: string | null;

  // Click IDs
  googleClickId: string | null;
  facebookClickId: string | null;

  // UTM Parameters
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;

  // Relation to Tenant (MANY_TO_ONE, semantically 1:1)
  tenant: EntityRelation<TenantWorkspaceEntity> | null;
  tenantId: string | null;
}
