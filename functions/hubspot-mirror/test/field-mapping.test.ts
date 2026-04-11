import { describe, it, expect } from "vitest";
import {
  mapContact,
  mapDeal,
  mapContract,
  mapProperty,
  mapRoom,
  mapTicket,
  toCurrency,
} from "../src/field-mapping.js";
import type { HubSpotRecord } from "../src/types.js";

// ── Helper: build a HubSpot record ──────────────────────────────────

function makeRecord(
  id: string,
  properties: Record<string, string | null>,
): HubSpotRecord {
  return {
    id,
    properties,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-06-01T00:00:00Z",
  };
}

// ══════════════════════════════════════════════════════════════════════
// CURRENCY FORMATTING
// ══════════════════════════════════════════════════════════════════════

describe("toCurrency", () => {
  it("converts a plain number to amountMicros format", () => {
    expect(toCurrency(25000)).toEqual({
      amountMicros: 25_000_000_000,
      currencyCode: "INR",
    });
  });

  it("converts a numeric string to amountMicros format", () => {
    expect(toCurrency("15000")).toEqual({
      amountMicros: 15_000_000_000,
      currencyCode: "INR",
    });
  });

  it("handles decimal amounts correctly", () => {
    expect(toCurrency("25000.50")).toEqual({
      amountMicros: 25_000_500_000,
      currencyCode: "INR",
    });
  });

  it("returns null for null input", () => {
    expect(toCurrency(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(toCurrency(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(toCurrency("")).toBeNull();
  });

  it("returns null for non-numeric string", () => {
    expect(toCurrency("not-a-number")).toBeNull();
  });

  it("handles zero correctly", () => {
    expect(toCurrency(0)).toEqual({
      amountMicros: 0,
      currencyCode: "INR",
    });
  });

  it("handles zero string correctly", () => {
    expect(toCurrency("0")).toEqual({
      amountMicros: 0,
      currencyCode: "INR",
    });
  });

  it("uses custom currency code", () => {
    expect(toCurrency(100, "USD")).toEqual({
      amountMicros: 100_000_000,
      currencyCode: "USD",
    });
  });
});

// ══════════════════════════════════════════════════════════════════════
// CONTACTS -> Person + Tenant + Landlord
// ══════════════════════════════════════════════════════════════════════

describe("mapContact", () => {
  it("maps a basic contact to a person record", () => {
    const hs = makeRecord("101", {
      firstname: "Aarav",
      lastname: "Sharma",
      email: "aarav@example.com",
      phone: "+919876543210",
      customer_type: "Lead",
      city: "Bangalore",
      aadhar_number: "1234-5678-9012",
      pan_card: "ABCDE1234F",
      country_code: "+91",
      lead_source: "Website",
      lead_sub_source: "Google Ads",
    });

    const result = mapContact(hs);
    expect(result.errors).toHaveLength(0);
    expect(result.records.length).toBeGreaterThanOrEqual(1);

    const person = result.records.find((r) => r.objectType === "person");
    expect(person).toBeDefined();
    expect(person!.hubspotId).toBe("101");
    expect(person!.fields).toMatchObject({
      firstName: "Aarav",
      lastName: "Sharma",
      email: "aarav@example.com",
      phone: "+919876543210",
      personRole: ["LEAD"],
      city: "Bangalore",
      aadharNumber: "1234-5678-9012",
      panCard: "ABCDE1234F",
      countryCode: "+91",
      leadSource: "WEBSITE",
      leadSubSource: "Google Ads",
    });
  });

  it("maps a Tenant contact to person + tenant records with currency fields", () => {
    const hs = makeRecord("102", {
      firstname: "Priya",
      lastname: "Patel",
      email: "priya@example.com",
      phone: "+919123456789",
      customer_type: "Tenant",
      city: "Mumbai",
      aadhar_number: null,
      pan_card: null,
      country_code: "+91",
      lead_source: "Referral",
      lead_sub_source: null,
      tenant_lifecycle: "Active",
      reserve_status: "Confirmed",
      tenant_monthly_rent: "25000",
      tenant_base_rent: "22000",
      monthly_maintenance: "2000",
      convenience_fee: "500",
      platform_fee: "300",
      tenant_gst: "450",
      furnishing_rental: "3000",
      rent_due: "1",
      rent_status: "Paid",
      first_month_rent: "25000",
      real_move_in_date: "2025-03-01",
      move_out_date: null,
      preferred_area: "Koramangala",
      budget: "30000",
      food_preference: "Vegetarian",
      smoking_preference: "No",
      pet_preference: "No",
      nps_score: "9",
      customer_status: "Active",
    });

    const result = mapContact(hs);
    expect(result.errors).toHaveLength(0);

    const person = result.records.find((r) => r.objectType === "person");
    const tenant = result.records.find((r) => r.objectType === "tenant");

    expect(person).toBeDefined();
    expect(tenant).toBeDefined();
    expect(tenant!.hubspotId).toBe("102");
    expect(tenant!.fields).toMatchObject({
      tenantLifecycle: "ACTIVE",
      reserveStatus: "CONFIRMED",
      monthlyRent: { amountMicros: 25_000_000_000, currencyCode: "INR" },
      baseRent: { amountMicros: 22_000_000_000, currencyCode: "INR" },
      maintenanceAmount: { amountMicros: 2_000_000_000, currencyCode: "INR" },
      convenienceFee: { amountMicros: 500_000_000, currencyCode: "INR" },
      platformFee: { amountMicros: 300_000_000, currencyCode: "INR" },
      gst: { amountMicros: 450_000_000, currencyCode: "INR" },
      furnishingRental: { amountMicros: 3_000_000_000, currencyCode: "INR" },
      rentDue: { amountMicros: 1_000_000, currencyCode: "INR" },
      rentStatus: "PAID",
      firstMonthRent: { amountMicros: 25_000_000_000, currencyCode: "INR" },
      moveInDate: "2025-03-01",
      moveOutDate: null,
      preferredAreas: ["KORAMANGALA"],
      budget: { amountMicros: 30_000_000_000, currencyCode: "INR" },
      foodPreference: "VEGETARIAN",
      smoking: "NO",
      petPreference: "NO",
      npsScore: 9,
      customerStatus: "ACTIVE",
    });
  });

  it("maps a Landlord contact to person + landlord records", () => {
    const hs = makeRecord("103", {
      firstname: "Rajesh",
      lastname: "Kumar",
      email: "rajesh@example.com",
      phone: "+919988776655",
      customer_type: "Landlord",
      city: "Delhi",
      aadhar_number: "9876-5432-1098",
      pan_card: "XYZAB5678C",
      country_code: "+91",
      lead_source: "DIRECT",
      lead_sub_source: null,
      cashfree_vendor_id: "CF_V_123456",
      vendor_status: "Active",
      bank_account_number: "12345678901234",
      ifsc_code: "HDFC0001234",
      account_holder_name: "Rajesh Kumar",
      account_type: "Savings",
      penny_drop_status: "Verified",
    });

    const result = mapContact(hs);
    expect(result.errors).toHaveLength(0);

    const person = result.records.find((r) => r.objectType === "person");
    const landlord = result.records.find((r) => r.objectType === "landlord");

    expect(person).toBeDefined();
    expect(landlord).toBeDefined();
    expect(landlord!.hubspotId).toBe("103");
    expect(landlord!.fields).toMatchObject({
      cashfreeVendorId: "CF_V_123456",
      vendorStatus: "ACTIVE",
      bankAccountNumber: "12345678901234",
      ifscCode: "HDFC0001234",
      accountHolderName: "Rajesh Kumar",
      accountType: "SAVINGS",
      pennyDropStatus: "VERIFIED",
    });
  });

  it("maps a dual-role contact (Tenant + Landlord) to person + tenant + landlord", () => {
    const hs = makeRecord("104", {
      firstname: "Sneha",
      lastname: "Reddy",
      email: "sneha@example.com",
      phone: "+919112233445",
      customer_type: "Tenant;Landlord",
      city: "Hyderabad",
      aadhar_number: null,
      pan_card: null,
      country_code: "+91",
      lead_source: "App",
      lead_sub_source: null,
      // Tenant fields
      tenant_lifecycle: "Active",
      reserve_status: "Confirmed",
      tenant_monthly_rent: "18000",
      tenant_base_rent: "16000",
      monthly_maintenance: "1500",
      convenience_fee: "400",
      platform_fee: "200",
      tenant_gst: "360",
      furnishing_rental: "0",
      rent_due: "5",
      rent_status: "Due",
      first_month_rent: "18000",
      real_move_in_date: "2025-02-15",
      move_out_date: null,
      preferred_area: "Madhapur",
      budget: "20000",
      food_preference: "Non-Vegetarian",
      smoking_preference: "Yes",
      pet_preference: "Yes",
      nps_score: "7",
      customer_status: "Active",
      // Landlord fields
      cashfree_vendor_id: "CF_V_789012",
      vendor_status: "Active",
      bank_account_number: "98765432109876",
      ifsc_code: "ICIC0005678",
      account_holder_name: "Sneha Reddy",
      account_type: "Current",
      penny_drop_status: "Verified",
    });

    const result = mapContact(hs);
    expect(result.errors).toHaveLength(0);
    expect(result.records).toHaveLength(3);

    const types = result.records.map((r) => r.objectType);
    expect(types).toContain("person");
    expect(types).toContain("tenant");
    expect(types).toContain("landlord");
  });

  it("handles empty/null fields gracefully", () => {
    const hs = makeRecord("105", {
      firstname: "",
      lastname: null,
      email: "",
      phone: null,
      customer_type: null,
      city: null,
      aadhar_number: null,
      pan_card: null,
      country_code: null,
      lead_source: null,
      lead_sub_source: null,
    });

    const result = mapContact(hs);
    expect(result.errors).toHaveLength(0);

    const person = result.records.find((r) => r.objectType === "person");
    expect(person).toBeDefined();
    expect(person!.fields.firstName).toBeNull();
    expect(person!.fields.lastName).toBeNull();
    expect(person!.fields.email).toBeNull();
    // Should NOT produce tenant or landlord records when customer_type is null
    expect(result.records.find((r) => r.objectType === "tenant")).toBeUndefined();
    expect(result.records.find((r) => r.objectType === "landlord")).toBeUndefined();
  });

  it("ignores non-whitelisted properties", () => {
    const hs = makeRecord("106", {
      firstname: "Test",
      lastname: "User",
      email: "test@example.com",
      phone: null,
      customer_type: "Lead",
      city: null,
      aadhar_number: null,
      pan_card: null,
      country_code: null,
      lead_source: null,
      lead_sub_source: null,
      hs_object_id: "999",
      // These should be ignored
      hs_analytics_source: "ORGANIC_SEARCH",
      some_random_field: "should_be_ignored",
    });

    const result = mapContact(hs);
    const person = result.records.find((r) => r.objectType === "person");
    expect(person).toBeDefined();
    expect(person!.fields).not.toHaveProperty("hsAnalyticsSource");
    expect(person!.fields).not.toHaveProperty("someRandomField");
    // hs_object_id IS whitelisted and should be present
    expect(person!.fields.hubspotRecordId).toBe("999");
  });

  it("detects Tenant with case-insensitive match", () => {
    const hs = makeRecord("107", {
      firstname: "Case",
      lastname: "Test",
      email: "case@example.com",
      phone: null,
      customer_type: "tenant",
      city: null,
      aadhar_number: null,
      pan_card: null,
      country_code: null,
      lead_source: null,
      lead_sub_source: null,
      tenant_lifecycle: "Active",
      reserve_status: null,
      tenant_monthly_rent: null,
      tenant_base_rent: null,
      monthly_maintenance: null,
      convenience_fee: null,
      platform_fee: null,
      tenant_gst: null,
      furnishing_rental: null,
      rent_due: null,
      rent_status: null,
      first_month_rent: null,
      real_move_in_date: null,
      move_out_date: null,
      preferred_area: null,
      budget: null,
      food_preference: null,
      smoking_preference: null,
      pet_preference: null,
      nps_score: null,
      customer_status: null,
    });

    const result = mapContact(hs);
    expect(result.records.find((r) => r.objectType === "tenant")).toBeDefined();
  });

  it("maps null currency fields as null in tenant", () => {
    const hs = makeRecord("108", {
      firstname: "Null",
      lastname: "Currency",
      email: "null@example.com",
      phone: null,
      customer_type: "Tenant",
      city: null,
      aadhar_number: null,
      pan_card: null,
      country_code: null,
      lead_source: null,
      lead_sub_source: null,
      tenant_lifecycle: null,
      reserve_status: null,
      tenant_monthly_rent: null,
      tenant_base_rent: null,
      monthly_maintenance: null,
      convenience_fee: null,
      platform_fee: null,
      tenant_gst: null,
      furnishing_rental: null,
      rent_due: null,
      rent_status: null,
      first_month_rent: null,
      real_move_in_date: null,
      move_out_date: null,
      preferred_area: null,
      budget: null,
      food_preference: null,
      smoking_preference: null,
      pet_preference: null,
      nps_score: null,
      customer_status: null,
    });

    const result = mapContact(hs);
    const tenant = result.records.find((r) => r.objectType === "tenant");
    expect(tenant).toBeDefined();
    expect(tenant!.fields.monthlyRent).toBeNull();
    expect(tenant!.fields.baseRent).toBeNull();
    expect(tenant!.fields.budget).toBeNull();
    expect(tenant!.fields.npsScore).toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════════════
// DEALS -> Opportunity
// ══════════════════════════════════════════════════════════════════════

describe("mapDeal", () => {
  it("maps a deal to an opportunity with pipeline mapping and currency amount", () => {
    const hs = makeRecord("201", {
      dealname: "Reserve - Aarav - HSR Layout",
      amount: "150000",
      closedate: "2025-06-15",
      dealstage: "contractsent",
      pipeline: "Reserve",
    });

    const result = mapDeal(hs);
    expect(result.errors).toHaveLength(0);
    expect(result.records).toHaveLength(1);

    const opp = result.records[0]!;
    expect(opp.objectType).toBe("opportunity");
    expect(opp.hubspotId).toBe("201");
    expect(opp.fields).toMatchObject({
      name: "Reserve - Aarav - HSR Layout",
      amount: { amountMicros: 150_000_000_000, currencyCode: "INR" },
      closeDate: "2025-06-15",
      stage: "CONTRACTSENT",
      pipelineType: "RESERVE",
    });
  });

  it("maps Occupancy Pipeline correctly", () => {
    const hs = makeRecord("202", {
      dealname: "Occupancy - Priya",
      amount: "25000",
      closedate: "2025-07-01",
      dealstage: "closedwon",
      pipeline: "Occupancy Pipeline",
    });

    const result = mapDeal(hs);
    const opp = result.records[0]!;
    expect(opp.fields.pipelineType).toBe("OCCUPANCY");
    expect(opp.fields.amount).toEqual({ amountMicros: 25_000_000_000, currencyCode: "INR" });
  });

  it("maps F4B pipeline correctly", () => {
    const hs = makeRecord("203", {
      dealname: "F4B - Corporate Booking",
      amount: "500000",
      closedate: null,
      dealstage: "qualifiedtobuy",
      pipeline: "F4B",
    });

    const result = mapDeal(hs);
    const opp = result.records[0]!;
    expect(opp.fields.pipelineType).toBe("F4B");
    expect(opp.fields.closeDate).toBeNull();
  });

  it("handles unknown pipeline by passing through raw value", () => {
    const hs = makeRecord("204", {
      dealname: "Unknown Pipeline Deal",
      amount: "10000",
      closedate: null,
      dealstage: "appointmentscheduled",
      pipeline: "Some New Pipeline",
    });

    const result = mapDeal(hs);
    const opp = result.records[0]!;
    expect(opp.fields.pipelineType).toBe("SOME_NEW_PIPELINE");
  });

  it("handles null amount as null (not 0)", () => {
    const hs = makeRecord("205", {
      dealname: "No Amount Deal",
      amount: null,
      closedate: null,
      dealstage: "appointmentscheduled",
      pipeline: "Reserve",
    });

    const result = mapDeal(hs);
    const opp = result.records[0]!;
    expect(opp.fields.amount).toBeNull();
  });

  it("handles empty string amount as null", () => {
    const hs = makeRecord("206", {
      dealname: "Empty Amount",
      amount: "",
      closedate: "",
      dealstage: "appointmentscheduled",
      pipeline: "Reserve",
    });

    const result = mapDeal(hs);
    const opp = result.records[0]!;
    expect(opp.fields.amount).toBeNull();
    expect(opp.fields.closeDate).toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════════════
// CONTRACT custom object
// ══════════════════════════════════════════════════════════════════════

describe("mapContract", () => {
  it("maps a contract custom object with currency fields in amountMicros format", () => {
    const hs = makeRecord("301", {
      contract_id: "FLENT-C-2025-001",
      contract_uid: "UID-001",
      contract_type: "Lease",
      state: "ACTIVE",
      business_type: "Residential",
      pid: "PROP-BLR-001",
      rid: "ROOM-001",
      contract_start_date: "2025-01-01",
      contract_end_date: "2026-01-01",
      go_live_date: "2025-01-15",
      lock_in_end_date: "2025-07-01",
      lock_in_plan: "6 months",
      monthly_license_fee: "25000",
      property_base_rent: "22000",
      security_deposit: "50000",
      platform_fees: "1000",
      convenience_fee: "500",
      gst: "4500",
      tds_amount: "2200",
      maintenance_amount: "2000",
      increment_percentage: "5",
      rental_cycle: "Monthly",
      short_term_flag: "false",
      water_charges_separate: "true",
      move_in_inspector: "Inspector A",
      move_in_status: "Completed",
      move_out_inspector: null,
      move_out_status: null,
      deposit_settled: "false",
      settlement_amount: "0",
    });

    const result = mapContract(hs);
    expect(result.errors).toHaveLength(0);
    expect(result.records).toHaveLength(1);

    const contract = result.records[0]!;
    expect(contract.objectType).toBe("contract");
    expect(contract.hubspotId).toBe("301");
    expect(contract.fields).toMatchObject({
      contractId: "FLENT-C-2025-001",
      contractUid: "UID-001",
      contractType: "LEASE",
      state: "ACTIVE",
      businessType: "RESIDENTIAL",
      pid: "PROP-BLR-001",
      rid: "ROOM-001",
      startDate: "2025-01-01",
      endDate: "2026-01-01",
      goLiveDate: "2025-01-15",
      lockInEnd: "2025-07-01",
      lockInPlan: "SIX_MONTHS",
      monthlyLicenseFee: { amountMicros: 25_000_000_000, currencyCode: "INR" },
      baseRent: { amountMicros: 22_000_000_000, currencyCode: "INR" },
      securityDeposit: { amountMicros: 50_000_000_000, currencyCode: "INR" },
      platformFees: { amountMicros: 1_000_000_000, currencyCode: "INR" },
      convenienceFee: { amountMicros: 500_000_000, currencyCode: "INR" },
      gst: { amountMicros: 4_500_000_000, currencyCode: "INR" },
      tdsAmount: { amountMicros: 2_200_000_000, currencyCode: "INR" },
      maintenanceAmount: { amountMicros: 2_000_000_000, currencyCode: "INR" },
      incrementPercentage: 5,
      rentalCycle: "MONTHLY",
      shortTermFlag: "false",
      waterChargesSeparate: "true",
      moveInInspector: "Inspector A",
      moveInStatus: "COMPLETED",
      moveOutInspector: null,
      moveOutStatus: null,
      depositSettled: "false",
      settlementAmount: { amountMicros: 0, currencyCode: "INR" },
    });
  });

  it("handles null contract_id", () => {
    const hs = makeRecord("302", {
      contract_id: null,
    });

    const result = mapContract(hs);
    expect(result.records).toHaveLength(1);
    expect(result.records[0]!.fields.contractId).toBeNull();
  });

  it("handles null currency fields as null", () => {
    const hs = makeRecord("303", {
      contract_id: "C-NULL",
      monthly_license_fee: null,
      security_deposit: null,
      gst: null,
    });

    const result = mapContract(hs);
    const contract = result.records[0]!;
    expect(contract.fields.monthlyLicenseFee).toBeNull();
    expect(contract.fields.securityDeposit).toBeNull();
    expect(contract.fields.gst).toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════════════
// PROPERTY custom object
// ══════════════════════════════════════════════════════════════════════

describe("mapProperty", () => {
  it("maps a property custom object with currency fields in amountMicros format", () => {
    const hs = makeRecord("401", {
      pid: "PROP-BLR-001",
      property_name: "Sunrise Residency",
      building_name: "Tower A",
      property_address: "123 MG Road",
      area_name: "Koramangala",
      cluster: "South Bangalore",
      map_link: "https://maps.google.com/xyz",
      property_type: "Apartment",
      grade: "A",
      units: "12",
      floors: "3",
      washrooms: "2",
      furnishings: "Semi-Furnished",
      monthly_license_fee: "25000",
      maintenance_fee: "3000",
      rent_cycle: "Monthly",
      maintenance_cycle: "Quarterly",
      tds_deduction: "Yes",
      source: "DIRECT",
      gallery_link: "https://gallery.example.com/prop1",
      lock_box_installed: "true",
      lock_box_code: "1234",
      parking_info: "Covered parking available",
      electricity_provider: "BESCOM",
      electricity_account_id: "ELEC-001",
    });

    const result = mapProperty(hs);
    expect(result.errors).toHaveLength(0);
    expect(result.records).toHaveLength(1);

    const prop = result.records[0]!;
    expect(prop.objectType).toBe("property");
    expect(prop.hubspotId).toBe("401");
    expect(prop.fields).toMatchObject({
      pid: "PROP-BLR-001",
      propertyName: "Sunrise Residency",
      buildingName: "Tower A",
      propertyAddress: "123 MG Road",
      area: "KORAMANGALA",
      cluster: "South Bangalore",
      mapLink: "https://maps.google.com/xyz",
      propertyType: "APARTMENT",
      grade: "A",
      units: 12,
      floors: 3,
      washrooms: 2,
      furnishings: "Semi-Furnished",
      monthlyLicenseFee: { amountMicros: 25_000_000_000, currencyCode: "INR" },
      maintenanceFee: { amountMicros: 3_000_000_000, currencyCode: "INR" },
      rentCycle: "MONTHLY",
      maintenanceCycle: "QUARTERLY",
      tdsDeduction: "Yes",
      source: "DIRECT",
      galleryLink: "https://gallery.example.com/prop1",
      lockBoxInstalled: "true",
      lockBoxCode: "1234",
      parkingInfo: "Covered parking available",
      electricityProvider: "BESCOM",
      electricityAccountId: "ELEC-001",
    });
  });

  it("handles empty pid", () => {
    const hs = makeRecord("402", {
      pid: "",
    });

    const result = mapProperty(hs);
    expect(result.records[0]!.fields.pid).toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════════════
// ROOM custom object
// ══════════════════════════════════════════════════════════════════════

describe("mapRoom", () => {
  it("maps a room custom object with currency fields in amountMicros format", () => {
    const hs = makeRecord("501", {
      roomid: "ROOM-BLR-001-A",
      n3_month_lock_in_rent: "15000",
      n6_month_lock_in_rent: "14000",
      n11_month_lock_in_rent: "13000",
      no_lock_in_rent: "16000",
    });

    const result = mapRoom(hs);
    expect(result.errors).toHaveLength(0);
    expect(result.records).toHaveLength(1);

    const room = result.records[0]!;
    expect(room.objectType).toBe("room");
    expect(room.hubspotId).toBe("501");
    expect(room.fields).toMatchObject({
      roomId: "ROOM-BLR-001-A",
      threeMonthLockInRent: { amountMicros: 15_000_000_000, currencyCode: "INR" },
      sixMonthLockInRent: { amountMicros: 14_000_000_000, currencyCode: "INR" },
      elevenMonthLockInRent: { amountMicros: 13_000_000_000, currencyCode: "INR" },
      noLockInRent: { amountMicros: 16_000_000_000, currencyCode: "INR" },
    });
  });

  it("handles null roomid", () => {
    const hs = makeRecord("502", {
      roomid: null,
    });

    const result = mapRoom(hs);
    expect(result.records[0]!.fields.roomId).toBeNull();
  });

  it("handles null rent values as null (not currency object)", () => {
    const hs = makeRecord("503", {
      roomid: "ROOM-003",
      n3_month_lock_in_rent: null,
      n6_month_lock_in_rent: null,
      n11_month_lock_in_rent: null,
      no_lock_in_rent: null,
    });

    const result = mapRoom(hs);
    const room = result.records[0]!;
    expect(room.fields.threeMonthLockInRent).toBeNull();
    expect(room.fields.sixMonthLockInRent).toBeNull();
    expect(room.fields.elevenMonthLockInRent).toBeNull();
    expect(room.fields.noLockInRent).toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════════════
// TICKETS -> Ticket
// ══════════════════════════════════════════════════════════════════════

describe("mapTicket", () => {
  it("maps a ticket record with currency field in amountMicros format", () => {
    const hs = makeRecord("601", {
      hs_pipeline: "SUPPORT_PIPELINE",
      hs_pipeline_stage: "In Progress",
      ticket_category: "MAINTENANCE",
      hs_ticket_priority: "HIGH",
      cost_associated: "500",
      cost_paid_by: "Tenant",
      resolution_notes: "Fixed leaking tap",
      tenant_rating: "4",
      scheduled_on: "2025-05-03",
      time_slot: "10:00-12:00",
      ticket_flag: "ESCALATED",
      hs_object_id: "601",
    });

    const result = mapTicket(hs);
    expect(result.errors).toHaveLength(0);
    expect(result.records).toHaveLength(1);

    const ticket = result.records[0]!;
    expect(ticket.objectType).toBe("ticket");
    expect(ticket.hubspotId).toBe("601");
    expect(ticket.fields).toMatchObject({
      pipeline: "SUPPORT_PIPELINE",
      ticketStatus: "IN_PROGRESS",
      category: "MAINTENANCE",
      priority: "HIGH",
      cost: { amountMicros: 500_000_000, currencyCode: "INR" },
      costPaidBy: "TENANT",
      resolutionNotes: "Fixed leaking tap",
      tenantRating: "4",
      scheduledOn: "2025-05-03",
      timeSlot: "10:00-12:00",
      flag: "ESCALATED",
      hubspotRecordId: "601",
    });
  });

  it("handles all-null ticket fields", () => {
    const hs = makeRecord("602", {
      hs_pipeline: null,
      hs_pipeline_stage: null,
      ticket_category: null,
      hs_ticket_priority: null,
      cost_associated: null,
      cost_paid_by: null,
      resolution_notes: null,
      tenant_rating: null,
      scheduled_on: null,
      time_slot: null,
      ticket_flag: null,
      hs_object_id: null,
    });

    const result = mapTicket(hs);
    expect(result.records).toHaveLength(1);
    const ticket = result.records[0]!;
    expect(ticket.fields.pipeline).toBeNull();
    expect(ticket.fields.category).toBeNull();
    expect(ticket.fields.cost).toBeNull();
    expect(ticket.fields.tenantRating).toBeNull();
  });
});
