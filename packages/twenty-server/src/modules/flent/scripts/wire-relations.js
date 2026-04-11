#!/usr/bin/env node
/**
 * wire-relations.js
 *
 * Creates RELATION fields between Flent custom entities in Twenty CRM
 * using the GraphQL metadata API (createOneField with relationCreationPayload).
 *
 * This script creates all parent-child and cross-domain relations
 * for the Flent data model (71 total relations across 23 groups).
 *
 * Prerequisites:
 *   - PG_DATABASE_URL environment variable
 *   - APP_SECRET environment variable
 *   - Twenty server running (default http://localhost:3000)
 *
 * Usage:
 *   kubectl exec deployment/twenty-server -n twenty-prod -- node /path/to/wire-relations.js
 */

const { createHash, createHmac } = require('crypto');

// ─── Configuration ──────────────────────────────────────────────────────────

const WORKSPACE_ID = process.env.WORKSPACE_ID || 'ae07eba0-7d31-499a-912f-816fc42d987e';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const METADATA_URL = `${SERVER_URL}/metadata`;
const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const DELAY_MS = parseInt(process.env.DELAY_MS || '300', 10);

// ─── Object metadata IDs (from database query) ─────────────────────────────
// These map nameSingular -> objectMetadataId

const OBJECT_IDS = {
  contract: 'de3ca10b-29e7-4e1b-a97b-9f66d853ca08',
  fsin: '7155e40f-c9a1-402f-8e83-351c7dca201f',
  fsinSpecification: 'fd6cb921-9d4e-49e2-a3c0-b3ad88e7644c',
  item: '9c757e04-d631-4822-b394-09be2b080e36',
  itemState: '3e772149-2363-42ad-b723-f603b9a5a761',
  itemTransactionLink: '55e4fb3e-228c-4989-8f08-4eed6b4baa7f',
  merchant: 'ef268d02-450d-4c5a-b17c-c689c4f7737b',
  merchantBroker: '29a9844f-af2f-4352-bb50-8d51cd9066ca',
  merchantContractDetail: '90ac9d05-e1a3-455c-a9a8-558c272bc30f',
  merchantLandlord: '93910a9c-7581-4c60-a3ce-60d73adee409',
  merchantManagement: '1e77df63-5eab-4513-85e8-9581d52c1154',
  merchantPoc: '99b3d2ec-f546-4b1a-a6ef-89c6a3a5c399',
  overhead: 'efcfb5fa-62bd-4fe6-9339-5d9a0470d81e',
  overheadDg: 'e55c4117-9be8-4be4-a5b3-05a04a658560',
  overheadElectricity: '9a4b6009-5773-431c-b827-568ad3f1c635',
  overheadGas: '77d7998b-af39-4e6f-98b2-52b831083415',
  overheadHelper: 'b2c04c05-55ef-4f3d-8da4-d3e83abeb850',
  overheadMaintenance: '5663f65c-81c9-415b-bd14-23c27290436d',
  overheadWater: 'ce0bdc34-ecec-4300-a823-893634ba5e58',
  overheadWaterPurifier: 'c191b8a9-5fdf-4bb2-b455-5fdef822c043',
  overheadWifi: 'f17b6bd9-eaad-44d8-8185-4dceb99ecfe9',
  poLine: 'd075de41-3e26-48af-a95e-b29e30da1833',
  property: '30a91d13-7c47-419a-a2d7-eaec829d4e67',
  propertyActive: '11bef65d-432c-4647-b60a-0708daf3a549',
  propertyChurned: '1b6b02b0-7793-45fd-8e62-b2581733b20f',
  propertyLeadStage: 'c081d4be-d23a-4e77-aad6-3265e6ba6bd3',
  room: '3795f95c-6a99-45d6-8145-3954df0763dd',
  roomAvailability: 'e716a3d3-c277-4c69-adc2-b6e37cdcae05',
  roomCommercial: '51fdfd8e-dff3-4bbf-9d61-c071675577bb',
  roomFurnishing: 'b80ca9dd-326e-44d0-9d17-52d787c6a779',
  roomSpecification: '1767ce1e-2b11-410c-a345-f767222d076e',
  tenant: 'a2017fa5-ad99-4c21-b545-548497ef6c77',
  tenantAttribution: 'e0690eeb-5b71-4d8b-b102-d501b183ad17',
  tenantContractDetail: '28842a72-69f9-49d6-b716-30cde471e97e',
  tenantQualification: '35ed1bce-9766-429b-a14b-7900333a779e',
  tenantRequirement: '9ed63733-1806-4db5-abad-27d880d36558',
  tenantSatisfaction: 'cb4a33b9-d064-4fba-a8d4-f8e1daddb6ae',
  tenantTicketDetail: '5395f8c8-1316-427f-ad71-f2996e903e67',
  tenantVisitSummary: '89924eef-4f15-4d8a-901c-f6b11f12b6ae',
  ticket: 'a3f13417-0f8a-4cc8-bb98-deafc816407e',
  transaction: '3307ca7f-41fe-4e39-a4b4-8f5f3140195a',
  transactionClassification: 'f886858d-bc1b-4a81-b07a-0c02244e0e0b',
  transactionLineItem: 'b3e97a83-c9a7-455d-b776-6f2d62e006b6',
  transactionLink: '83e753a1-8728-4e1a-99d8-4db2fb0522d5',
  transactionParty: '9eaa6f8b-9498-4c51-a174-8be87f063b1c',
  transactionPayment: '8a749846-5c13-40f1-a060-bee5bd20db70',
  transactionPurchaseOrder: '2c03a71a-eb38-4910-acc4-a9eec2f5ab26',
  vendor: 'dabd2727-d252-4604-89fa-1cc1e2bd1536',
  vendorBilling: 'd0f3ba48-ad85-4748-8d6f-ae0d73af0006',
  vendorCapability: '958571c5-5cc2-4022-b47c-13bc6fbc128b',
  vendorCommercial: 'e1d1dde9-cd91-46f7-bcfd-1d09adaef95f',
  vendorContact: '648a596f-4dfa-47a6-9a41-5b349bd0ec07',
  vendorTicketDetail: 'f30c6af1-d1cf-46a5-a355-876552a70db9',
};

