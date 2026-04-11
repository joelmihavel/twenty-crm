import { type LinksMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type TenantWorkspaceEntity } from 'src/modules/flent/tenant/standard-objects/tenant.workspace-entity';

export class TenantQualificationWorkspaceEntity extends BaseWorkspaceEntity {
  qualificationStatus: string | null;
  disqualificationReason: string | null;
  disqualificationDetail: string | null;
  bgvStatus: string | null;
  bgvReport: LinksMetadata | null;
  bgvCompletedDate: Date | null;

  // Relation to Tenant (MANY_TO_ONE, semantically 1:1)
  tenant: EntityRelation<TenantWorkspaceEntity> | null;
  tenantId: string | null;
}
