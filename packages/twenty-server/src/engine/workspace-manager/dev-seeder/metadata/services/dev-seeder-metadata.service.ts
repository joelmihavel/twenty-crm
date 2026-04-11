import { Injectable } from '@nestjs/common';

import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { COMPANY_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/company-custom-field-seeds.constant';
import { PERSON_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/person-custom-field-seeds.constant';
import { PET_CARE_AGREEMENT_CARETAKER_MORPH_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/pet-care-agreement-custom-relation-field-seeds.constant';
import { PET_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/pet-custom-field-seeds.constant';
import { PET_CUSTOM_RELATION_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/pet-custom-relation-field-seeds.constant';
import { SURVEY_RESULT_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/survey-results-field-seeds.constant';
import { EMPLOYMENT_HISTORY_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/employment-history-custom-object-seed.constant';
import { PET_CARE_AGREEMENT_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/pet-care-agreement-custom-object-seed.constant';
import { PET_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/pet-custom-object-seed.constant';
import { ROCKET_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/rocket-custom-object-seed.constant';
import { SURVEY_RESULT_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/survey-results-object-seed.constant';
import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

// --- Flent Phase 1: Tenant ---
import { TENANT_OBJECT_SEED } from 'src/modules/flent/tenant/constants/tenant-object-seed.constant';
import { TENANT_FIELD_SEEDS } from 'src/modules/flent/tenant/constants/tenant-field-seeds.constant';
import { TENANT_ATTRIBUTION_OBJECT_SEED } from 'src/modules/flent/tenant/constants/tenant-attribution-object-seed.constant';
import { TENANT_ATTRIBUTION_FIELD_SEEDS } from 'src/modules/flent/tenant/constants/tenant-attribution-field-seeds.constant';
import { TENANT_REQUIREMENTS_OBJECT_SEED } from 'src/modules/flent/tenant/constants/tenant-requirements-object-seed.constant';
import { TENANT_REQUIREMENTS_FIELD_SEEDS } from 'src/modules/flent/tenant/constants/tenant-requirements-field-seeds.constant';
import { TENANT_QUALIFICATION_OBJECT_SEED } from 'src/modules/flent/tenant/constants/tenant-qualification-object-seed.constant';
import { TENANT_QUALIFICATION_FIELD_SEEDS } from 'src/modules/flent/tenant/constants/tenant-qualification-field-seeds.constant';
import { TENANT_VISIT_SUMMARY_OBJECT_SEED } from 'src/modules/flent/tenant/constants/tenant-visit-summary-object-seed.constant';
import { TENANT_VISIT_SUMMARY_FIELD_SEEDS } from 'src/modules/flent/tenant/constants/tenant-visit-summary-field-seeds.constant';
import { TENANT_SATISFACTION_OBJECT_SEED } from 'src/modules/flent/tenant/constants/tenant-satisfaction-object-seed.constant';
import { TENANT_SATISFACTION_FIELD_SEEDS } from 'src/modules/flent/tenant/constants/tenant-satisfaction-field-seeds.constant';

// --- Flent Phase 1: Merchant ---
import { MERCHANT_OBJECT_SEED } from 'src/modules/flent/merchant/constants/merchant-object-seed.constant';
import { MERCHANT_FIELD_SEEDS } from 'src/modules/flent/merchant/constants/merchant-field-seeds.constant';
import { MERCHANT_LANDLORD_OBJECT_SEED } from 'src/modules/flent/merchant/constants/merchant-landlord-object-seed.constant';
import { MERCHANT_LANDLORD_FIELD_SEEDS } from 'src/modules/flent/merchant/constants/merchant-landlord-field-seeds.constant';
import { MERCHANT_POC_OBJECT_SEED } from 'src/modules/flent/merchant/constants/merchant-poc-object-seed.constant';
import { MERCHANT_BROKER_OBJECT_SEED } from 'src/modules/flent/merchant/constants/merchant-broker-object-seed.constant';
import { MERCHANT_MANAGEMENT_OBJECT_SEED } from 'src/modules/flent/merchant/constants/merchant-management-object-seed.constant';

// --- Flent Phase 1: Vendor ---
import { VENDOR_OBJECT_SEED } from 'src/modules/flent/vendor/constants/vendor-object-seed.constant';
import { VENDOR_FIELD_SEEDS } from 'src/modules/flent/vendor/constants/vendor-field-seeds.constant';
import { VENDOR_CONTACT_OBJECT_SEED } from 'src/modules/flent/vendor/constants/vendor-contact-object-seed.constant';
import { VENDOR_CONTACT_FIELD_SEEDS } from 'src/modules/flent/vendor/constants/vendor-contact-field-seeds.constant';
import { VENDOR_BILLING_OBJECT_SEED } from 'src/modules/flent/vendor/constants/vendor-billing-object-seed.constant';
import { VENDOR_BILLING_FIELD_SEEDS } from 'src/modules/flent/vendor/constants/vendor-billing-field-seeds.constant';
import { VENDOR_CAPABILITY_OBJECT_SEED } from 'src/modules/flent/vendor/constants/vendor-capability-object-seed.constant';
import { VENDOR_CAPABILITY_FIELD_SEEDS } from 'src/modules/flent/vendor/constants/vendor-capability-field-seeds.constant';
import { VENDOR_COMMERCIALS_OBJECT_SEED } from 'src/modules/flent/vendor/constants/vendor-commercials-object-seed.constant';
import { VENDOR_COMMERCIALS_FIELD_SEEDS } from 'src/modules/flent/vendor/constants/vendor-commercials-field-seeds.constant';

// --- Flent Phase 2: Property ---
import { PROPERTY_OBJECT_SEED } from 'src/modules/flent/property/constants/property-object-seed.constant';
import { PROPERTY_FIELD_SEEDS } from 'src/modules/flent/property/constants/property-field-seeds.constant';
import { PROPERTY_LEAD_STAGE_OBJECT_SEED } from 'src/modules/flent/property/constants/property-lead-stage-object-seed.constant';
import { PROPERTY_LEAD_STAGE_FIELD_SEEDS } from 'src/modules/flent/property/constants/property-lead-stage-field-seeds.constant';
import { PROPERTY_ACTIVE_OBJECT_SEED } from 'src/modules/flent/property/constants/property-active-object-seed.constant';
import { PROPERTY_ACTIVE_FIELD_SEEDS } from 'src/modules/flent/property/constants/property-active-field-seeds.constant';
import { PROPERTY_CHURNED_OBJECT_SEED } from 'src/modules/flent/property/constants/property-churned-object-seed.constant';
import { PROPERTY_CHURNED_FIELD_SEEDS } from 'src/modules/flent/property/constants/property-churned-field-seeds.constant';

// --- Flent Phase 2: Room ---
import { ROOM_OBJECT_SEED } from 'src/modules/flent/room/constants/room-object-seed.constant';
import { ROOM_FIELD_SEEDS } from 'src/modules/flent/room/constants/room-field-seeds.constant';
import { ROOM_SPECIFICATIONS_OBJECT_SEED } from 'src/modules/flent/room/constants/room-specifications-object-seed.constant';
import { ROOM_SPECIFICATIONS_FIELD_SEEDS } from 'src/modules/flent/room/constants/room-specifications-field-seeds.constant';
import { ROOM_FURNISHING_OBJECT_SEED } from 'src/modules/flent/room/constants/room-furnishing-object-seed.constant';
import { ROOM_FURNISHING_FIELD_SEEDS } from 'src/modules/flent/room/constants/room-furnishing-field-seeds.constant';
import { ROOM_COMMERCIALS_OBJECT_SEED } from 'src/modules/flent/room/constants/room-commercials-object-seed.constant';
import { ROOM_COMMERCIALS_FIELD_SEEDS } from 'src/modules/flent/room/constants/room-commercials-field-seeds.constant';
import { ROOM_AVAILABILITY_OBJECT_SEED } from 'src/modules/flent/room/constants/room-availability-object-seed.constant';
import { ROOM_AVAILABILITY_FIELD_SEEDS } from 'src/modules/flent/room/constants/room-availability-field-seeds.constant';

// --- Flent Phase 2: Overhead ---
import { OVERHEAD_OBJECT_SEED } from 'src/modules/flent/overhead/constants/overhead-object-seed.constant';
import { OVERHEAD_FIELD_SEEDS } from 'src/modules/flent/overhead/constants/overhead-field-seeds.constant';
import { OVERHEAD_MAINTENANCE_OBJECT_SEED } from 'src/modules/flent/overhead/constants/overhead-maintenance-object-seed.constant';
import { OVERHEAD_MAINTENANCE_FIELD_SEEDS } from 'src/modules/flent/overhead/constants/overhead-maintenance-field-seeds.constant';
import { OVERHEAD_WIFI_OBJECT_SEED } from 'src/modules/flent/overhead/constants/overhead-wifi-object-seed.constant';
import { OVERHEAD_WIFI_FIELD_SEEDS } from 'src/modules/flent/overhead/constants/overhead-wifi-field-seeds.constant';
import { OVERHEAD_ELECTRICITY_OBJECT_SEED } from 'src/modules/flent/overhead/constants/overhead-electricity-object-seed.constant';
import { OVERHEAD_ELECTRICITY_FIELD_SEEDS } from 'src/modules/flent/overhead/constants/overhead-electricity-field-seeds.constant';
import { OVERHEAD_DG_OBJECT_SEED } from 'src/modules/flent/overhead/constants/overhead-dg-object-seed.constant';
import { OVERHEAD_DG_FIELD_SEEDS } from 'src/modules/flent/overhead/constants/overhead-dg-field-seeds.constant';
import { OVERHEAD_WATER_OBJECT_SEED } from 'src/modules/flent/overhead/constants/overhead-water-object-seed.constant';
import { OVERHEAD_WATER_FIELD_SEEDS } from 'src/modules/flent/overhead/constants/overhead-water-field-seeds.constant';
import { OVERHEAD_WATER_PURIFIER_OBJECT_SEED } from 'src/modules/flent/overhead/constants/overhead-water-purifier-object-seed.constant';
import { OVERHEAD_WATER_PURIFIER_FIELD_SEEDS } from 'src/modules/flent/overhead/constants/overhead-water-purifier-field-seeds.constant';
import { OVERHEAD_GAS_OBJECT_SEED } from 'src/modules/flent/overhead/constants/overhead-gas-object-seed.constant';
import { OVERHEAD_GAS_FIELD_SEEDS } from 'src/modules/flent/overhead/constants/overhead-gas-field-seeds.constant';
import { OVERHEAD_HELPER_OBJECT_SEED } from 'src/modules/flent/overhead/constants/overhead-helper-object-seed.constant';
import { OVERHEAD_HELPER_FIELD_SEEDS } from 'src/modules/flent/overhead/constants/overhead-helper-field-seeds.constant';

// --- Flent Phase 5: Ticket ---
import { TICKET_OBJECT_SEED } from 'src/modules/flent/ticket/constants/ticket-object-seed.constant';
import { TICKET_FIELD_SEEDS } from 'src/modules/flent/ticket/constants/ticket-field-seeds.constant';
import { TICKET_RELATION_FIELD_SEEDS } from 'src/modules/flent/ticket/constants/ticket-relation-field-seeds.constant';
import { TENANT_TICKET_DETAILS_OBJECT_SEED } from 'src/modules/flent/ticket/constants/tenant-ticket-details-object-seed.constant';
import { TENANT_TICKET_DETAILS_FIELD_SEEDS } from 'src/modules/flent/ticket/constants/tenant-ticket-details-field-seeds.constant';
import { TENANT_TICKET_DETAILS_RELATION_FIELD_SEEDS } from 'src/modules/flent/ticket/constants/tenant-ticket-details-relation-field-seeds.constant';
import { VENDOR_TICKET_DETAILS_OBJECT_SEED } from 'src/modules/flent/ticket/constants/vendor-ticket-details-object-seed.constant';
import { VENDOR_TICKET_DETAILS_FIELD_SEEDS } from 'src/modules/flent/ticket/constants/vendor-ticket-details-field-seeds.constant';
import { VENDOR_TICKET_DETAILS_RELATION_FIELD_SEEDS } from 'src/modules/flent/ticket/constants/vendor-ticket-details-relation-field-seeds.constant';

// --- Flent Phase 6: Inventory (FSIN + Specification) ---
import { FSIN_OBJECT_SEED } from 'src/modules/flent/inventory/constants/fsin-object-seed.constant';
import { FSIN_FIELD_SEEDS } from 'src/modules/flent/inventory/constants/fsin-field-seeds.constant';
import { FSIN_RELATION_FIELD_SEEDS } from 'src/modules/flent/inventory/constants/fsin-relation-field-seeds.constant';
import { FSIN_SPECIFICATION_OBJECT_SEED } from 'src/modules/flent/inventory/constants/fsin-specification-object-seed.constant';
import { FSIN_SPECIFICATION_FIELD_SEEDS } from 'src/modules/flent/inventory/constants/fsin-specification-field-seeds.constant';
import { FSIN_SPECIFICATION_RELATION_FIELD_SEEDS } from 'src/modules/flent/inventory/constants/fsin-specification-relation-field-seeds.constant';

// --- Flent Phase 6: Inventory (Item + ItemState + ItemTransactionLinks) ---
import { ITEM_OBJECT_SEED } from 'src/modules/flent/inventory/constants/item-object-seed.constant';
import { ITEM_FIELD_SEEDS } from 'src/modules/flent/inventory/constants/item-field-seeds.constant';
import { ITEM_RELATION_FIELD_SEEDS } from 'src/modules/flent/inventory/constants/item-relation-field-seeds.constant';
import { ITEM_STATE_OBJECT_SEED } from 'src/modules/flent/inventory/constants/item-state-object-seed.constant';
import { ITEM_STATE_FIELD_SEEDS } from 'src/modules/flent/inventory/constants/item-state-field-seeds.constant';
import { ITEM_STATE_RELATION_FIELD_SEEDS } from 'src/modules/flent/inventory/constants/item-state-relation-field-seeds.constant';
import { ITEM_TRANSACTION_LINKS_OBJECT_SEED } from 'src/modules/flent/inventory/constants/item-transaction-links-object-seed.constant';
import { ITEM_TRANSACTION_LINKS_FIELD_SEEDS } from 'src/modules/flent/inventory/constants/item-transaction-links-field-seeds.constant';
import { ITEM_TRANSACTION_LINKS_RELATION_FIELD_SEEDS } from 'src/modules/flent/inventory/constants/item-transaction-links-relation-field-seeds.constant';
import { PO_LINE_FSIN_RELATION_FIELD_SEED } from 'src/modules/flent/inventory/constants/po-line-fsin-relation-field-seed.constant';

type MorphRelationSeed = FieldMetadataSeed & {
  targetObjectMetadataNames: string[];
};

type JunctionFieldSeed = {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
};

type JunctionConfigSeed = {
  objectName: string;
  fieldName: string;
  junctionTargetFieldRef: string;
  label?: string;
};

type WorkspaceSeedConfig = {
  objects: { seed: ObjectMetadataSeed; fields?: FieldMetadataSeed[] }[];
  fields: { objectName: string; seeds: FieldMetadataSeed[] }[];
  morphRelations?: { objectName: string; seeds: MorphRelationSeed[] }[];
  junctionFields?: JunctionFieldSeed[];
  junctionConfigs?: JunctionConfigSeed[];
};

type FlatMaps = {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  objectIdByName: Record<string, string>;
};

@Injectable()
export class DevSeederMetadataService {
  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  private readonly workspaceConfigs: Record<string, WorkspaceSeedConfig> = {
    [SEED_APPLE_WORKSPACE_ID]: {
      objects: [
        { seed: ROCKET_CUSTOM_OBJECT_SEED },
        { seed: PET_CUSTOM_OBJECT_SEED, fields: PET_CUSTOM_FIELD_SEEDS },
        {
          seed: SURVEY_RESULT_CUSTOM_OBJECT_SEED,
          fields: SURVEY_RESULT_CUSTOM_FIELD_SEEDS,
        },
        // Junction objects (minimal pivots)
        { seed: EMPLOYMENT_HISTORY_CUSTOM_OBJECT_SEED },
        { seed: PET_CARE_AGREEMENT_CUSTOM_OBJECT_SEED },

        // --- Flent Phase 1: Tenant (base + 5 extensions) ---
        { seed: TENANT_OBJECT_SEED, fields: TENANT_FIELD_SEEDS },
        { seed: TENANT_ATTRIBUTION_OBJECT_SEED, fields: TENANT_ATTRIBUTION_FIELD_SEEDS },
        { seed: TENANT_REQUIREMENTS_OBJECT_SEED, fields: TENANT_REQUIREMENTS_FIELD_SEEDS },
        { seed: TENANT_QUALIFICATION_OBJECT_SEED, fields: TENANT_QUALIFICATION_FIELD_SEEDS },
        { seed: TENANT_VISIT_SUMMARY_OBJECT_SEED, fields: TENANT_VISIT_SUMMARY_FIELD_SEEDS },
        { seed: TENANT_SATISFACTION_OBJECT_SEED, fields: TENANT_SATISFACTION_FIELD_SEEDS },

        // --- Flent Phase 1: Merchant (base + 4 extensions) ---
        { seed: MERCHANT_OBJECT_SEED, fields: MERCHANT_FIELD_SEEDS },
        { seed: MERCHANT_LANDLORD_OBJECT_SEED, fields: MERCHANT_LANDLORD_FIELD_SEEDS },
        { seed: MERCHANT_POC_OBJECT_SEED },
        { seed: MERCHANT_BROKER_OBJECT_SEED },
        { seed: MERCHANT_MANAGEMENT_OBJECT_SEED },

        // --- Flent Phase 1: Vendor (base + 4 extensions) ---
        { seed: VENDOR_OBJECT_SEED, fields: VENDOR_FIELD_SEEDS },
        { seed: VENDOR_CONTACT_OBJECT_SEED, fields: VENDOR_CONTACT_FIELD_SEEDS },
        { seed: VENDOR_BILLING_OBJECT_SEED, fields: VENDOR_BILLING_FIELD_SEEDS },
        { seed: VENDOR_CAPABILITY_OBJECT_SEED, fields: VENDOR_CAPABILITY_FIELD_SEEDS },
        { seed: VENDOR_COMMERCIALS_OBJECT_SEED, fields: VENDOR_COMMERCIALS_FIELD_SEEDS },

        // --- Flent Phase 2: Property ---
        { seed: PROPERTY_OBJECT_SEED, fields: PROPERTY_FIELD_SEEDS },
        { seed: PROPERTY_LEAD_STAGE_OBJECT_SEED, fields: PROPERTY_LEAD_STAGE_FIELD_SEEDS },
        { seed: PROPERTY_ACTIVE_OBJECT_SEED, fields: PROPERTY_ACTIVE_FIELD_SEEDS },
        { seed: PROPERTY_CHURNED_OBJECT_SEED, fields: PROPERTY_CHURNED_FIELD_SEEDS },

        // --- Flent Phase 2: Room ---
        { seed: ROOM_OBJECT_SEED, fields: ROOM_FIELD_SEEDS },
        { seed: ROOM_SPECIFICATIONS_OBJECT_SEED, fields: ROOM_SPECIFICATIONS_FIELD_SEEDS },
        { seed: ROOM_FURNISHING_OBJECT_SEED, fields: ROOM_FURNISHING_FIELD_SEEDS },
        { seed: ROOM_COMMERCIALS_OBJECT_SEED, fields: ROOM_COMMERCIALS_FIELD_SEEDS },
        { seed: ROOM_AVAILABILITY_OBJECT_SEED, fields: ROOM_AVAILABILITY_FIELD_SEEDS },

        // --- Flent Phase 2: Overhead ---
        { seed: OVERHEAD_OBJECT_SEED, fields: OVERHEAD_FIELD_SEEDS },
        { seed: OVERHEAD_MAINTENANCE_OBJECT_SEED, fields: OVERHEAD_MAINTENANCE_FIELD_SEEDS },
        { seed: OVERHEAD_WIFI_OBJECT_SEED, fields: OVERHEAD_WIFI_FIELD_SEEDS },
        { seed: OVERHEAD_ELECTRICITY_OBJECT_SEED, fields: OVERHEAD_ELECTRICITY_FIELD_SEEDS },
        { seed: OVERHEAD_DG_OBJECT_SEED, fields: OVERHEAD_DG_FIELD_SEEDS },
        { seed: OVERHEAD_WATER_OBJECT_SEED, fields: OVERHEAD_WATER_FIELD_SEEDS },
        { seed: OVERHEAD_WATER_PURIFIER_OBJECT_SEED, fields: OVERHEAD_WATER_PURIFIER_FIELD_SEEDS },
        { seed: OVERHEAD_GAS_OBJECT_SEED, fields: OVERHEAD_GAS_FIELD_SEEDS },
        { seed: OVERHEAD_HELPER_OBJECT_SEED, fields: OVERHEAD_HELPER_FIELD_SEEDS },

        // --- Flent Phase 5: Ticket (base + 2 extensions) ---
        { seed: TICKET_OBJECT_SEED, fields: TICKET_FIELD_SEEDS },
        { seed: TENANT_TICKET_DETAILS_OBJECT_SEED, fields: TENANT_TICKET_DETAILS_FIELD_SEEDS },
        { seed: VENDOR_TICKET_DETAILS_OBJECT_SEED, fields: VENDOR_TICKET_DETAILS_FIELD_SEEDS },

        // --- Flent Phase 6: Inventory (FSIN + Specification) ---
        { seed: FSIN_OBJECT_SEED, fields: FSIN_FIELD_SEEDS },
        { seed: FSIN_SPECIFICATION_OBJECT_SEED, fields: FSIN_SPECIFICATION_FIELD_SEEDS },

        // --- Flent Phase 6: Inventory (Item + extensions) ---
        { seed: ITEM_OBJECT_SEED, fields: ITEM_FIELD_SEEDS },
        { seed: ITEM_STATE_OBJECT_SEED, fields: ITEM_STATE_FIELD_SEEDS },
        { seed: ITEM_TRANSACTION_LINKS_OBJECT_SEED, fields: ITEM_TRANSACTION_LINKS_FIELD_SEEDS },
      ],
      fields: [
        { objectName: 'company', seeds: COMPANY_CUSTOM_FIELD_SEEDS },
        { objectName: 'person', seeds: PERSON_CUSTOM_FIELD_SEEDS },
      ],
      morphRelations: [
        {
          objectName: PET_CUSTOM_OBJECT_SEED.nameSingular,
          seeds: PET_CUSTOM_RELATION_FIELD_SEEDS,
        },
        {
          objectName: PET_CARE_AGREEMENT_CUSTOM_OBJECT_SEED.nameSingular,
          seeds: [PET_CARE_AGREEMENT_CARETAKER_MORPH_SEED],
        },
      ],
      junctionFields: [
        // Employment History: Person <-> Company
        {
          sourceObjectName: 'person',
          name: 'previousCompanies',
          label: 'Previous Companies',
          icon: 'IconBuildingSkyscraper',
          targetObjectName: EMPLOYMENT_HISTORY_CUSTOM_OBJECT_SEED.nameSingular,
          targetFieldLabel: 'Person',
          targetFieldIcon: 'IconUser',
        },
        {
          sourceObjectName: 'company',
          name: 'previousEmployees',
          label: 'Previous Employees',
          icon: 'IconUser',
          targetObjectName: EMPLOYMENT_HISTORY_CUSTOM_OBJECT_SEED.nameSingular,
          targetFieldLabel: 'Company',
          targetFieldIcon: 'IconBuildingSkyscraper',
        },
        // Pet Care Agreement: Pet -> caretakers
        {
          sourceObjectName: PET_CUSTOM_OBJECT_SEED.nameSingular,
          name: 'caretakers',
          label: 'Caretakers',
          icon: 'IconUser',
          targetObjectName: PET_CARE_AGREEMENT_CUSTOM_OBJECT_SEED.nameSingular,
          targetFieldLabel: 'Pet',
          targetFieldIcon: 'IconCat',
        },

        // --- Flent Tenant extensions ---
        {
          sourceObjectName: TENANT_OBJECT_SEED.nameSingular,
          name: 'tenantAttributions',
          label: 'Attributions',
          icon: 'IconTarget',
          targetObjectName: TENANT_ATTRIBUTION_OBJECT_SEED.nameSingular,
          targetFieldLabel: 'Tenant',
          targetFieldIcon: 'IconUser',
        },
        {
          sourceObjectName: TENANT_OBJECT_SEED.nameSingular,
          name: 'tenantRequirements',
          label: 'Requirements',
          icon: 'IconChecklist',
          targetObjectName: TENANT_REQUIREMENTS_OBJECT_SEED.nameSingular,
          targetFieldLabel: 'Tenant',
          targetFieldIcon: 'IconUser',
        },
        {
          sourceObjectName: TENANT_OBJECT_SEED.nameSingular,
          name: 'tenantQualifications',
          label: 'Qualifications',
          icon: 'IconShieldCheck',
          targetObjectName: TENANT_QUALIFICATION_OBJECT_SEED.nameSingular,
          targetFieldLabel: 'Tenant',
          targetFieldIcon: 'IconUser',
        },
        {
          sourceObjectName: TENANT_OBJECT_SEED.nameSingular,
          name: 'tenantVisitSummaries',
          label: 'Visit Summaries',
          icon: 'IconMapPin',
          targetObjectName: TENANT_VISIT_SUMMARY_OBJECT_SEED.nameSingular,
          targetFieldLabel: 'Tenant',
          targetFieldIcon: 'IconUser',
        },
        {
          sourceObjectName: TENANT_OBJECT_SEED.nameSingular,
          name: 'tenantSatisfactions',
          label: 'Satisfaction Scores',
          icon: 'IconStar',
          targetObjectName: TENANT_SATISFACTION_OBJECT_SEED.nameSingular,
          targetFieldLabel: 'Tenant',
          targetFieldIcon: 'IconUser',
        },

        // --- Flent Merchant extensions ---
        {
          sourceObjectName: MERCHANT_OBJECT_SEED.nameSingular,
          name: 'merchantLandlords',
          label: 'Landlord Details',
          icon: 'IconHome',
          targetObjectName: MERCHANT_LANDLORD_OBJECT_SEED.nameSingular,
          targetFieldLabel: 'Merchant',
          targetFieldIcon: 'IconBuildingSkyscraper',
        },
        {
          sourceObjectName: MERCHANT_OBJECT_SEED.nameSingular,
          name: 'merchantPocs',
          label: 'POC Details',
          icon: 'IconUserCircle',
          targetObjectName: MERCHANT_POC_OBJECT_SEED.nameSingular,
          targetFieldLabel: 'Merchant',
          targetFieldIcon: 'IconBuildingSkyscraper',
        },
        {
          sourceObjectName: MERCHANT_OBJECT_SEED.nameSingular,
          name: 'merchantBrokers',
          label: 'Broker Details',
          icon: 'IconBriefcase',
          targetObjectName: MERCHANT_BROKER_OBJECT_SEED.nameSingular,
          targetFieldLabel: 'Merchant',
          targetFieldIcon: 'IconBuildingSkyscraper',
        },
        {
          sourceObjectName: MERCHANT_OBJECT_SEED.nameSingular,
          name: 'merchantManagements',
          label: 'Management Details',
          icon: 'IconSettings',
          targetObjectName: MERCHANT_MANAGEMENT_OBJECT_SEED.nameSingular,
          targetFieldLabel: 'Merchant',
          targetFieldIcon: 'IconBuildingSkyscraper',
        },

        // --- Flent Vendor extensions ---
        {
          sourceObjectName: VENDOR_OBJECT_SEED.nameSingular,
          name: 'vendorContacts',
          label: 'Contacts',
          icon: 'IconAddressBook',
          targetObjectName: VENDOR_CONTACT_OBJECT_SEED.nameSingular,
          targetFieldLabel: 'Vendor',
          targetFieldIcon: 'IconTruck',
        },
        {
          sourceObjectName: VENDOR_OBJECT_SEED.nameSingular,
          name: 'vendorBillings',
          label: 'Billing Details',
          icon: 'IconFileInvoice',
          targetObjectName: VENDOR_BILLING_OBJECT_SEED.nameSingular,
          targetFieldLabel: 'Vendor',
          targetFieldIcon: 'IconTruck',
        },
        {
          sourceObjectName: VENDOR_OBJECT_SEED.nameSingular,
          name: 'vendorCapabilities',
          label: 'Capabilities',
          icon: 'IconTools',
          targetObjectName: VENDOR_CAPABILITY_OBJECT_SEED.nameSingular,
          targetFieldLabel: 'Vendor',
          targetFieldIcon: 'IconTruck',
        },
        {
          sourceObjectName: VENDOR_OBJECT_SEED.nameSingular,
          name: 'vendorCommercials',
          label: 'Commercials',
          icon: 'IconCash',
          targetObjectName: VENDOR_COMMERCIALS_OBJECT_SEED.nameSingular,
          targetFieldLabel: 'Vendor',
          targetFieldIcon: 'IconTruck',
        },

        // --- Property cross-domain ---
        { sourceObjectName: MERCHANT_OBJECT_SEED.nameSingular, name: 'properties', label: 'Properties', icon: 'IconBuilding', targetObjectName: PROPERTY_OBJECT_SEED.nameSingular, targetFieldLabel: 'Merchant', targetFieldIcon: 'IconBuildingSkyscraper' },
        { sourceObjectName: 'workspaceMember', name: 'dealOwnedProperties', label: 'Deal Owned Properties', icon: 'IconBuilding', targetObjectName: PROPERTY_OBJECT_SEED.nameSingular, targetFieldLabel: 'Deal Owner', targetFieldIcon: 'IconUser' },
        { sourceObjectName: 'workspaceMember', name: 'psmOwnedProperties', label: 'PSM Owned Properties', icon: 'IconBuilding', targetObjectName: PROPERTY_OBJECT_SEED.nameSingular, targetFieldLabel: 'PSM Owner', targetFieldIcon: 'IconUser' },

        // --- Property lifecycle extensions ---
        { sourceObjectName: PROPERTY_OBJECT_SEED.nameSingular, name: 'propertyLeadStages', label: 'Lead Stages', icon: 'IconFilter', targetObjectName: PROPERTY_LEAD_STAGE_OBJECT_SEED.nameSingular, targetFieldLabel: 'Property', targetFieldIcon: 'IconBuilding' },
        { sourceObjectName: PROPERTY_OBJECT_SEED.nameSingular, name: 'propertyActives', label: 'Active Details', icon: 'IconCircleCheck', targetObjectName: PROPERTY_ACTIVE_OBJECT_SEED.nameSingular, targetFieldLabel: 'Property', targetFieldIcon: 'IconBuilding' },
        { sourceObjectName: PROPERTY_OBJECT_SEED.nameSingular, name: 'propertyChurneds', label: 'Churned Details', icon: 'IconArrowBack', targetObjectName: PROPERTY_CHURNED_OBJECT_SEED.nameSingular, targetFieldLabel: 'Property', targetFieldIcon: 'IconBuilding' },

        // --- Room -> Property ---
        { sourceObjectName: PROPERTY_OBJECT_SEED.nameSingular, name: 'rooms', label: 'Rooms', icon: 'IconDoor', targetObjectName: ROOM_OBJECT_SEED.nameSingular, targetFieldLabel: 'Property', targetFieldIcon: 'IconBuilding' },

        // --- Room extensions ---
        { sourceObjectName: ROOM_OBJECT_SEED.nameSingular, name: 'roomSpecifications', label: 'Specifications', icon: 'IconRuler', targetObjectName: ROOM_SPECIFICATIONS_OBJECT_SEED.nameSingular, targetFieldLabel: 'Room', targetFieldIcon: 'IconDoor' },
        { sourceObjectName: ROOM_OBJECT_SEED.nameSingular, name: 'roomFurnishings', label: 'Furnishing Details', icon: 'IconArmchair', targetObjectName: ROOM_FURNISHING_OBJECT_SEED.nameSingular, targetFieldLabel: 'Room', targetFieldIcon: 'IconDoor' },
        { sourceObjectName: ROOM_OBJECT_SEED.nameSingular, name: 'roomCommercials', label: 'Commercials', icon: 'IconCash', targetObjectName: ROOM_COMMERCIALS_OBJECT_SEED.nameSingular, targetFieldLabel: 'Room', targetFieldIcon: 'IconDoor' },
        { sourceObjectName: ROOM_OBJECT_SEED.nameSingular, name: 'roomAvailabilities', label: 'Availability', icon: 'IconCalendarCheck', targetObjectName: ROOM_AVAILABILITY_OBJECT_SEED.nameSingular, targetFieldLabel: 'Room', targetFieldIcon: 'IconDoor' },

        // --- Overhead cross-domain ---
        { sourceObjectName: PROPERTY_OBJECT_SEED.nameSingular, name: 'overheads', label: 'Overheads', icon: 'IconReceipt', targetObjectName: OVERHEAD_OBJECT_SEED.nameSingular, targetFieldLabel: 'Property', targetFieldIcon: 'IconBuilding' },
        { sourceObjectName: MERCHANT_OBJECT_SEED.nameSingular, name: 'merchantOverheads', label: 'Merchant Overheads', icon: 'IconReceipt', targetObjectName: OVERHEAD_OBJECT_SEED.nameSingular, targetFieldLabel: 'Merchant', targetFieldIcon: 'IconBuildingSkyscraper' },

        // --- Overhead category extensions ---
        { sourceObjectName: OVERHEAD_OBJECT_SEED.nameSingular, name: 'overheadMaintenances', label: 'Maintenance Details', icon: 'IconTool', targetObjectName: OVERHEAD_MAINTENANCE_OBJECT_SEED.nameSingular, targetFieldLabel: 'Overhead', targetFieldIcon: 'IconReceipt' },
        { sourceObjectName: OVERHEAD_OBJECT_SEED.nameSingular, name: 'overheadWifis', label: 'WiFi Details', icon: 'IconWifi', targetObjectName: OVERHEAD_WIFI_OBJECT_SEED.nameSingular, targetFieldLabel: 'Overhead', targetFieldIcon: 'IconReceipt' },
        { sourceObjectName: OVERHEAD_OBJECT_SEED.nameSingular, name: 'overheadElectricities', label: 'Electricity Details', icon: 'IconBolt', targetObjectName: OVERHEAD_ELECTRICITY_OBJECT_SEED.nameSingular, targetFieldLabel: 'Overhead', targetFieldIcon: 'IconReceipt' },
        { sourceObjectName: OVERHEAD_OBJECT_SEED.nameSingular, name: 'overheadDgs', label: 'DG Details', icon: 'IconEngine', targetObjectName: OVERHEAD_DG_OBJECT_SEED.nameSingular, targetFieldLabel: 'Overhead', targetFieldIcon: 'IconReceipt' },
        { sourceObjectName: OVERHEAD_OBJECT_SEED.nameSingular, name: 'overheadWaters', label: 'Water Details', icon: 'IconDroplet', targetObjectName: OVERHEAD_WATER_OBJECT_SEED.nameSingular, targetFieldLabel: 'Overhead', targetFieldIcon: 'IconReceipt' },
        { sourceObjectName: OVERHEAD_OBJECT_SEED.nameSingular, name: 'overheadWaterPurifiers', label: 'Water Purifier Details', icon: 'IconFilter', targetObjectName: OVERHEAD_WATER_PURIFIER_OBJECT_SEED.nameSingular, targetFieldLabel: 'Overhead', targetFieldIcon: 'IconReceipt' },
        { sourceObjectName: OVERHEAD_OBJECT_SEED.nameSingular, name: 'overheadGases', label: 'Gas Details', icon: 'IconFlame', targetObjectName: OVERHEAD_GAS_OBJECT_SEED.nameSingular, targetFieldLabel: 'Overhead', targetFieldIcon: 'IconReceipt' },
        { sourceObjectName: OVERHEAD_OBJECT_SEED.nameSingular, name: 'overheadHelpers', label: 'Helper Details', icon: 'IconUsers', targetObjectName: OVERHEAD_HELPER_OBJECT_SEED.nameSingular, targetFieldLabel: 'Overhead', targetFieldIcon: 'IconReceipt' },

        // --- Flent Ticket relations ---
        // Ticket -> Property, Vendor, Transaction (MANY_TO_ONE, creates inverses)
        ...TICKET_RELATION_FIELD_SEEDS,
        // TenantTicketDetails -> Ticket, Room
        ...TENANT_TICKET_DETAILS_RELATION_FIELD_SEEDS,
        // VendorTicketDetails -> Ticket
        ...VENDOR_TICKET_DETAILS_RELATION_FIELD_SEEDS,

        // --- Flent Inventory relations (FSIN) ---
        // FSIN -> Vendor
        ...FSIN_RELATION_FIELD_SEEDS,
        // FsinSpecification -> FSIN
        ...FSIN_SPECIFICATION_RELATION_FIELD_SEEDS,

        // --- Flent Inventory relations (Item) ---
        // Item -> FSIN, PoLine
        ...ITEM_RELATION_FIELD_SEEDS,
        // ItemState -> Item
        ...ITEM_STATE_RELATION_FIELD_SEEDS,
        // ItemTransactionLinks -> Item, Transaction
        ...ITEM_TRANSACTION_LINKS_RELATION_FIELD_SEEDS,
        // PoLine -> FSIN (cross-wire)
        PO_LINE_FSIN_RELATION_FIELD_SEED,
      ],
      junctionConfigs: [
        // Employment History junction configs
        {
          objectName: 'person',
          fieldName: 'previousCompanies',
          junctionTargetFieldRef: `${EMPLOYMENT_HISTORY_CUSTOM_OBJECT_SEED.nameSingular}.company`,
        },
        {
          objectName: 'company',
          fieldName: 'previousEmployees',
          junctionTargetFieldRef: `${EMPLOYMENT_HISTORY_CUSTOM_OBJECT_SEED.nameSingular}.person`,
        },
        // Pet Care Agreement junction configs
        {
          objectName: PET_CUSTOM_OBJECT_SEED.nameSingular,
          fieldName: 'caretakers',
          junctionTargetFieldRef: `${PET_CARE_AGREEMENT_CUSTOM_OBJECT_SEED.nameSingular}.caretakerPerson`,
        },
        {
          objectName: 'company',
          fieldName: 'caredForPets',
          junctionTargetFieldRef: `${PET_CARE_AGREEMENT_CUSTOM_OBJECT_SEED.nameSingular}.pet`,
        },
        {
          objectName: 'person',
          fieldName: 'caredForPets',
          junctionTargetFieldRef: `${PET_CARE_AGREEMENT_CUSTOM_OBJECT_SEED.nameSingular}.pet`,
        },
      ],
    },
    [SEED_YCOMBINATOR_WORKSPACE_ID]: {
      objects: [
        {
          seed: SURVEY_RESULT_CUSTOM_OBJECT_SEED,
          fields: SURVEY_RESULT_CUSTOM_FIELD_SEEDS,
        },
      ],
      fields: [
        { objectName: 'company', seeds: COMPANY_CUSTOM_FIELD_SEEDS },
        { objectName: 'person', seeds: PERSON_CUSTOM_FIELD_SEEDS },
      ],
    },
  };

  private getLightConfig(_config: WorkspaceSeedConfig): WorkspaceSeedConfig {
    return {
      objects: [],
      fields: [],
    };
  }

  private getConfig(workspaceId: string, light: boolean): WorkspaceSeedConfig {
    const config = this.workspaceConfigs[workspaceId];

    if (!config) {
      throw new Error(
        `Workspace configuration not found for workspaceId: ${workspaceId}`,
      );
    }

    return light ? this.getLightConfig(config) : config;
  }

  public async seed({
    dataSourceMetadata,
    workspaceId,
    light = false,
  }: {
    dataSourceMetadata: DataSourceEntity;
    workspaceId: string;
    light?: boolean;
  }) {
    const config = this.getConfig(workspaceId, light);

    for (const obj of config.objects) {
      await this.seedCustomObject({
        dataSourceId: dataSourceMetadata.id,
        workspaceId,
        objectMetadataSeed: obj.seed,
      });

      if (obj.fields) {
        await this.seedCustomFields({
          workspaceId,
          objectMetadataNameSingular: obj.seed.nameSingular,
          fieldMetadataSeeds: obj.fields,
        });
      }
    }

    for (const fieldConfig of config.fields) {
      await this.seedCustomFields({
        workspaceId,
        objectMetadataNameSingular: fieldConfig.objectName,
        fieldMetadataSeeds: fieldConfig.seeds,
      });
    }
  }

  private async seedCustomObject({
    dataSourceId,
    workspaceId,
    objectMetadataSeed,
  }: {
    dataSourceId: string;
    workspaceId: string;
    objectMetadataSeed: ObjectMetadataSeed;
  }): Promise<void> {
    await this.objectMetadataService.createOneObject({
      createObjectInput: {
        ...objectMetadataSeed,
        dataSourceId,
      },
      workspaceId,
    });
  }

  private async seedCustomFields({
    workspaceId,
    objectMetadataNameSingular,
    fieldMetadataSeeds,
  }: {
    workspaceId: string;
    objectMetadataNameSingular: string;
    fieldMetadataSeeds: FieldMetadataSeed[];
  }): Promise<void> {
    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: { nameSingular: objectMetadataNameSingular },
      });

    if (!isDefined(objectMetadata)) {
      throw new Error(
        `Object metadata not found for: ${objectMetadataNameSingular}`,
      );
    }
    const createFieldInputs = fieldMetadataSeeds.map((fieldMetadataSeed) => ({
      ...fieldMetadataSeed,
      objectMetadataId: objectMetadata.id,
    }));

    await this.fieldMetadataService.createManyFields({
      createFieldInputs,
      workspaceId,
    });
  }

  public async seedRelations({
    workspaceId,
    light = false,
  }: {
    workspaceId: string;
    light?: boolean;
  }) {
    const config = this.getConfig(workspaceId, light);

    // 1. Seed morph relations (creates inverses on target objects)
    let maps = await this.getFreshFlatMaps(workspaceId);

    for (const relation of config.morphRelations ?? []) {
      await this.seedMorphRelations({
        workspaceId,
        relation,
        objectIdByNameSingular: maps.objectIdByName,
      });
    }

    // 2. Seed junction fields (creates relations + inverses on junction objects)
    maps = await this.getFreshFlatMaps(workspaceId);

    for (const field of config.junctionFields ?? []) {
      await this.seedJunctionField({ workspaceId, field, flatMaps: maps });
    }

    // 3. Configure junction settings (after all fields exist)
    if (config.junctionConfigs && config.junctionConfigs.length > 0) {
      maps = await this.getFreshFlatMaps(workspaceId);

      for (const junctionConfig of config.junctionConfigs) {
        await this.applyJunctionConfig({
          workspaceId,
          junctionConfig,
          flatMaps: maps,
        });
      }
    }
  }

  private async getFreshFlatMaps(workspaceId: string): Promise<FlatMaps> {
    await this.flatEntityMapsCacheService.invalidateFlatEntityMaps({
      workspaceId,
      flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
    });

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const { idByNameSingular } = buildObjectIdByNameMaps(
      flatObjectMetadataMaps,
    );

    return {
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      objectIdByName: idByNameSingular,
    };
  }

  private async applyJunctionConfig({
    workspaceId,
    junctionConfig,
    flatMaps,
  }: {
    workspaceId: string;
    junctionConfig: JunctionConfigSeed;
    flatMaps: FlatMaps;
  }): Promise<void> {
    const [targetObjectName, targetFieldName] =
      junctionConfig.junctionTargetFieldRef.split('.');

    const junctionTargetFieldId = this.findFieldId(
      targetObjectName,
      targetFieldName,
      flatMaps,
    );

    const fieldId = this.findFieldId(
      junctionConfig.objectName,
      junctionConfig.fieldName,
      flatMaps,
    );

    await this.fieldMetadataService.updateOneField({
      workspaceId,
      updateFieldInput: {
        id: fieldId,
        ...(junctionConfig.label && { label: junctionConfig.label }),
        settings: {
          relationType: RelationType.ONE_TO_MANY,
          junctionTargetFieldId,
        },
      },
    });
  }

  private async seedMorphRelations({
    workspaceId,
    relation,
    objectIdByNameSingular,
  }: {
    workspaceId: string;
    relation: {
      objectName: string;
      seeds: MorphRelationSeed[];
    };
    objectIdByNameSingular: Record<string, string>;
  }): Promise<void> {
    const objectMetadataId = objectIdByNameSingular[relation.objectName];

    if (!isDefined(objectMetadataId)) {
      throw new Error(
        `Object metadata id not found for: ${relation.objectName}`,
      );
    }

    const createFieldInputs = relation.seeds.map((seed) => ({
      type: seed.type,
      label: seed.label,
      name: seed.name,
      icon: seed.icon,
      objectMetadataId,
      morphRelationsCreationPayload: seed.targetObjectMetadataNames.map(
        (targetObjectMetadataName) => {
          const targetObjectMetadataId =
            objectIdByNameSingular[targetObjectMetadataName];

          if (!isDefined(targetObjectMetadataId)) {
            throw new Error(
              `Target object metadata id not found for: ${targetObjectMetadataName}`,
            );
          }

          if (!isDefined(seed.morphRelationsCreationPayload)) {
            throw new Error('Morph relations creation payload is not defined');
          }

          return {
            type: seed.morphRelationsCreationPayload[0].type,
            targetFieldLabel:
              seed.morphRelationsCreationPayload[0].targetFieldLabel,
            targetFieldIcon:
              seed.morphRelationsCreationPayload[0].targetFieldIcon,
            targetObjectMetadataId,
          };
        },
      ),
    }));

    await this.fieldMetadataService.createManyFields({
      createFieldInputs,
      workspaceId,
    });
  }

  private async seedJunctionField({
    workspaceId,
    field,
    flatMaps,
  }: {
    workspaceId: string;
    field: JunctionFieldSeed;
    flatMaps: FlatMaps;
  }): Promise<void> {
    const sourceObjectId = flatMaps.objectIdByName[field.sourceObjectName];
    const targetObjectId = flatMaps.objectIdByName[field.targetObjectName];

    if (!isDefined(sourceObjectId)) {
      throw new Error(`Source object not found: ${field.sourceObjectName}`);
    }
    if (!isDefined(targetObjectId)) {
      throw new Error(`Target object not found: ${field.targetObjectName}`);
    }

    await this.fieldMetadataService.createManyFields({
      createFieldInputs: [
        {
          type: FieldMetadataType.RELATION,
          name: field.name,
          label: field.label,
          icon: field.icon,
          objectMetadataId: sourceObjectId,
          relationCreationPayload: {
            type: RelationType.ONE_TO_MANY,
            targetFieldLabel: field.targetFieldLabel,
            targetFieldIcon: field.targetFieldIcon,
            targetObjectMetadataId: targetObjectId,
          },
        },
      ],
      workspaceId,
    });
  }

  private findFieldId(
    objectName: string,
    fieldName: string,
    flatMaps: FlatMaps,
  ): string {
    const objectId = flatMaps.objectIdByName[objectName];

    if (!isDefined(objectId)) {
      throw new Error(`Object not found: ${objectName}`);
    }

    const objectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectId,
      flatEntityMaps: flatMaps.flatObjectMetadataMaps,
    });

    if (!isDefined(objectMetadata)) {
      throw new Error(`Object metadata not found: ${objectName}`);
    }

    for (const fieldId of objectMetadata.fieldIds) {
      const field = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldId,
        flatEntityMaps: flatMaps.flatFieldMetadataMaps,
      });

      if (field?.name === fieldName) {
        return fieldId;
      }
    }

    throw new Error(`Field not found: ${objectName}.${fieldName}`);
  }
}
