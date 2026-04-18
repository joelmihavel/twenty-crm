import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type TenantWorkspaceEntity } from 'src/modules/flent/tenant/standard-objects/tenant.workspace-entity';

export class TenantSatisfactionWorkspaceEntity extends BaseWorkspaceEntity {
  onboardingCsatScore: number | null;
  offboardingCsatScore: number | null;
  lastNpsScore: number | null;
  lastNpsDate: Date | null;
  npsCategory: string | null;
  lastNpsComment: string | null;

  // Relation to Tenant (MANY_TO_ONE, semantically 1:1)
  tenant: EntityRelation<TenantWorkspaceEntity> | null;
  tenantId: string | null;
}
