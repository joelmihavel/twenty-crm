import { describe, it, expect } from "vitest";
import {
  mapContact,
  mapDeal,
  mapContract,
  mapProperty,
  mapRoom,
  mapTicket,
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
      customerType: "Lead",
      city: "Bangalore",
      aadharNumber: "1234-5678-9012",
      panCard: "ABCDE1234F",
      countryCode: "+91",
      leadSource: "Website",
      leadSubSource: "Google Ads",
    });
  });

  it("maps a Tenant contact to person + tenant records", () => {
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
      tenantLifecycle: "Active",
      reserveStatus: "Confirmed",
      tenantMonthlyRent: 25000,
      tenantBaseRent: 22000,
      monthlyMaintenance: 2000,
      convenienceFee: 500,
      platformFee: 300,
      tenantGst: 450,
      furnishingRental: 3000,
      rentDue: "1",
      rentStatus: "Paid",
      firstMonthRent: 25000,
      realMoveInDate: "2025-03-01",
      moveOutDate: null,
      preferredArea: "Koramangala",
      budget: 30000,
      foodPreference: "Vegetarian",
      smokingPreference: "No",
      petPreference: "No",
      npsScore: 9,
      customerStatus: "Active",
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
      lead_source: "Direct",
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
      vendorStatus: "Active",
      bankAccountNumber: "12345678901234",
      ifscCode: "HDFC0001234",
      accountHolderName: "Rajesh Kumar",
      accountType: "Savings",
      pennyDropStatus: "Verified",
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
      // These should be ignored
      hs_analytics_source: "ORGANIC_SEARCH",
      some_random_field: "should_be_ignored",
      hs_object_id: "999",
    });

    const result = mapContact(hs);
    const person = result.records.find((r) => r.objectType === "person");
    expect(person).toBeDefined();
    expect(person!.fields).not.toHaveProperty("hsAnalyticsSource");
    expect(person!.fields).not.toHaveProperty("someRandomField");
    expect(person!.fields).not.toHaveProperty("hsObjectId");
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
});

// ══════════════════════════════════════════════════════════════════════
// DEALS -> Opportunity
// ══════════════════════════════════════════════════════════════════════

describe("mapDeal", () => {
  it("maps a deal to an opportunity with pipeline mapping", () => {
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
      dealName: "Reserve - Aarav - HSR Layout",
      amount: 150000,
      closeDate: "2025-06-15",
      dealStage: "contractsent",
      pipeline: "Reserve",
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
    expect(opp.fields.pipeline).toBe("Occupancy");
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
    expect(opp.fields.pipeline).toBe("F4B");
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
    expect(opp.fields.pipeline).toBe("Some New Pipeline");
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
  it("maps a contract custom object", () => {
    const hs = makeRecord("301", {
      contract_id: "FLENT-C-2025-001",
    });

    const result = mapContract(hs);
    expect(result.errors).toHaveLength(0);
    expect(result.records).toHaveLength(1);

    const contract = result.records[0]!;
    expect(contract.objectType).toBe("contract");
    expect(contract.hubspotId).toBe("301");
    expect(contract.fields).toMatchObject({
      contractId: "FLENT-C-2025-001",
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
});

// ══════════════════════════════════════════════════════════════════════
// PROPERTY custom object
// ══════════════════════════════════════════════════════════════════════

describe("mapProperty", () => {
  it("maps a property custom object", () => {
    const hs = makeRecord("401", {
      pid: "PROP-BLR-001",
    });

    const result = mapProperty(hs);
    expect(result.errors).toHaveLength(0);
    expect(result.records).toHaveLength(1);

    const prop = result.records[0]!;
    expect(prop.objectType).toBe("property");
    expect(prop.hubspotId).toBe("401");
    expect(prop.fields).toMatchObject({
      pid: "PROP-BLR-001",
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
  it("maps a room custom object", () => {
    const hs = makeRecord("501", {
      roomid: "ROOM-BLR-001-A",
    });

    const result = mapRoom(hs);
    expect(result.errors).toHaveLength(0);
    expect(result.records).toHaveLength(1);

    const room = result.records[0]!;
    expect(room.objectType).toBe("room");
    expect(room.hubspotId).toBe("501");
    expect(room.fields).toMatchObject({
      roomId: "ROOM-BLR-001-A",
    });
  });

  it("handles null roomid", () => {
    const hs = makeRecord("502", {
      roomid: null,
    });

    const result = mapRoom(hs);
    expect(result.records[0]!.fields.roomId).toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════════════
// TICKETS -> Ticket
// ══════════════════════════════════════════════════════════════════════

describe("mapTicket", () => {
  it("maps a ticket record", () => {
    const hs = makeRecord("601", {
      subject: "Maintenance Request - Plumbing",
      content: "Leaking tap in bathroom",
      hs_pipeline: "Support Pipeline",
      hs_pipeline_stage: "In Progress",
      hs_ticket_priority: "HIGH",
      hs_ticket_category: "Maintenance",
      createdate: "2025-05-01T10:00:00Z",
      hs_lastmodifieddate: "2025-05-02T14:30:00Z",
    });

    const result = mapTicket(hs);
    expect(result.errors).toHaveLength(0);
    expect(result.records).toHaveLength(1);

    const ticket = result.records[0]!;
    expect(ticket.objectType).toBe("ticket");
    expect(ticket.hubspotId).toBe("601");
    expect(ticket.fields).toMatchObject({
      subject: "Maintenance Request - Plumbing",
      content: "Leaking tap in bathroom",
      pipeline: "Support Pipeline",
      pipelineStage: "In Progress",
      priority: "HIGH",
      category: "Maintenance",
      createDate: "2025-05-01T10:00:00Z",
      lastModifiedDate: "2025-05-02T14:30:00Z",
    });
  });

  it("handles all-null ticket fields", () => {
    const hs = makeRecord("602", {
      subject: null,
      content: null,
      hs_pipeline: null,
      hs_pipeline_stage: null,
      hs_ticket_priority: null,
      hs_ticket_category: null,
      createdate: null,
      hs_lastmodifieddate: null,
    });

    const result = mapTicket(hs);
    expect(result.records).toHaveLength(1);
    const ticket = result.records[0]!;
    expect(ticket.fields.subject).toBeNull();
    expect(ticket.fields.content).toBeNull();
  });
});
