import {
  Building05,
  Users01,
  Building01,
  File06,
  Ticket01,
  Truck01,
  CreditCard01,
  Tool02,
  LayoutGrid01,
  Box,
  BarChartSquare02,
  Briefcase01,
} from "@untitledui/icons";
import type { FC } from "react";

export interface SidebarGroup {
  key: string;
  label: string;
  icon: FC<{ className?: string }>;
  // nameSingular values for objects in this group
  objectNames: string[];
}

// Ordered sidebar groups for Hawkeye CRM
export const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    key: "properties",
    label: "Properties",
    icon: Building05,
    objectNames: [
      "property",
      "propertyActive",
      "propertyChurned",
      "propertyLeadStage",
    ],
  },
  {
    key: "tenants",
    label: "Tenants",
    icon: Users01,
    objectNames: [
      "tenant",
      "tenantRequirement",
      "tenantQualification",
      "tenantContractDetail",
      "tenantSatisfaction",
      "tenantVisitSummary",
      "tenantAttribution",
      "tenantTicketDetail",
    ],
  },
  {
    key: "merchants",
    label: "Merchants",
    icon: Building01,
    objectNames: [
      "merchant",
      "merchantPoc",
      "merchantLandlord",
      "merchantContractDetail",
      "merchantManagement",
      "merchantBroker",
    ],
  },
  {
    key: "contracts",
    label: "Contracts",
    icon: File06,
    objectNames: ["contract"],
  },
  {
    key: "tickets",
    label: "Tickets",
    icon: Ticket01,
    objectNames: ["ticket"],
  },
  {
    key: "vendors",
    label: "Vendors",
    icon: Truck01,
    objectNames: [
      "vendor",
      "vendorContact",
      "vendorCommercial",
      "vendorBilling",
      "vendorCapability",
      "vendorTicketDetail",
    ],
  },
  {
    key: "transactions",
    label: "Transactions",
    icon: CreditCard01,
    objectNames: [
      "transaction",
      "transactionPayment",
      "transactionLink",
      "transactionLineItem",
      "transactionPurchaseOrder",
      "transactionParty",
      "transactionClassification",
    ],
  },
  {
    key: "overheads",
    label: "Overheads",
    icon: Tool02,
    objectNames: [
      "overhead",
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
  {
    key: "rooms",
    label: "Rooms",
    icon: LayoutGrid01,
    objectNames: [
      "room",
      "roomAvailability",
      "roomCommercial",
      "roomFurnishing",
      "roomSpecification",
    ],
  },
  {
    key: "inventory",
    label: "Inventory",
    icon: Box,
    objectNames: [
      "item",
      "fsin",
      "fsinSpecification",
      "itemState",
      "itemTransactionLink",
    ],
  },
];

// Reverse lookup: nameSingular -> group key
export const OBJECT_TO_GROUP: Record<string, string> = {};
for (const group of SIDEBAR_GROUPS) {
  for (const name of group.objectNames) {
    OBJECT_TO_GROUP[name] = group.key;
  }
}

// All known grouped object names (for detecting ungrouped objects)
export const ALL_GROUPED_OBJECTS = new Set(
  SIDEBAR_GROUPS.flatMap((g) => g.objectNames),
);
