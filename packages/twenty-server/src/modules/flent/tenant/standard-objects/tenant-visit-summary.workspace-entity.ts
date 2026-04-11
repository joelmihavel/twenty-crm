import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type TenantWorkspaceEntity } from 'src/modules/flent/tenant/standard-objects/tenant.workspace-entity';

export class TenantVisitSummaryWorkspaceEntity extends BaseWorkspaceEntity {
  totalVisitsCount: number | null;
  visitsCancelled: number | null;
  visitsCompleted: number | null;
  firstVisitDate: Date | null;
  ridsVisited: string | null;
  feedback: string | null;

  // Relation to Tenant (MANY_TO_ONE, semantically 1:1)
  tenant: EntityRelation<TenantWorkspaceEntity> | null;
  tenantId: string | null;
}
