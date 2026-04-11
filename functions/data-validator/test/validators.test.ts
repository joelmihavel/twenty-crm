import { describe, it, expect } from "vitest";
import {
  validatePhone,
  validateAadhaar,
  validatePan,
  validateEmail,
  validateIfsc,
  validatePid,
  validateRoomId,
  validateRecord,
} from "../src/validators";
import type { CrmObjectName, CrmRecord } from "../src/types";

// ---------------------------------------------------------------------------
// validatePhone
// ---------------------------------------------------------------------------
describe("validatePhone", () => {
  it("returns null for a valid phone with +91 prefix", () => {
    expect(validatePhone("+919876543210")).toBeNull();
  });

  it("returns null for a valid phone without + prefix", () => {
    expect(validatePhone("919876543210")).toBeNull();
  });

  it("returns null for valid starting digits 6-9", () => {
    expect(validatePhone("+916000000000")).toBeNull();
    expect(validatePhone("+917000000000")).toBeNull();
    expect(validatePhone("+918000000000")).toBeNull();
    expect(validatePhone("+919000000000")).toBeNull();
  });

  it("returns error for landline prefix (starts with 1-5 after 91)", () => {
    expect(validatePhone("+911234567890")).not.toBeNull();
    expect(validatePhone("+912345678901")).not.toBeNull();
    expect(validatePhone("+915555555555")).not.toBeNull();
  });

  it("returns error for too short number", () => {
    expect(validatePhone("+9198765432")).not.toBeNull();
  });

  it("returns error for too long number", () => {
    expect(validatePhone("+9198765432101")).not.toBeNull();
  });

  it("returns error for non-numeric characters", () => {
    expect(validatePhone("+91ABCDEFGHIJ")).not.toBeNull();
  });

  it("returns null for empty string (optional field)", () => {
    expect(validatePhone("")).toBeNull();
  });

  it("returns null for null", () => {
    expect(validatePhone(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(validatePhone(undefined)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// validateAadhaar
// ---------------------------------------------------------------------------
describe("validateAadhaar", () => {
  it("returns null for a valid 12-digit Aadhaar", () => {
    expect(validateAadhaar("123456789012")).toBeNull();
  });

  it("returns error for 11 digits", () => {
    expect(validateAadhaar("12345678901")).not.toBeNull();
  });

  it("returns error for 13 digits", () => {
    expect(validateAadhaar("1234567890123")).not.toBeNull();
  });

  it("returns error when letters are mixed in", () => {
    expect(validateAadhaar("12345678901A")).not.toBeNull();
    expect(validateAadhaar("A23456789012")).not.toBeNull();
  });

  it("returns error for spaces in between", () => {
    expect(validateAadhaar("1234 5678 9012")).not.toBeNull();
  });

  it("returns null for empty string", () => {
    expect(validateAadhaar("")).toBeNull();
  });

  it("returns null for null", () => {
    expect(validateAadhaar(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(validateAadhaar(undefined)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// validatePan
// ---------------------------------------------------------------------------
describe("validatePan", () => {
  it("returns null for a valid PAN", () => {
    expect(validatePan("ABCDE1234F")).toBeNull();
  });

  it("returns null for another valid PAN pattern", () => {
    expect(validatePan("ZZZZZ9999Z")).toBeNull();
  });

  it("returns error for lowercase letters", () => {
    expect(validatePan("abcde1234f")).not.toBeNull();
  });

  it("returns error for mixed case", () => {
    expect(validatePan("ABCDe1234F")).not.toBeNull();
  });

  it("returns error for wrong pattern — digits in letter positions", () => {
    expect(validatePan("12345ABCDE")).not.toBeNull();
  });

  it("returns error for too short", () => {
    expect(validatePan("ABCDE1234")).not.toBeNull();
  });

  it("returns error for too long", () => {
    expect(validatePan("ABCDE1234FG")).not.toBeNull();
  });

  it("returns null for empty string", () => {
    expect(validatePan("")).toBeNull();
  });

  it("returns null for null", () => {
    expect(validatePan(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(validatePan(undefined)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// validateEmail
// ---------------------------------------------------------------------------
describe("validateEmail", () => {
  it("returns null for a standard email", () => {
    expect(validateEmail("user@example.com")).toBeNull();
  });

  it("returns null for email with subdomain", () => {
    expect(validateEmail("user@mail.example.co.in")).toBeNull();
  });

  it("returns null for email with plus addressing", () => {
    expect(validateEmail("user+tag@example.com")).toBeNull();
  });

  it("returns error for missing @", () => {
    expect(validateEmail("userexample.com")).not.toBeNull();
  });

  it("returns error for multiple @ symbols", () => {
    expect(validateEmail("user@@example.com")).not.toBeNull();
  });

  it("returns error for missing domain", () => {
    expect(validateEmail("user@")).not.toBeNull();
  });

  it("returns error for missing local part", () => {
    expect(validateEmail("@example.com")).not.toBeNull();
  });

  it("returns error for spaces", () => {
    expect(validateEmail("user @example.com")).not.toBeNull();
  });

  it("returns null for empty string", () => {
    expect(validateEmail("")).toBeNull();
  });

  it("returns null for null", () => {
    expect(validateEmail(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(validateEmail(undefined)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// validateIfsc
// ---------------------------------------------------------------------------
describe("validateIfsc", () => {
  it("returns null for a valid IFSC code", () => {
    expect(validateIfsc("SBIN0001234")).toBeNull();
  });

  it("returns null for another valid IFSC", () => {
    expect(validateIfsc("HDFC0BRANCH")).toBeNull();
  });

  it("returns error when 5th character is not zero", () => {
    expect(validateIfsc("SBIN1001234")).not.toBeNull();
  });

  it("returns error for lowercase letters", () => {
    expect(validateIfsc("sbin0001234")).not.toBeNull();
  });

  it("returns error for too short", () => {
    expect(validateIfsc("SBIN000123")).not.toBeNull();
  });

  it("returns error for too long", () => {
    expect(validateIfsc("SBIN00012345")).not.toBeNull();
  });

  it("returns error for special characters", () => {
    expect(validateIfsc("SBIN0-01234")).not.toBeNull();
  });

  it("returns null for empty string", () => {
    expect(validateIfsc("")).toBeNull();
  });

  it("returns null for null", () => {
    expect(validateIfsc(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(validateIfsc(undefined)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// validatePid
// ---------------------------------------------------------------------------
describe("validatePid", () => {
  it("returns null for a valid PID", () => {
    expect(validatePid("PID123")).toBeNull();
  });

  it("returns null for PID with large number", () => {
    expect(validatePid("PID999999")).toBeNull();
  });

  it("returns error for missing PID prefix", () => {
    expect(validatePid("123")).not.toBeNull();
  });

  it("returns error for lowercase pid prefix", () => {
    expect(validatePid("pid123")).not.toBeNull();
  });

  it("returns error for PID with no digits", () => {
    expect(validatePid("PID")).not.toBeNull();
  });

  it("returns error for PID with letters after prefix", () => {
    expect(validatePid("PIDABC")).not.toBeNull();
  });

  it("returns null for empty string", () => {
    expect(validatePid("")).toBeNull();
  });

  it("returns null for null", () => {
    expect(validatePid(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(validatePid(undefined)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// validateRoomId
// ---------------------------------------------------------------------------
describe("validateRoomId", () => {
  it("returns null for a valid room ID like 12BR2", () => {
    expect(validateRoomId("12BR2")).toBeNull();
  });

  it("returns null for another valid room ID", () => {
    expect(validateRoomId("01AA0")).toBeNull();
  });

  it("returns error for lowercase letters", () => {
    expect(validateRoomId("12br2")).not.toBeNull();
  });

  it("returns error for wrong length", () => {
    expect(validateRoomId("12BR")).not.toBeNull();
    expect(validateRoomId("12BR22")).not.toBeNull();
  });

  it("returns error for wrong pattern (letters first)", () => {
    expect(validateRoomId("BR122")).not.toBeNull();
  });

  it("returns error for all digits", () => {
    expect(validateRoomId("12342")).not.toBeNull();
  });

  it("returns null for empty string", () => {
    expect(validateRoomId("")).toBeNull();
  });

  it("returns null for null", () => {
    expect(validateRoomId(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(validateRoomId(undefined)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// validateRecord — integration-level tests
// ---------------------------------------------------------------------------
describe("validateRecord", () => {
  it("returns valid result for person with all valid fields", () => {
    const record: CrmRecord = {
      id: "abc-123",
      phone: "+919876543210",
      aadharNumber: "123456789012",
      panCard: "ABCDE1234F",
      email: "test@example.com",
    };
    const result = validateRecord("person", record);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.objectType).toBe("person");
    expect(result.recordId).toBe("abc-123");
  });

  it("returns errors for person with multiple invalid fields", () => {
    const record: CrmRecord = {
      id: "abc-123",
      phone: "12345",
      aadharNumber: "short",
      panCard: "bad",
      email: "notanemail",
    };
    const result = validateRecord("person", record);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });

  it("returns valid result for person with all empty/null fields", () => {
    const record: CrmRecord = {
      id: "abc-123",
      phone: "",
      aadharNumber: null,
      panCard: undefined,
      email: null,
    };
    const result = validateRecord("person", record);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("validates PAN and IFSC for landlord", () => {
    const record: CrmRecord = {
      id: "landlord-1",
      panCard: "INVALID",
      ifscCode: "bad",
    };
    const result = validateRecord("landlord", record);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
    expect(result.errors.map((e) => e.field)).toContain("panCard");
    expect(result.errors.map((e) => e.field)).toContain("ifscCode");
  });

  it("validates PID for property", () => {
    const record: CrmRecord = {
      id: "prop-1",
      pid: "NOTAPID",
    };
    const result = validateRecord("property", record);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.field).toBe("pid");
  });

  it("validates roomId for room", () => {
    const record: CrmRecord = {
      id: "room-1",
      roomId: "INVALID",
    };
    const result = validateRecord("room", record);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.field).toBe("roomId");
  });

  it("does not validate irrelevant fields for an object type", () => {
    // Property should NOT validate phone even if it exists on the record
    const record = {
      id: "prop-1",
      phone: "invalid-phone",
      pid: "PID100",
    } as CrmRecord;
    const result = validateRecord("property", record);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("includes the invalid value in the error", () => {
    const record: CrmRecord = {
      id: "abc-123",
      phone: "badphone",
    };
    const result = validateRecord("person", record);
    expect(result.errors[0]!.value).toBe("badphone");
  });

  it("handles unknown object type gracefully (no validations)", () => {
    const record: CrmRecord = {
      id: "unknown-1",
    };
    const result = validateRecord("unknown" as CrmObjectName, record);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
