import { type CurrencyMetadata, type PhonesMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type OverheadWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead.workspace-entity';

export class OverheadHelperWorkspaceEntity extends BaseWorkspaceEntity {
  helperName: string | null;
  helperPhone: PhonesMetadata | null;
  helperRole: string | null;
  helperSalary: CurrencyMetadata | null;
  helperHours: string | null;
  helperResponsibilities: string | null;
  helperPayToLl: boolean | null;
  helperCollectTenant: boolean | null;

  overhead: EntityRelation<OverheadWorkspaceEntity> | null;
  overheadId: string | null;
}
