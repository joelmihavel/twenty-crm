/**
 * Custom field extensions for the standard Opportunity object.
 */

import type { ExtensionDefinition } from "../types.js";
import {
  textField,
  numberField,
  dateField,
  currencyField,
  selectField,
  multiSelectField,
} from "../helpers.js";

export const OPPORTUNITY_OBJECT_ID = "83667f24-c3a9-41ba-a52a-f70eb711d21a";

export const opportunityExtension: ExtensionDefinition = {
  objectId: OPPORTUNITY_OBJECT_ID,
  objectName: "opportunity",
  fields: [
    selectField("pipelineType", "Pipeline Type", [
      ["Reserve", "blue"],
      ["Occupancy", "green"],
      ["F4B", "purple"],
      ["Supply", "orange"],
    ], "IconPipeline"),

    currencyField("budgetRange", "Budget Range", "IconCurrencyRupee"),

    dateField("expectedMoveIn", "Expected Move-In", "IconCalendar"),

    multiSelectField("locationPreference", "Location Preference", [
      ["HSR Layout", "green"],
      ["Koramangala", "blue"],
      ["Bellandur-Sarjapura", "purple"],
      ["Indiranagar", "orange"],
      ["Whitefield", "yellow"],
      ["Ulsoor-MG Road", "turquoise"],
      ["Marathahalli", "pink"],
      ["Electronic City", "sky"],
    ], "IconMapPin"),

    textField("pocName", "POC Name", "IconUser"),

    textField("pocPhone", "POC Phone", "IconPhone"),

    selectField("propertyGrade", "Property Grade", [
      ["T1", "green"],
      ["T2", "yellow"],
      ["T3", "orange"],
    ], "IconStar"),

    numberField("numberOfUnits", "Number of Units", "IconBuildingCommunity"),

    textField("hubspotRecordId", "HubSpot Record ID", "IconCloud"),
  ],
};
