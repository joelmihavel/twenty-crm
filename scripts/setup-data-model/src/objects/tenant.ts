/**
 * Tenant custom object definition.
 */

import type { ObjectDefinition } from "../types.js";
import {
  textField,
  numberField,
  dateField,
  currencyField,
  linksField,
  selectField,
  multiSelectField,
} from "../helpers.js";

export const tenantObject: ObjectDefinition = {
  nameSingular: "tenant",
  namePlural: "tenants",
  labelSingular: "Tenant",
  labelPlural: "Tenants",
  icon: "IconUser",
  description: "Tenants renting properties through Flent",
  fields: [
    textField("hubspotRecordId", "HubSpot Record ID", "IconCloud"),

    selectField("customerStatus", "Customer Status", [
      ["Active", "green"],
      ["Churned", "red"],
      ["Lead", "yellow"],
      ["Gestation", "orange"],
      ["Move-out Initiated", "gray"],
    ], "IconUserCheck"),

    selectField("tenantLifecycle", "Tenant Lifecycle", [
      ["Token Pending", "yellow"],
      ["Token Received", "blue"],
      ["FMR+Deposit Pending", "orange"],
      ["FMR+Deposit Completed", "green"],
      ["Agreement Pending", "yellow"],
      ["Agreement Signed", "green"],
      ["Move In Pending", "blue"],
      ["Move In Blocked", "red"],
      ["Inventory Check Pending", "orange"],
      ["Inventory Check Completed", "green"],
    ], "IconTimeline"),

    selectField("reserveStatus", "Reserve Status", [
      ["Form Filled", "blue"],
      ["Paid", "green"],
      ["High Intent", "turquoise"],
      ["Thinking", "yellow"],
      ["Low Intent", "orange"],
      ["No Response", "gray"],
      ["Location Unserviceable", "red"],
      ["Refunded", "purple"],
      ["Not Interested", "red"],
      ["Dropped", "gray"],
    ], "IconBookmark"),

    currencyField("monthlyRent", "Monthly Rent", "IconCurrencyRupee"),
    currencyField("baseRent", "Base Rent", "IconCurrencyRupee"),
    currencyField("maintenanceAmount", "Maintenance Amount", "IconCurrencyRupee"),
    currencyField("convenienceFee", "Convenience Fee", "IconCurrencyRupee"),
    currencyField("platformFee", "Platform Fee", "IconCurrencyRupee"),
    currencyField("gst", "GST", "IconCurrencyRupee"),
    currencyField("furnishingRental", "Furnishing Rental", "IconCurrencyRupee"),
    currencyField("rentDue", "Rent Due", "IconCurrencyRupee"),

    selectField("rentStatus", "Rent Status", [
      ["Paid", "green"],
      ["Pending", "yellow"],
      ["Overdue", "red"],
    ], "IconReceipt"),

    currencyField("firstMonthRent", "First Month Rent", "IconCurrencyRupee"),

    dateField("moveInDate", "Move-In Date", "IconCalendarEvent"),
    dateField("moveOutDate", "Move-Out Date", "IconCalendarEvent"),

    multiSelectField("preferredAreas", "Preferred Areas", [
      ["HSR Layout", "green"],
      ["Koramangala", "blue"],
      ["Bellandur-Sarjapura", "purple"],
      ["Indiranagar", "orange"],
      ["Whitefield", "yellow"],
      ["Ulsoor-MG Road", "turquoise"],
    ], "IconMapPin"),

    currencyField("budget", "Budget", "IconCurrencyRupee"),

    selectField("foodPreference", "Food Preference", [
      ["Veg", "green"],
      ["Non-veg", "red"],
      ["Eggetarian", "yellow"],
      ["No Preference", "gray"],
    ], "IconSalad"),

    selectField("smoking", "Smoking", [
      ["Yes", "red"],
      ["No", "green"],
      ["Occasionally", "yellow"],
    ], "IconSmokingNo"),

    selectField("petPreference", "Pet Preference", [
      ["Yes", "green"],
      ["No", "red"],
    ], "IconPaw"),

    numberField("npsScore", "NPS Score", "IconStar"),

    linksField("rentalLink", "Rental Link", "IconLink"),

    textField("cfOrderId", "CF Order ID", "IconReceipt"),
    textField("cfLinkId", "CF Link ID", "IconLink"),
  ],
};
