/**
 * Room custom object definition.
 */

import type { ObjectDefinition } from "../types.js";
import {
  textField,
  currencyField,
  selectField,
} from "../helpers.js";

export const roomObject: ObjectDefinition = {
  nameSingular: "room",
  namePlural: "rooms",
  labelSingular: "Room",
  labelPlural: "Rooms",
  icon: "IconDoor",
  description: "Individual rooms/units within properties",
  fields: [
    textField("roomId", "Room ID", "IconHash"),

    currencyField("threeMonthLockInRent", "3-Month Lock-In Rent", "IconCurrencyRupee"),
    currencyField("sixMonthLockInRent", "6-Month Lock-In Rent", "IconCurrencyRupee"),
    currencyField("elevenMonthLockInRent", "11-Month Lock-In Rent", "IconCurrencyRupee"),
    currencyField("noLockInRent", "No Lock-In Rent", "IconCurrencyRupee"),

    selectField("roomStatus", "Status", [
      ["Occupied", "green"],
      ["Vacant", "blue"],
      ["Maintenance", "orange"],
      ["Reserved", "yellow"],
    ], "IconStatusChange"),

    textField("hubspotRecordId", "HubSpot Record ID", "IconCloud"),
  ],
};
