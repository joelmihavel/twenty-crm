/**
 * Property custom object definition.
 */

import type { ObjectDefinition } from "../types.js";
import {
  textField,
  numberField,
  boolField,
  currencyField,
  linksField,
  addressField,
  selectField,
} from "../helpers.js";

export const propertyObject: ObjectDefinition = {
  nameSingular: "property",
  namePlural: "properties",
  labelSingular: "Property",
  labelPlural: "Properties",
  icon: "IconBuilding",
  description: "Rental properties managed by Flent",
  fields: [
    textField("pid", "PID", "IconHash"),
    textField("propertyName", "Property Name", "IconBuilding"),
    textField("buildingName", "Building Name", "IconBuilding"),

    addressField("propertyAddress", "Address", "IconMap"),

    selectField("area", "Area", [
      ["HSR Layout", "green"],
      ["Koramangala", "blue"],
      ["Bellandur-Sarjapura", "purple"],
      ["Indiranagar", "orange"],
      ["Whitefield", "yellow"],
      ["Ulsoor-MG Road", "turquoise"],
      ["Marathahalli", "pink"],
      ["Electronic City", "sky"],
    ], "IconMapPin"),

    textField("cluster", "Cluster", "IconMap2"),

    linksField("mapLink", "Map Link", "IconMap"),

    selectField("propertyType", "Property Type", [
      ["Gated Society", "green"],
      ["Standalone Apartment", "blue"],
      ["Independent Residence", "purple"],
      ["Villa", "orange"],
      ["PG", "yellow"],
      ["Co-living", "turquoise"],
      ["Commercial", "gray"],
      ["Mixed Use", "pink"],
    ], "IconHome"),

    selectField("grade", "Grade", [
      ["T0", "turquoise"],
      ["T1", "green"],
      ["T2", "yellow"],
      ["T3", "orange"],
    ], "IconStar"),

    numberField("units", "Units", "IconBuildingCommunity"),
    numberField("floors", "Floors", "IconStack"),
    numberField("washrooms", "Washrooms", "IconBath"),

    textField("furnishings", "Furnishings", "IconArmchair"),

    currencyField("monthlyLicenseFee", "Monthly License Fee", "IconCurrencyRupee"),
    currencyField("maintenanceFee", "Maintenance Fee", "IconCurrencyRupee"),

    selectField("rentCycle", "Rent Cycle", [
      ["Monthly", "blue"],
      ["Quarterly", "green"],
    ], "IconCalendarRepeat"),

    selectField("maintenanceCycle", "Maintenance Cycle", [
      ["Monthly", "blue"],
      ["Quarterly", "green"],
    ], "IconCalendarRepeat"),

    boolField("tdsDeduction", "TDS Deduction", "IconReceipt"),

    selectField("source", "Source", [
      ["MyGate", "green"],
      ["NoBroker", "blue"],
      ["WhatsApp Group", "turquoise"],
      ["Security Guard", "gray"],
      ["Referral", "orange"],
      ["OLX", "yellow"],
      ["Direct", "purple"],
    ], "IconTarget"),

    linksField("galleryLink", "Gallery Link", "IconPhoto"),

    boolField("lockBoxInstalled", "Lock Box Installed", "IconLock"),
    textField("lockBoxCode", "Lock Box Code", "IconKey"),

    textField("parkingInfo", "Parking Info", "IconParking"),

    textField("electricityProvider", "Electricity Provider", "IconBolt"),
    textField("electricityAccountId", "Electricity Account ID", "IconBolt"),
    textField("electricityUserId", "Electricity User ID", "IconBolt"),

    textField("gasProvider", "Gas Provider", "IconFlame"),
    textField("gasId", "Gas ID", "IconFlame"),

    textField("waterSource", "Water Source", "IconDroplet"),
    textField("waterProvider", "Water Provider", "IconDroplet"),

    textField("wifiIsp", "WiFi ISP", "IconWifi"),
    textField("wifiAccountId", "WiFi Account ID", "IconWifi"),
    textField("wifiSsid", "WiFi SSID", "IconWifi"),
    textField("wifiPassword", "WiFi Password", "IconKey"),
    textField("wifiPlan", "WiFi Plan", "IconWifi"),

    textField("hubspotRecordId", "HubSpot Record ID", "IconCloud"),
  ],
};