// ─── Relation Definitions ───────────────────────────────────────────────────
// Each relation is defined as:
//   sourceObject: the "many" side (child), gets the FK column
//   targetObject: the "one" side (parent)
//   fieldName: name of the RELATION field on the source object
//   fieldLabel: display label for the field on the source object
//   fieldIcon: icon for the field on the source object
//   targetFieldLabel: label for the reverse relation on the target object
//   targetFieldIcon: icon for the reverse relation on the target object
//   relationType: MANY_TO_ONE (source -> target) or ONE_TO_MANY (target -> source)

function defineRelations() {
  const relations = [];

  // ─── Group 1: Tenant extensions -> Tenant base (5 relations) ─────────
  const tenantExtensions = [
    { ext: 'tenantAttribution', label: 'Attribution', reverseLabel: 'Tenant Attributions', icon: 'IconTarget' },
    { ext: 'tenantRequirement', label: 'Requirement', reverseLabel: 'Tenant Requirements', icon: 'IconChecklist' },
    { ext: 'tenantQualification', label: 'Qualification', reverseLabel: 'Tenant Qualifications', icon: 'IconCertificate' },
    { ext: 'tenantVisitSummary', label: 'Visit Summary', reverseLabel: 'Tenant Visit Summaries', icon: 'IconCalendarEvent' },
    { ext: 'tenantSatisfaction', label: 'Satisfaction', reverseLabel: 'Tenant Satisfaction Records', icon: 'IconMoodSmile' },
  ];
  for (const { ext, label, reverseLabel, icon } of tenantExtensions) {
    relations.push({
      group: 'Tenant extensions -> Tenant',
      sourceObject: ext,
      targetObject: 'tenant',
      fieldName: 'tenant',
      fieldLabel: 'Tenant',
      fieldIcon: 'IconUser',
      targetFieldLabel: reverseLabel,
      targetFieldIcon: icon,
    });
  }

  // ─── Group 2: Merchant extensions -> Merchant base (4 relations) ─────
  const merchantExtensions = [
    { ext: 'merchantLandlord', label: 'Landlord', reverseLabel: 'Merchant Landlords', icon: 'IconHome' },
    { ext: 'merchantPoc', label: 'POC', reverseLabel: 'Merchant POCs', icon: 'IconAddressBook' },
    { ext: 'merchantBroker', label: 'Broker', reverseLabel: 'Merchant Brokers', icon: 'IconBriefcase' },
    { ext: 'merchantManagement', label: 'Management', reverseLabel: 'Merchant Management Records', icon: 'IconSettings' },
  ];
  for (const { ext, reverseLabel, icon } of merchantExtensions) {
    relations.push({
      group: 'Merchant extensions -> Merchant',
      sourceObject: ext,
      targetObject: 'merchant',
      fieldName: 'merchant',
      fieldLabel: 'Merchant',
      fieldIcon: 'IconBuildingStore',
      targetFieldLabel: reverseLabel,
      targetFieldIcon: icon,
    });
  }

  // ─── Group 3: Vendor extensions -> Vendor base (4 relations) ─────────
  const vendorExtensions = [
    { ext: 'vendorContact', reverseLabel: 'Vendor Contacts', icon: 'IconPhone' },
    { ext: 'vendorBilling', reverseLabel: 'Vendor Billing Records', icon: 'IconReceipt' },
    { ext: 'vendorCapability', reverseLabel: 'Vendor Capabilities', icon: 'IconTool' },
    { ext: 'vendorCommercial', reverseLabel: 'Vendor Commercial Records', icon: 'IconCoin' },
  ];
  for (const { ext, reverseLabel, icon } of vendorExtensions) {
    relations.push({
      group: 'Vendor extensions -> Vendor',
      sourceObject: ext,
      targetObject: 'vendor',
      fieldName: 'vendor',
      fieldLabel: 'Vendor',
      fieldIcon: 'IconTruck',
      targetFieldLabel: reverseLabel,
      targetFieldIcon: icon,
    });
  }

  // ─── Group 4: Property extensions -> Property base (3 relations) ─────
  const propertyExtensions = [
    { ext: 'propertyLeadStage', reverseLabel: 'Property Lead Stages', icon: 'IconFilter' },
    { ext: 'propertyActive', reverseLabel: 'Property Active Records', icon: 'IconCircleCheck' },
    { ext: 'propertyChurned', reverseLabel: 'Property Churned Records', icon: 'IconCircleX' },
  ];
  for (const { ext, reverseLabel, icon } of propertyExtensions) {
    relations.push({
      group: 'Property extensions -> Property',
      sourceObject: ext,
      targetObject: 'property',
      fieldName: 'property',
      fieldLabel: 'Property',
      fieldIcon: 'IconBuilding',
      targetFieldLabel: reverseLabel,
      targetFieldIcon: icon,
    });
  }

  // ─── Group 5: Room -> Property (1 relation) ──────────────────────────
  relations.push({
    group: 'Room -> Property',
    sourceObject: 'room',
    targetObject: 'property',
    fieldName: 'property',
    fieldLabel: 'Property',
    fieldIcon: 'IconBuilding',
    targetFieldLabel: 'Rooms',
    targetFieldIcon: 'IconDoor',
  });

  // ─── Group 6: Room extensions -> Room base (4 relations) ─────────────
  const roomExtensions = [
    { ext: 'roomSpecification', reverseLabel: 'Room Specifications', icon: 'IconRuler' },
    { ext: 'roomFurnishing', reverseLabel: 'Room Furnishings', icon: 'IconSofa' },
    { ext: 'roomAvailability', reverseLabel: 'Room Availability Records', icon: 'IconCalendar' },
    { ext: 'roomCommercial', reverseLabel: 'Room Commercial Records', icon: 'IconCurrencyDollar' },
  ];
  for (const { ext, reverseLabel, icon } of roomExtensions) {
    relations.push({
      group: 'Room extensions -> Room',
      sourceObject: ext,
      targetObject: 'room',
      fieldName: 'room',
      fieldLabel: 'Room',
      fieldIcon: 'IconDoor',
      targetFieldLabel: reverseLabel,
      targetFieldIcon: icon,
    });
  }

  // ─── Group 7: Overhead -> Property + Overhead -> Merchant (2 cross-domain) ─
  relations.push({
    group: 'Overhead -> Property',
    sourceObject: 'overhead',
    targetObject: 'property',
    fieldName: 'property',
    fieldLabel: 'Property',
    fieldIcon: 'IconBuilding',
    targetFieldLabel: 'Overheads',
    targetFieldIcon: 'IconReceipt2',
  });
  relations.push({
    group: 'Overhead -> Merchant',
    sourceObject: 'overhead',
    targetObject: 'merchant',
    fieldName: 'merchant',
    fieldLabel: 'Merchant',
    fieldIcon: 'IconBuildingStore',
    targetFieldLabel: 'Overheads',
    targetFieldIcon: 'IconReceipt2',
  });

  // ─── Group 8: Overhead extensions -> Overhead base (8 relations) ─────
  const overheadExtensions = [
    { ext: 'overheadElectricity', reverseLabel: 'Electricity Records', icon: 'IconBolt' },
    { ext: 'overheadWater', reverseLabel: 'Water Records', icon: 'IconDroplet' },
    { ext: 'overheadGas', reverseLabel: 'Gas Records', icon: 'IconFlame' },
    { ext: 'overheadWifi', reverseLabel: 'WiFi Records', icon: 'IconWifi' },
    { ext: 'overheadDg', reverseLabel: 'DG Records', icon: 'IconEngine' },
    { ext: 'overheadMaintenance', reverseLabel: 'Maintenance Records', icon: 'IconTool' },
    { ext: 'overheadHelper', reverseLabel: 'Helper Records', icon: 'IconUsers' },
    { ext: 'overheadWaterPurifier', reverseLabel: 'Water Purifier Records', icon: 'IconFilter' },
  ];
  for (const { ext, reverseLabel, icon } of overheadExtensions) {
    relations.push({
      group: 'Overhead extensions -> Overhead',
      sourceObject: ext,
      targetObject: 'overhead',
      fieldName: 'overhead',
      fieldLabel: 'Overhead',
      fieldIcon: 'IconReceipt2',
      targetFieldLabel: reverseLabel,
      targetFieldIcon: icon,
    });
  }

  // ─── Group 9: Contract -> Property (1 relation) ──────────────────────
  relations.push({
    group: 'Contract -> Property',
    sourceObject: 'contract',
    targetObject: 'property',
    fieldName: 'property',
    fieldLabel: 'Property',
    fieldIcon: 'IconBuilding',
    targetFieldLabel: 'Contracts',
    targetFieldIcon: 'IconFileDescription',
  });

  // ─── Group 10: TenantContractDetail -> Contract, Tenant, Room (3 relations) ─
  relations.push({
    group: 'TenantContractDetail -> Contract',
    sourceObject: 'tenantContractDetail',
    targetObject: 'contract',
    fieldName: 'contract',
    fieldLabel: 'Contract',
    fieldIcon: 'IconFileDescription',
    targetFieldLabel: 'Tenant Contract Details',
    targetFieldIcon: 'IconUser',
  });
  relations.push({
    group: 'TenantContractDetail -> Tenant',
    sourceObject: 'tenantContractDetail',
    targetObject: 'tenant',
    fieldName: 'tenant',
    fieldLabel: 'Tenant',
    fieldIcon: 'IconUser',
    targetFieldLabel: 'Contract Details',
    targetFieldIcon: 'IconFileDescription',
  });
  relations.push({
    group: 'TenantContractDetail -> Room',
    sourceObject: 'tenantContractDetail',
    targetObject: 'room',
    fieldName: 'room',
    fieldLabel: 'Room',
    fieldIcon: 'IconDoor',
    targetFieldLabel: 'Tenant Contract Details',
    targetFieldIcon: 'IconUser',
  });

  // ─── Group 11: MerchantContractDetail -> Contract, Merchant (2 relations) ─
  relations.push({
    group: 'MerchantContractDetail -> Contract',
    sourceObject: 'merchantContractDetail',
    targetObject: 'contract',
    fieldName: 'contract',
    fieldLabel: 'Contract',
    fieldIcon: 'IconFileDescription',
    targetFieldLabel: 'Merchant Contract Details',
    targetFieldIcon: 'IconBuildingStore',
  });
  relations.push({
    group: 'MerchantContractDetail -> Merchant',
    sourceObject: 'merchantContractDetail',
    targetObject: 'merchant',
    fieldName: 'merchant',
    fieldLabel: 'Merchant',
    fieldIcon: 'IconBuildingStore',
    targetFieldLabel: 'Contract Details',
    targetFieldIcon: 'IconFileDescription',
  });

  // ─── Group 12: Transaction extensions -> Transaction base (6 relations) ─
  const txnExtensions = [
    { ext: 'transactionClassification', reverseLabel: 'Classifications', icon: 'IconCategory' },
    { ext: 'transactionLineItem', reverseLabel: 'Line Items', icon: 'IconList' },
    { ext: 'transactionLink', reverseLabel: 'Links', icon: 'IconLink' },
    { ext: 'transactionParty', reverseLabel: 'Parties', icon: 'IconUsers' },
    { ext: 'transactionPayment', reverseLabel: 'Payments', icon: 'IconCash' },
    { ext: 'transactionPurchaseOrder', reverseLabel: 'Purchase Orders', icon: 'IconShoppingCart' },
  ];
  for (const { ext, reverseLabel, icon } of txnExtensions) {
    relations.push({
      group: 'Transaction extensions -> Transaction',
      sourceObject: ext,
      targetObject: 'transaction',
      fieldName: 'transaction',
      fieldLabel: 'Transaction',
      fieldIcon: 'IconArrowsExchange',
      targetFieldLabel: reverseLabel,
      targetFieldIcon: icon,
    });
  }

  // ─── Group 13: TransactionLink -> 8 domain entities ──────────────────
  // TransactionLink has text columns (tenantId, merchantId, etc.) that serve
  // as lookups. We now create proper relation fields alongside those.
  const linkTargets = [
    { target: 'tenant', fieldName: 'tenantRel', label: 'Tenant', icon: 'IconUser', reverseLabel: 'Transaction Links', reverseIcon: 'IconLink' },
    { target: 'merchant', fieldName: 'merchantRel', label: 'Merchant', icon: 'IconBuildingStore', reverseLabel: 'Transaction Links', reverseIcon: 'IconLink' },
    { target: 'vendor', fieldName: 'vendorRel', label: 'Vendor', icon: 'IconTruck', reverseLabel: 'Transaction Links', reverseIcon: 'IconLink' },
    { target: 'property', fieldName: 'propertyRel', label: 'Property', icon: 'IconBuilding', reverseLabel: 'Transaction Links', reverseIcon: 'IconLink' },
    { target: 'room', fieldName: 'roomRel', label: 'Room', icon: 'IconDoor', reverseLabel: 'Transaction Links', reverseIcon: 'IconLink' },
    { target: 'contract', fieldName: 'contractRel', label: 'Contract', icon: 'IconFileDescription', reverseLabel: 'Transaction Links', reverseIcon: 'IconLink' },
    { target: 'overhead', fieldName: 'overheadRel', label: 'Overhead', icon: 'IconReceipt2', reverseLabel: 'Transaction Links', reverseIcon: 'IconLink' },
    { target: 'ticket', fieldName: 'ticketRel', label: 'Ticket', icon: 'IconTicket', reverseLabel: 'Transaction Links', reverseIcon: 'IconLink' },
  ];
  for (const { target, fieldName, label, icon, reverseLabel, reverseIcon } of linkTargets) {
    relations.push({
      group: 'TransactionLink -> Domain entities',
      sourceObject: 'transactionLink',
      targetObject: target,
      fieldName,
      fieldLabel: label,
      fieldIcon: icon,
      targetFieldLabel: reverseLabel,
      targetFieldIcon: reverseIcon,
    });
  }

  // ─── Group 14: TransactionPurchaseOrder -> Vendor, Transaction (advance), Transaction (remaining) ─
  relations.push({
    group: 'TransactionPurchaseOrder -> Vendor',
    sourceObject: 'transactionPurchaseOrder',
    targetObject: 'vendor',
    fieldName: 'vendorRel',
    fieldLabel: 'Vendor',
    fieldIcon: 'IconTruck',
    targetFieldLabel: 'Purchase Orders',
    targetFieldIcon: 'IconShoppingCart',
  });
  relations.push({
    group: 'TransactionPurchaseOrder -> Transaction (advance)',
    sourceObject: 'transactionPurchaseOrder',
    targetObject: 'transaction',
    fieldName: 'advanceTransaction',
    fieldLabel: 'Advance Transaction',
    fieldIcon: 'IconArrowsExchange',
    targetFieldLabel: 'PO Advance Payments',
    targetFieldIcon: 'IconCash',
  });
  relations.push({
    group: 'TransactionPurchaseOrder -> Transaction (remaining)',
    sourceObject: 'transactionPurchaseOrder',
    targetObject: 'transaction',
    fieldName: 'remainingTransaction',
    fieldLabel: 'Remaining Transaction',
    fieldIcon: 'IconArrowsExchange',
    targetFieldLabel: 'PO Remaining Payments',
    targetFieldIcon: 'IconCash',
  });

  // ─── Group 15: PoLine -> TransactionPurchaseOrder (1 relation) ───────
  relations.push({
    group: 'PoLine -> TransactionPurchaseOrder',
    sourceObject: 'poLine',
    targetObject: 'transactionPurchaseOrder',
    fieldName: 'transactionPurchaseOrder',
    fieldLabel: 'Purchase Order',
    fieldIcon: 'IconShoppingCart',
    targetFieldLabel: 'PO Lines',
    targetFieldIcon: 'IconList',
  });

  // ─── Group 16: Ticket -> Property, Vendor, Transaction (3 relations) ─
  relations.push({
    group: 'Ticket -> Property',
    sourceObject: 'ticket',
    targetObject: 'property',
    fieldName: 'property',
    fieldLabel: 'Property',
    fieldIcon: 'IconBuilding',
    targetFieldLabel: 'Tickets',
    targetFieldIcon: 'IconTicket',
  });
  relations.push({
    group: 'Ticket -> Vendor',
    sourceObject: 'ticket',
    targetObject: 'vendor',
    fieldName: 'vendor',
    fieldLabel: 'Vendor',
    fieldIcon: 'IconTruck',
    targetFieldLabel: 'Tickets',
    targetFieldIcon: 'IconTicket',
  });
  relations.push({
    group: 'Ticket -> Transaction',
    sourceObject: 'ticket',
    targetObject: 'transaction',
    fieldName: 'transaction',
    fieldLabel: 'Transaction',
    fieldIcon: 'IconArrowsExchange',
    targetFieldLabel: 'Tickets',
    targetFieldIcon: 'IconTicket',
  });

  // ─── Group 17: Ticket extensions -> Ticket base (2 relations) ────────
  relations.push({
    group: 'TenantTicketDetail -> Ticket',
    sourceObject: 'tenantTicketDetail',
    targetObject: 'ticket',
    fieldName: 'ticket',
    fieldLabel: 'Ticket',
    fieldIcon: 'IconTicket',
    targetFieldLabel: 'Tenant Ticket Details',
    targetFieldIcon: 'IconUser',
  });
  relations.push({
    group: 'VendorTicketDetail -> Ticket',
    sourceObject: 'vendorTicketDetail',
    targetObject: 'ticket',
    fieldName: 'ticket',
    fieldLabel: 'Ticket',
    fieldIcon: 'IconTicket',
    targetFieldLabel: 'Vendor Ticket Details',
    targetFieldIcon: 'IconTruck',
  });

  // ─── Group 18: TenantTicketDetail -> Room (1 relation) ───────────────
  relations.push({
    group: 'TenantTicketDetail -> Room',
    sourceObject: 'tenantTicketDetail',
    targetObject: 'room',
    fieldName: 'room',
    fieldLabel: 'Room',
    fieldIcon: 'IconDoor',
    targetFieldLabel: 'Tenant Ticket Details',
    targetFieldIcon: 'IconTicket',
  });

  // ─── Group 19: Fsin -> Vendor (1 relation) ───────────────────────────
  relations.push({
    group: 'Fsin -> Vendor',
    sourceObject: 'fsin',
    targetObject: 'vendor',
    fieldName: 'vendor',
    fieldLabel: 'Vendor',
    fieldIcon: 'IconTruck',
    targetFieldLabel: 'FSINs',
    targetFieldIcon: 'IconBarcode',
  });

  // ─── Group 20: FsinSpecification -> Fsin (1 relation) ────────────────
  relations.push({
    group: 'FsinSpecification -> Fsin',
    sourceObject: 'fsinSpecification',
    targetObject: 'fsin',
    fieldName: 'fsin',
    fieldLabel: 'FSIN',
    fieldIcon: 'IconBarcode',
    targetFieldLabel: 'Specifications',
    targetFieldIcon: 'IconRuler',
  });

  // ─── Group 21: Item -> Fsin, PoLine (2 relations) ────────────────────
  relations.push({
    group: 'Item -> Fsin',
    sourceObject: 'item',
    targetObject: 'fsin',
    fieldName: 'fsin',
    fieldLabel: 'FSIN',
    fieldIcon: 'IconBarcode',
    targetFieldLabel: 'Items',
    targetFieldIcon: 'IconPackage',
  });
  relations.push({
    group: 'Item -> PoLine',
    sourceObject: 'item',
    targetObject: 'poLine',
    fieldName: 'poLine',
    fieldLabel: 'PO Line',
    fieldIcon: 'IconList',
    targetFieldLabel: 'Items',
    targetFieldIcon: 'IconPackage',
  });

  // ─── Group 22: Item extensions -> Item base (2 relations) ────────────
  relations.push({
    group: 'ItemState -> Item',
    sourceObject: 'itemState',
    targetObject: 'item',
    fieldName: 'item',
    fieldLabel: 'Item',
    fieldIcon: 'IconPackage',
    targetFieldLabel: 'State Records',
    targetFieldIcon: 'IconHistory',
  });
  relations.push({
    group: 'ItemTransactionLink -> Item',
    sourceObject: 'itemTransactionLink',
    targetObject: 'item',
    fieldName: 'item',
    fieldLabel: 'Item',
    fieldIcon: 'IconPackage',
    targetFieldLabel: 'Transaction Links',
    targetFieldIcon: 'IconLink',
  });

  // ─── Group 23: ItemTransactionLink -> Transaction (1 relation) ───────
  relations.push({
    group: 'ItemTransactionLink -> Transaction',
    sourceObject: 'itemTransactionLink',
    targetObject: 'transaction',
    fieldName: 'transaction',
    fieldLabel: 'Transaction',
    fieldIcon: 'IconArrowsExchange',
    targetFieldLabel: 'Item Transaction Links',
    targetFieldIcon: 'IconLink',
  });

  return relations;
}

