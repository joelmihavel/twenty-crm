/**
 * Ticket custom object definition.
 */

import type { ObjectDefinition } from "../types.js";
import {
  textField,
  currencyField,
  dateField,
  richTextField,
  ratingField,
  selectField,
} from "../helpers.js";

export const ticketObject: ObjectDefinition = {
  nameSingular: "ticket",
  namePlural: "tickets",
  labelSingular: "Ticket",
  labelPlural: "Tickets",
  icon: "IconTicket",
  description: "Maintenance and support tickets",
  fields: [
    textField("ticketId", "Ticket ID", "IconHash"),

    selectField("pipeline", "Pipeline", [
      ["Support", "blue"],
      ["Landlord", "green"],
    ], "IconPipeline"),

    selectField("ticketStatus", "Ticket Status", [
      ["New Request", "blue"],
      ["Waiting on Customer", "yellow"],
      ["Waiting on Vendor", "orange"],
      ["Waiting on Landlord", "orange"],
      ["Waiting on Product", "purple"],
      ["Action Pending", "yellow"],
      ["Ready For Closure", "turquoise"],
      ["Closed", "gray"],
      ["New", "blue"],
      ["Waiting on Tenant", "yellow"],
      ["Waiting on Flent", "orange"],
      ["External Dependency", "purple"],
      ["Vendor Scheduled", "sky"],
      ["Blocked", "red"],
    ], "IconStatusChange"),

    selectField("category", "Category", [
      ["Plumbing", "blue"],
      ["Electrical", "yellow"],
      ["HVAC", "turquoise"],
      ["Structural", "orange"],
      ["General", "gray"],
      ["Pest Control", "green"],
      ["Cleaning", "lime"],
      ["Appliance", "purple"],
      ["Internet", "sky"],
      ["Other", "gray"],
    ], "IconCategory"),

    selectField("priority", "Priority", [
      ["Emergency", "red"],
      ["High", "orange"],
      ["Medium", "yellow"],
      ["Low", "green"],
    ], "IconUrgent"),

    currencyField("cost", "Cost", "IconCurrencyRupee"),

    selectField("costPaidBy", "Cost Paid By", [
      ["Flent", "blue"],
      ["Landlord", "green"],
      ["Tenant", "orange"],
    ], "IconCash"),

    richTextField("resolutionNotes", "Resolution Notes", "IconNotes"),

    ratingField("tenantRating", "Tenant Rating", "IconStar"),

    dateField("scheduledOn", "Scheduled On", "IconCalendar"),

    textField("timeSlot", "Time Slot", "IconClock"),

    selectField("flag", "Flag", [
      ["Reasonable", "green"],
      ["Non-Reasonable", "red"],
      ["Subjective", "yellow"],
    ], "IconFlag"),

    textField("hubspotRecordId", "HubSpot Record ID", "IconCloud"),
  ],
};
