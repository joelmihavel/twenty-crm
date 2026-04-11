/**
 * Flent CRM View Definitions
 *
 * 17 views across 6 custom objects + opportunity.
 * Each view targets a specific workflow (CX, Sales, Ops, Finance, etc.).
 *
 * Field metadata IDs are resolved from the live Twenty instance at runtime.
 * Object metadata IDs are known from the data model setup.
 */

// ── Object metadata IDs (from data model setup) ────────────────────────

export const OBJECT_IDS = {
  tenant: "a8aebf66-2d10-40f8-b725-8416d97690d6",
  landlord: "196cf588-a742-49c3-9618-fa781f5318ce",
  property: "211145e3-5d78-41f9-9107-5966a2a186c2",
  room: "41499a90-d17a-46e5-87b3-e6e974332ff6",
  contract: "46651847-a095-4661-a70e-ce85eba8fc04",
  ticket: "bc54918e-2b2f-4a6f-a7b5-6b4799d3ec34",
  person: "048bf164-b759-42e9-a902-7b4d1bff19e8",
  opportunity: "83667f24-c3a9-41ba-a52a-f70eb711d21a",
} as const;

// ── Types ───────────────────────────────────────────────────────────────

export type ViewType = "TABLE" | "KANBAN";

export interface ViewFilterDef {
  /** Field name on the object (resolved to fieldMetadataId at runtime) */
  fieldName: string;
  operand: "IS" | "IS_NOT" | "CONTAINS" | "IS_NOT_EMPTY" | "IS_EMPTY";
  /** JSON-serialized filter value */
  value: string;
}

export interface ViewDefinition {
  name: string;
  objectKey: keyof typeof OBJECT_IDS;
  type: ViewType;
  icon: string;
  filters: ViewFilterDef[];
  /** Position index for ordering in the sidebar */
  position: number;
  /**
   * For KANBAN views: the field name used to group columns.
   * Resolved to fieldMetadataId at runtime.
   */
  kanbanGroupByFieldName?: string;
}

// ── 17 View Definitions ─────────────────────────────────────────────────

export const VIEW_DEFINITIONS: ViewDefinition[] = [
  // ── Tenant views ──
  {
    name: "Active Tenants",
    objectKey: "tenant",
    type: "TABLE",
    icon: "IconUserCheck",
    position: 0,
    filters: [
      {
        fieldName: "customerStatus",
        operand: "IS",
        value: '["ACTIVE"]',
      },
    ],
  },
  {
    name: "Move-out Next 15 Days",
    objectKey: "tenant",
    type: "TABLE",
    icon: "IconDoorExit",
    position: 1,
    filters: [
      {
        fieldName: "customerStatus",
        operand: "IS",
        value: '["ACTIVE"]',
      },
      // Note: moveOutDate date filter to be configured manually in UI
      // (requires IS_RELATIVE operand with specific day range)
    ],
  },
  {
    name: "Overdue Rent",
    objectKey: "tenant",
    type: "TABLE",
    icon: "IconAlertTriangle",
    position: 2,
    filters: [
      {
        fieldName: "rentStatus",
        operand: "IS",
        value: '["OVERDUE"]',
      },
    ],
  },
  {
    name: "My Tenants",
    objectKey: "tenant",
    type: "TABLE",
    icon: "IconUsers",
    position: 3,
    filters: [],
  },

  // ── Landlord views ──
  {
    name: "Active Landlords",
    objectKey: "landlord",
    type: "TABLE",
    icon: "IconBuildingEstate",
    position: 4,
    filters: [
      {
        fieldName: "landlordStatus",
        operand: "IS",
        value: '["ACTIVE"]',
      },
    ],
  },
  {
    name: "My Landlords",
    objectKey: "landlord",
    type: "TABLE",
    icon: "IconAddressBook",
    position: 5,
    filters: [],
  },

  // ── Opportunity pipeline views (kanban) ──
  {
    name: "Reserve Pipeline",
    objectKey: "opportunity",
    type: "KANBAN",
    icon: "IconCalendarEvent",
    position: 6,
    kanbanGroupByFieldName: "stage",
    filters: [
      {
        fieldName: "pipelineType",
        operand: "IS",
        value: '["RESERVE"]',
      },
    ],
  },
  {
    name: "Occupancy Pipeline",
    objectKey: "opportunity",
    type: "KANBAN",
    icon: "IconHome",
    position: 7,
    kanbanGroupByFieldName: "stage",
    filters: [
      {
        fieldName: "pipelineType",
        operand: "IS",
        value: '["OCCUPANCY"]',
      },
    ],
  },
  {
    name: "F4B Pipeline",
    objectKey: "opportunity",
    type: "KANBAN",
    icon: "IconBriefcase",
    position: 8,
    kanbanGroupByFieldName: "stage",
    filters: [
      {
        fieldName: "pipelineType",
        operand: "IS",
        value: '["F4B"]',
      },
    ],
  },
  {
    name: "Supply Pipeline",
    objectKey: "opportunity",
    type: "KANBAN",
    icon: "IconTruck",
    position: 9,
    kanbanGroupByFieldName: "stage",
    filters: [
      {
        fieldName: "pipelineType",
        operand: "IS",
        value: '["SUPPLY"]',
      },
    ],
  },

  // ── Ticket views ──
  {
    name: "Open Support Tickets",
    objectKey: "ticket",
    type: "TABLE",
    icon: "IconHeadset",
    position: 10,
    filters: [
      {
        fieldName: "pipeline",
        operand: "IS",
        value: '["SUPPORT"]',
      },
    ],
  },
  {
    name: "Landlord Tickets",
    objectKey: "ticket",
    type: "TABLE",
    icon: "IconTicket",
    position: 11,
    filters: [
      {
        fieldName: "pipeline",
        operand: "IS",
        value: '["LANDLORD"]',
      },
    ],
  },

  // ── Contract views ──
  {
    name: "Expiring Contracts",
    objectKey: "contract",
    type: "TABLE",
    icon: "IconFileAlert",
    position: 12,
    filters: [
      {
        fieldName: "state",
        operand: "IS",
        value: '["ACTIVE"]',
      },
    ],
  },
  {
    name: "My Landlord Contracts",
    objectKey: "contract",
    type: "TABLE",
    icon: "IconFileText",
    position: 13,
    filters: [
      {
        fieldName: "contractType",
        operand: "IS",
        value: '["LANDLORD_AGREEMENT"]',
      },
    ],
  },

  // ── Room views ──
  {
    name: "Vacant Rooms",
    objectKey: "room",
    type: "TABLE",
    icon: "IconDoor",
    position: 14,
    filters: [
      {
        fieldName: "roomStatus",
        operand: "IS",
        value: '["VACANT"]',
      },
    ],
  },

  // ── Property views ──
  {
    name: "Properties by Area",
    objectKey: "property",
    type: "TABLE",
    icon: "IconMap",
    position: 15,
    filters: [],
  },
  {
    name: "My Properties",
    objectKey: "property",
    type: "TABLE",
    icon: "IconBuilding",
    position: 16,
    filters: [],
  },
];
