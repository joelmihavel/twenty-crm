/**
 * All 16 relation definitions for the Flent data model.
 * Every relation uses MANY_TO_ONE (the "from" side is the many side).
 */

import type { RelationDefinition } from "./types.js";

export const relations: RelationDefinition[] = [
  // tenant -> person (each tenant links to one person)
  {
    fromObjectName: "tenant",
    toObjectName: "person",
    fromName: "person",
    toName: "tenant",
    fromLabel: "Person",
    toLabel: "Tenant",
    relationType: "MANY_TO_ONE",
    fromIcon: "IconUser",
    toIcon: "IconUser",
  },

  // tenant -> property
  {
    fromObjectName: "tenant",
    toObjectName: "property",
    fromName: "property",
    toName: "tenants",
    fromLabel: "Property",
    toLabel: "Tenants",
    relationType: "MANY_TO_ONE",
    fromIcon: "IconBuilding",
    toIcon: "IconUser",
  },

  // tenant -> room
  {
    fromObjectName: "tenant",
    toObjectName: "room",
    fromName: "room",
    toName: "currentTenants",
    fromLabel: "Room",
    toLabel: "Current Tenants",
    relationType: "MANY_TO_ONE",
    fromIcon: "IconDoor",
    toIcon: "IconUser",
  },

  // tenant -> contract (active contract)
  {
    fromObjectName: "tenant",
    toObjectName: "contract",
    fromName: "activeContract",
    toName: "tenantRef",
    fromLabel: "Active Contract",
    toLabel: "Tenant Ref",
    relationType: "MANY_TO_ONE",
    fromIcon: "IconFileText",
    toIcon: "IconUser",
  },

  // landlord -> person
  {
    fromObjectName: "landlord",
    toObjectName: "person",
    fromName: "person",
    toName: "landlord",
    fromLabel: "Person",
    toLabel: "Landlord",
    relationType: "MANY_TO_ONE",
    fromIcon: "IconUser",
    toIcon: "IconHome",
  },

  // room -> property
  {
    fromObjectName: "room",
    toObjectName: "property",
    fromName: "property",
    toName: "rooms",
    fromLabel: "Property",
    toLabel: "Rooms",
    relationType: "MANY_TO_ONE",
    fromIcon: "IconBuilding",
    toIcon: "IconDoor",
  },

  // contract -> tenant
  {
    fromObjectName: "contract",
    toObjectName: "tenant",
    fromName: "tenant",
    toName: "contracts",
    fromLabel: "Tenant",
    toLabel: "Contracts",
    relationType: "MANY_TO_ONE",
    fromIcon: "IconUser",
    toIcon: "IconFileText",
  },

  // contract -> landlord
  {
    fromObjectName: "contract",
    toObjectName: "landlord",
    fromName: "landlord",
    toName: "contracts",
    fromLabel: "Landlord",
    toLabel: "Contracts",
    relationType: "MANY_TO_ONE",
    fromIcon: "IconHome",
    toIcon: "IconFileText",
  },

  // contract -> property
  {
    fromObjectName: "contract",
    toObjectName: "property",
    fromName: "property",
    toName: "contracts",
    fromLabel: "Property",
    toLabel: "Contracts",
    relationType: "MANY_TO_ONE",
    fromIcon: "IconBuilding",
    toIcon: "IconFileText",
  },

  // contract -> room
  {
    fromObjectName: "contract",
    toObjectName: "room",
    fromName: "room",
    toName: "contracts",
    fromLabel: "Room",
    toLabel: "Contracts",
    relationType: "MANY_TO_ONE",
    fromIcon: "IconDoor",
    toIcon: "IconFileText",
  },

  // contract -> person
  {
    fromObjectName: "contract",
    toObjectName: "person",
    fromName: "person",
    toName: "contractsAsParty",
    fromLabel: "Person",
    toLabel: "Contracts As Party",
    relationType: "MANY_TO_ONE",
    fromIcon: "IconUser",
    toIcon: "IconFileText",
  },

  // ticket -> property
  {
    fromObjectName: "ticket",
    toObjectName: "property",
    fromName: "property",
    toName: "tickets",
    fromLabel: "Property",
    toLabel: "Tickets",
    relationType: "MANY_TO_ONE",
    fromIcon: "IconBuilding",
    toIcon: "IconTicket",
  },

  // ticket -> tenant
  {
    fromObjectName: "ticket",
    toObjectName: "tenant",
    fromName: "tenant",
    toName: "tickets",
    fromLabel: "Tenant",
    toLabel: "Tickets",
    relationType: "MANY_TO_ONE",
    fromIcon: "IconUser",
    toIcon: "IconTicket",
  },

  // ticket -> landlord
  {
    fromObjectName: "ticket",
    toObjectName: "landlord",
    fromName: "landlord",
    toName: "tickets",
    fromLabel: "Landlord",
    toLabel: "Tickets",
    relationType: "MANY_TO_ONE",
    fromIcon: "IconHome",
    toIcon: "IconTicket",
  },

  // opportunity -> property
  {
    fromObjectName: "opportunity",
    toObjectName: "property",
    fromName: "property",
    toName: "opportunities",
    fromLabel: "Property",
    toLabel: "Opportunities",
    relationType: "MANY_TO_ONE",
    fromIcon: "IconBuilding",
    toIcon: "IconTarget",
  },

  // opportunity -> room
  {
    fromObjectName: "opportunity",
    toObjectName: "room",
    fromName: "room",
    toName: "opportunities",
    fromLabel: "Room",
    toLabel: "Opportunities",
    relationType: "MANY_TO_ONE",
    fromIcon: "IconDoor",
    toIcon: "IconTarget",
  },
];
