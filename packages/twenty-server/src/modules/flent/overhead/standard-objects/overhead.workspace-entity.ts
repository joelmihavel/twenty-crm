import { type LinksMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type PropertyWorkspaceEntity } from 'src/modules/flent/property/standard-objects/property.workspace-entity';
import { type MerchantWorkspaceEntity } from 'src/modules/flent/merchant/standard-objects/merchant.workspace-entity';
import { type OverheadMaintenanceWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead-maintenance.workspace-entity';
import { type OverheadWifiWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead-wifi.workspace-entity';
import { type OverheadElectricityWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead-electricity.workspace-entity';
import { type OverheadDgWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead-dg.workspace-entity';
import { type OverheadWaterWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead-water.workspace-entity';
import { type OverheadWaterPurifierWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead-water-purifier.workspace-entity';
import { type OverheadGasWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead-gas.workspace-entity';
import { type OverheadHelperWorkspaceEntity } from 'src/modules/flent/overhead/standard-objects/overhead-helper.workspace-entity';

export class OverheadWorkspaceEntity extends BaseWorkspaceEntity {
  categoryType: string | null;
  objectType: string | null;
  frequency: string | null;
  startDate: Date | null;
  endDate: Date | null;
  document: LinksMetadata | null;

  property: EntityRelation<PropertyWorkspaceEntity> | null;
  propertyId: string | null;
  merchant: EntityRelation<MerchantWorkspaceEntity> | null;
  merchantId: string | null;

  overheadMaintenances: EntityRelation<OverheadMaintenanceWorkspaceEntity[]>;
  overheadWifis: EntityRelation<OverheadWifiWorkspaceEntity[]>;
  overheadElectricities: EntityRelation<OverheadElectricityWorkspaceEntity[]>;
  overheadDgs: EntityRelation<OverheadDgWorkspaceEntity[]>;
  overheadWaters: EntityRelation<OverheadWaterWorkspaceEntity[]>;
  overheadWaterPurifiers: EntityRelation<OverheadWaterPurifierWorkspaceEntity[]>;
  overheadGases: EntityRelation<OverheadGasWorkspaceEntity[]>;
  overheadHelpers: EntityRelation<OverheadHelperWorkspaceEntity[]>;
}
