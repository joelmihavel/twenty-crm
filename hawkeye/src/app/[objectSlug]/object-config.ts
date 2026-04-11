import type { ViewType } from "@/components/views/view-switcher";

// Configuration for how each object should be displayed
export interface ObjectViewConfig {
  defaultView: ViewType;
  kanbanField?: string; // which SELECT field for kanban columns
  calendarField?: string; // which DATE field for calendar events
  summaryFields?: string[]; // fields to show in card/summary view
  relatedObjects?: string[]; // related data shown as tabs
}

export const OBJECT_VIEW_CONFIG: Record<string, ObjectViewConfig> = {
  property: {
    defaultView: "table",
    relatedObjects: [
      "room",
      "propertyActive",
      "propertyChurned",
      "propertyLeadStage",
    ],
  },
  tenant: {
    defaultView: "table",
    relatedObjects: [
      "tenantRequirement",
      "tenantQualification",
      "tenantContractDetail",
      "tenantSatisfaction",
    ],
  },
  ticket: {
    defaultView: "kanban",
    kanbanField: "ticketCategory",
    relatedObjects: ["tenantTicketDetail", "vendorTicketDetail"],
  },
  transaction: {
    defaultView: "table",
    kanbanField: "status",
    relatedObjects: [
      "transactionPayment",
      "transactionLineItem",
      "transactionLink",
    ],
  },
  propertyLeadStage: {
    defaultView: "kanban",
    kanbanField: "dealType",
  },
  contract: {
    defaultView: "table",
    calendarField: "lockInEndDate",
  },
  vendor: {
    defaultView: "table",
    relatedObjects: [
      "vendorContact",
      "vendorCommercial",
      "vendorBilling",
      "vendorCapability",
      "vendorTicketDetail",
    ],
  },
  merchant: {
    defaultView: "table",
    relatedObjects: [
      "merchantPoc",
      "merchantLandlord",
      "merchantContractDetail",
      "merchantManagement",
      "merchantBroker",
    ],
  },
  room: {
    defaultView: "table",
    relatedObjects: [
      "roomAvailability",
      "roomCommercial",
      "roomFurnishing",
      "roomSpecification",
    ],
  },
  overhead: {
    defaultView: "table",
    relatedObjects: [
      "overheadElectricity",
      "overheadGas",
      "overheadWater",
      "overheadWaterPurifier",
      "overheadWiFi",
      "overheadDg",
      "overheadHelper",
      "overheadMaintenance",
    ],
  },
  item: {
    defaultView: "table",
    relatedObjects: ["fsin", "fsinSpecification", "itemState", "itemTransactionLink"],
  },
};

// Get the view config for an object, falling back to defaults
export function getObjectViewConfig(nameSingular: string): ObjectViewConfig {
  return (
    OBJECT_VIEW_CONFIG[nameSingular] ?? {
      defaultView: "table",
    }
  );
}
