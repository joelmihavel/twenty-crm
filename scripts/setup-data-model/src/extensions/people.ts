/**
 * Custom field extensions for the standard Person object.
 */

import type { ExtensionDefinition } from "../types.js";
import { textField, selectField, multiSelectField } from "../helpers.js";

export const PERSON_OBJECT_ID = "048bf164-b759-42e9-a902-7b4d1bff19e8";

export const personExtension: ExtensionDefinition = {
  objectId: PERSON_OBJECT_ID,
  objectName: "person",
  fields: [
    multiSelectField("personRole", "Role", [
      ["Tenant", "green"],
      ["Landlord", "blue"],
      ["Lead", "yellow"],
      ["POC", "gray"],
    ], "IconUserCircle"),

    textField("aadharNumber", "Aadhar Number", "IconId"),

    textField("panCard", "PAN Card", "IconId"),

    textField("countryCode", "Country Code", "IconPhone"),

    selectField("leadSource", "Lead Source", [
      ["Organic-website", "green"],
      ["Facebook", "blue"],
      ["Instagram", "pink"],
      ["LinkedIn", "sky"],
      ["Friends and Family", "yellow"],
      ["Intercom", "orange"],
      ["Google Search", "turquoise"],
      ["NoBroker", "purple"],
      ["MyGate", "lime"],
    ], "IconTarget"),

    textField("leadSubSource", "Lead Sub Source", "IconTag"),

    textField("hubspotRecordId", "HubSpot Record ID", "IconCloud"),
  ],
};
