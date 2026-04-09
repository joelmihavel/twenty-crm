/**
 * Landlord custom object definition.
 */

import type { ObjectDefinition } from "../types.js";
import {
  textField,
  numberField,
  dateField,
  selectField,
} from "../helpers.js";

export const landlordObject: ObjectDefinition = {
  nameSingular: "landlord",
  namePlural: "landlords",
  labelSingular: "Landlord",
  labelPlural: "Landlords",
  icon: "IconHome",
  description: "Property owners partnering with Flent",
  fields: [
    textField("hubspotRecordId", "HubSpot Record ID", "IconCloud"),

    selectField("landlordStatus", "Landlord Status", [
      ["Active", "green"],
      ["Churned", "red"],
      ["Lead", "yellow"],
      ["Onboarding", "blue"],
    ], "IconUserCheck"),

    textField("cashfreeVendorId", "Cashfree Vendor ID", "IconCreditCard"),

    selectField("vendorStatus", "Vendor Status", [
      ["ACTIVE", "green"],
      ["BLOCKED", "red"],
      ["PENDING", "yellow"],
    ], "IconShield"),

    textField("panCard", "PAN Card", "IconId"),
    textField("bankAccountNumber", "Bank Account Number", "IconBuildingBank"),
    textField("ifscCode", "IFSC Code", "IconBuildingBank"),
    textField("accountHolderName", "Account Holder Name", "IconUser"),

    selectField("accountType", "Account Type", [
      ["Individual", "blue"],
      ["Business", "purple"],
    ], "IconBriefcase"),

    selectField("pennyDropStatus", "Penny Drop Status", [
      ["Success", "green"],
      ["Failed", "red"],
      ["Pending", "yellow"],
    ], "IconCoin"),

    numberField("priority", "Priority", "IconSortAscending"),

    selectField("paymentControl", "Payment Control", [
      ["Completed", "green"],
      ["Hold", "orange"],
      ["Pending", "yellow"],
    ], "IconCash"),

    dateField("lastCashfreeSync", "Last Cashfree Sync", "IconRefresh"),
  ],
};