// ─── JWT Token Generation ───────────────────────────────────────────────────

function base64url(str) {
  return Buffer.from(str).toString('base64url');
}

async function generateToken(pg) {
  const appSecret = process.env.APP_SECRET;
  if (!appSecret) {
    throw new Error('APP_SECRET environment variable is required');
  }

  const apiKeyResult = await pg.query(
    `SELECT ak.id, ak."expiresAt"
     FROM core."apiKey" ak
     WHERE ak."workspaceId" = $1
       AND ak."revokedAt" IS NULL
       AND (ak."expiresAt" IS NULL OR ak."expiresAt" > NOW())
     ORDER BY ak."createdAt" DESC
     LIMIT 1`,
    [WORKSPACE_ID]
  );

  let apiKeyId;
  let expiresAt;

  if (apiKeyResult.rows.length > 0) {
    apiKeyId = apiKeyResult.rows[0].id;
    expiresAt = apiKeyResult.rows[0].expiresAt;
    console.log(`Found existing API key: ${apiKeyId}`);
  } else {
    console.log('No active API key found, creating one...');

    const roleResult = await pg.query(
      `SELECT id FROM core."role"
       WHERE "workspaceId" = $1
       ORDER BY "createdAt" ASC
       LIMIT 1`,
      [WORKSPACE_ID]
    );

    if (roleResult.rows.length === 0) {
      throw new Error('No role found for workspace');
    }

    expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const insertResult = await pg.query(
      `INSERT INTO core."apiKey" (id, name, "expiresAt", "workspaceId", "roleId", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), 'Flent Relation Wiring Script', $1, $2, $3, NOW(), NOW())
       RETURNING id`,
      [expiresAt, WORKSPACE_ID, roleResult.rows[0].id]
    );

    apiKeyId = insertResult.rows[0].id;
    console.log(`Created temporary API key: ${apiKeyId}`);
  }

  const type = 'API_KEY';
  const secret = createHash('sha256')
    .update(`${appSecret}${WORKSPACE_ID}${type}`)
    .digest('hex');

  let jwt;
  try {
    jwt = require('jsonwebtoken');
  } catch {
    jwt = null;
  }

  if (jwt) {
    const expiresIn = expiresAt
      ? Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
      : 365 * 24 * 60 * 60;

    return jwt.sign(
      { sub: WORKSPACE_ID, type: 'API_KEY', workspaceId: WORKSPACE_ID },
      secret,
      { expiresIn, jwtid: apiKeyId }
    );
  } else {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const exp = expiresAt
      ? Math.floor(new Date(expiresAt).getTime() / 1000)
      : now + 365 * 24 * 60 * 60;

    const fullPayload = {
      sub: WORKSPACE_ID,
      type: 'API_KEY',
      workspaceId: WORKSPACE_ID,
      jti: apiKeyId,
      iat: now,
      exp,
    };

    const headerB64 = base64url(JSON.stringify(header));
    const payloadB64 = base64url(JSON.stringify(fullPayload));
    const sig = createHmac('sha256', secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    return `${headerB64}.${payloadB64}.${sig}`;
  }
}

// ─── GraphQL Client ─────────────────────────────────────────────────────────

async function graphqlRequest(query, variables, token) {
  const response = await fetch(METADATA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();

  if (result.errors) {
    const errorMessages = result.errors.map(e => e.message).join('; ');
    throw new Error(`GraphQL error: ${errorMessages}`);
  }

  return result.data;
}

// ─── Mutations ──────────────────────────────────────────────────────────────

const CREATE_FIELD_MUTATION = `
  mutation CreateOneField($input: CreateOneFieldMetadataInput!) {
    createOneField(input: $input) {
      id
      name
      label
      type
    }
  }
`;

const FIND_FIELDS_QUERY = `
  query FindFields($objectId: UUID!) {
    fields(filter: { objectMetadataId: { eq: $objectId } }, paging: { first: 500 }) {
      edges {
        node {
          id
          name
          label
          type
          isCustom
        }
      }
    }
  }
`;

async function findExistingFields(token, objectMetadataId) {
  const data = await graphqlRequest(FIND_FIELDS_QUERY, { objectId: objectMetadataId }, token);
  const fields = data.fields.edges.map(e => e.node);
  const byName = {};
  for (const field of fields) {
    byName[field.name] = field;
  }
  return byName;
}

async function createRelationField(relation, token) {
  const sourceObjectId = OBJECT_IDS[relation.sourceObject];
  const targetObjectId = OBJECT_IDS[relation.targetObject];

  if (!sourceObjectId) {
    throw new Error(`Unknown source object: ${relation.sourceObject}`);
  }
  if (!targetObjectId) {
    throw new Error(`Unknown target object: ${relation.targetObject}`);
  }

  const input = {
    field: {
      type: 'RELATION',
      name: relation.fieldName,
      label: relation.fieldLabel,
      icon: relation.fieldIcon,
      objectMetadataId: sourceObjectId,
      relationCreationPayload: {
        type: 'MANY_TO_ONE',
        targetObjectMetadataId: targetObjectId,
        targetFieldLabel: relation.targetFieldLabel,
        targetFieldIcon: relation.targetFieldIcon,
      },
    },
  };

  const data = await graphqlRequest(CREATE_FIELD_MUTATION, { input }, token);
  return data.createOneField;
}

// ─── Delay utility ──────────────────────────────────────────────────────────

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Flent Relation Wiring Script ===');
  console.log(`Workspace ID: ${WORKSPACE_ID}`);
  console.log(`Server URL: ${SERVER_URL}`);
  console.log(`Dry run: ${DRY_RUN}`);
  console.log();

  const relations = defineRelations();
  console.log(`Total relations to create: ${relations.length}`);
  console.log();

  if (DRY_RUN) {
    console.log('=== DRY RUN ===');
    let groupName = '';
    for (const rel of relations) {
      if (rel.group !== groupName) {
        groupName = rel.group;
        console.log(`\n  [${groupName}]`);
      }
      console.log(`    ${rel.sourceObject}.${rel.fieldName} -> ${rel.targetObject} (MANY_TO_ONE)`);
      console.log(`      Forward: "${rel.fieldLabel}" (${rel.fieldIcon})`);
      console.log(`      Reverse: "${rel.targetFieldLabel}" (${rel.targetFieldIcon})`);
    }
    return;
  }

  // Connect to database for token generation
  const { Client } = require('pg');
  const pg = new Client({ connectionString: process.env.PG_DATABASE_URL });
  await pg.connect();
  console.log('Connected to database');

  // Generate API token
  const token = await generateToken(pg);
  console.log('Generated API token');
  console.log(`Token preview: ${token.substring(0, 50)}...`);

  // We can close PG now - we only needed it for token generation
  await pg.end();
  console.log('Database connection closed (only needed for token).\n');

  // Pre-fetch existing fields for all source objects to detect already-created relations
  console.log('=== Pre-checking existing relation fields ===\n');
  const existingFieldsCache = {};
  const uniqueSourceObjects = [...new Set(relations.map(r => r.sourceObject))];

  for (const objName of uniqueSourceObjects) {
    try {
      existingFieldsCache[objName] = await findExistingFields(token, OBJECT_IDS[objName]);
      await delay(100);
    } catch (err) {
      console.warn(`  Warning: Could not fetch fields for ${objName}: ${err.message}`);
      existingFieldsCache[objName] = {};
    }
  }
  console.log(`Fetched existing fields for ${uniqueSourceObjects.length} objects.\n`);

  // Create relations
  console.log('=== Creating Relations ===\n');

  const results = {
    created: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  let currentGroup = '';

  for (const rel of relations) {
    if (rel.group !== currentGroup) {
      currentGroup = rel.group;
      console.log(`\n  [${currentGroup}]`);
    }

    const key = `${rel.sourceObject}.${rel.fieldName}`;

    // Check if relation field already exists
    const existingFields = existingFieldsCache[rel.sourceObject] || {};
    if (existingFields[rel.fieldName]) {
      console.log(`    SKIP  ${key} -> ${rel.targetObject} (already exists)`);
      results.skipped++;
      continue;
    }

    try {
      const created = await createRelationField(rel, token);
      console.log(`    OK    ${key} -> ${rel.targetObject} (id: ${created.id})`);
      results.created++;
    } catch (err) {
      console.error(`    FAIL  ${key} -> ${rel.targetObject}: ${err.message}`);
      results.failed++;
      results.errors.push({ relation: key, error: err.message });
    }

    await delay(DELAY_MS);
  }

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Created: ${results.created}`);
  console.log(`Skipped: ${results.skipped} (already existed)`);
  console.log(`Failed:  ${results.failed}`);

  if (results.errors.length > 0) {
    console.log('\nFailed relations:');
    for (const { relation, error } of results.errors) {
      console.log(`  ${relation}: ${error}`);
    }
    console.log('\nRe-run the script to retry failed relations (it is idempotent).');
  } else {
    console.log('\nAll relations created successfully.');
  }
}

main().catch(err => {
  console.error(`Fatal: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
