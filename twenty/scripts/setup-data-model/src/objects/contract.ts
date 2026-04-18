/**
 * Contract custom object definition.
 */

import type { ObjectDefinition } from "../types.js";
import {
  textField,
  numberField,
  boolField,
  dateField,
  currencyField,
  linksField,
  richTextField,
  selectField,
} from "../helpers.js";

export const contractObject: ObjectDefinition = {
  nameSingular: "contract",
  namePlural: "contracts",
  labelSingular: "Contract",
  labelPlural: "Contracts",
  icon: "IconFileText",
  description: "Rental contracts between tenants, landlords, and properties",
  fields: [
    textField("contractId", "Contract ID", "IconHash"),
    textField("contractUid", "Contract UID", "IconFingerprint"),

    selectField("contractType", "Contract Type", [
      ["Tenant Agreement", "blue"],
      ["Landlord Agreement", "green"],
    ], "IconFileText"),

    selectField("state", "State", [
      ["Active", "green"],
      ["Renewed", "blue"],
      ["Terminated", "red"],
      ["Upcoming", "yellow"],
      ["Didn't Move In", "gray"],
      ["Room Change", "orange"],
    ], "IconStatusChange"),

    selectField("businessType", "Business Type", [
      ["Unfurnished", "gray"],
      ["Fully Furnished", "green"],
      ["F4B", "purple"],
      ["Partially Furnished", "blue"],
    ], "IconArmchair"),

    dateField("startDate", "Start Date", "IconCalendarEvent"),
    dateField("endDate", "End Date", "IconCalendarEvent"),
    dateField("goLiveDate", "Go-Live Date", "IconCalendarEvent"),
    dateField("lockInEnd", "Lock-In End", "IconCalendarEvent"),

    selectField("lockInPlan", "Lock-In Plan", [
      ["3 Months", "blue"],
      ["6 Months", "green"],
      ["11 Months", "purple"],
      ["No Lock-in", "gray"],
    ], "IconLock"),

    currencyField("monthlyLicenseFee", "Monthly License Fee", "IconCurrencyRupee"),
    currencyField("baseRent", "Base Rent", "IconCurrencyRupee"),
    currencyField("securityDeposit", "Security Deposit", "IconCurrencyRupee"),
    currencyField("platformFees", "Platform Fees", "IconCurrencyRupee"),
    currencyField("convenienceFee", "Convenience Fee", "IconCurrencyRupee"),
    currencyField("gst", "GST", "IconCurrencyRupee"),
    currencyField("tdsAmount", "TDS Amount", "IconCurrencyRupee"),
    currencyField("maintenanceAmount", "Maintenance Amount", "IconCurrencyRupee"),

    numberField("incrementPercentage", "Increment Percentage", "IconPercentage"),

    selectField("rentalCycle", "Rental Cycle", [
      ["Monthly", "blue"],
    ], "IconCalendarRepeat"),

    boolField("shortTermFlag", "Short Term Flag", "IconClock"),

    numberField("lfSettlementDay", "LF Settlement Day", "IconCalendar"),

    selectField("lfSettlementCycle", "LF Settlement Cycle", [
      ["Monthly", "blue"],
      ["Quarterly", "green"],
    ], "IconCalendarRepeat"),

    boolField("maintenanceToLandlord", "Maintenance To Landlord", "IconArrowRight"),

    currencyField("tdsOnLicenseFee", "TDS On License Fee", "IconCurrencyRupee"),

    numberField("numberOfUnits", "Number of Units", "IconBuildingCommunity"),

    selectField("monthlyPaymentStatus", "Monthly Payment Status", [
      ["Paid", "green"],
      ["Unpaid", "red"],
    ], "IconReceipt"),

    boolField("waterChargesSeparate", "Water Charges Separate", "IconDroplet"),

    textField("moveInInspector", "Move-In Inspector", "IconUser"),

    selectField("moveInStatus", "Move-In Status", [
      ["Pending", "yellow"],
      ["Completed", "green"],
      ["Issues", "red"],
    ], "IconTruckDelivery"),

    richTextField("moveInIssues", "Move-In Issues", "IconAlertTriangle"),

    textField("moveOutInspector", "Move-Out Inspector", "IconUser"),

    selectField("moveOutStatus", "Move-Out Status", [
      ["Pending", "yellow"],
      ["Completed", "green"],
      ["Issues", "red"],
    ], "IconTruckDelivery"),

    boolField("depositSettled", "Deposit Settled", "IconCheck"),

    currencyField("settlementAmount", "Settlement Amount", "IconCurrencyRupee"),

    textField("agreementZohoRequestId", "Agreement Zoho Request ID", "IconFileText"),

    selectField("agreementStatus", "Agreement Status", [
      ["Draft", "gray"],
      ["Sent", "blue"],
      ["Viewed", "yellow"],
      ["Signed", "green"],
      ["Rejected", "red"],
      ["Expired", "orange"],
    ], "IconFileCheck"),

    dateField("agreementSentDate", "Agreement Sent Date", "IconCalendar"),
    dateField("agreementSignedDate", "Agreement Signed Date", "IconCalendar"),

    linksField("agreementDocumentUrl", "Agreement Document URL", "IconFileText"),

    textField("agreementLicenseeName", "Agreement Licensee Name", "IconUser"),
    textField("agreementLicensorName", "Agreement Licensor Name", "IconUser"),

    textField("hubspotRecordId", "HubSpot Record ID", "IconCloud"),
  ],
};
