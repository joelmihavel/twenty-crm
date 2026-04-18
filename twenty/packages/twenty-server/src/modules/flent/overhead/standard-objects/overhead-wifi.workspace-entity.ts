import { type CurrencyMetadata, type PhonesMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type OverheadWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead.workspace-entity';

export class OverheadWifiWorkspaceEntity extends BaseWorkspaceEntity {
  wifiProvider: string | null;
  wifiAccountId: string | null;
  wifiStartDate: Date | null;
  wifiPlanDuration: number | null;
  wifiEndDate: Date | null;
  wifiPlanCost: CurrencyMetadata | null;
  wifiSsid: string | null;
  wifiPassword: string | null;
  wifiOwnership: string | null;
  wifiAmount: CurrencyMetadata | null;
  wifiRegisteredNumber: PhonesMetadata | null;
  wifiCollectTenant: boolean | null;
  wifiPayToLl: boolean | null;

  overhead: EntityRelation<OverheadWorkspaceEntity> | null;
  overheadId: string | null;
}
