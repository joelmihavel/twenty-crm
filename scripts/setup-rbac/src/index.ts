/**
 * Flent Twenty CRM -- RBAC Role Setup Script
 *
 * Creates 9 roles with granular object-level permissions via the metadata API.
 * Idempotent: checks for existing roles by label before creating.
 *
 * Permission model:
 *   - Roles have top-level flags (canReadAllObjectRecords, canUpdateAllObjectRecords, etc.)
 *   - Granular per-object permissions override these flags via upsertObjectPermissions.
 *   - Permission flags control access to settings areas (API_KEYS_AND_WEBHOOKS, WORKSPACE, etc.)
 *
 * Usage:
 *   TWENTY_API_KEY=<key> npm run setup
 */

// ── Config ──────────────────────────────────────────────────────────────

const METADATA_URL =
  process.env.TWENTY_METADATA_URL ?? "http://localhost:3000/metadata";
const API_KEY = process.env.TWENTY_API_KEY ?? "";

// ── Object metadata IDs ─────────────────────────────────────────────────

const OBJECT_IDS = {
  tenant: "a8aebf66-2d10-40f8-b725-8416d97690d6",
  landlord: "196cf588-a742-49c3-9618-fa781f5318ce",
  property: "211145e3-5d78-41f9-9107-5966a2a186c2",
  room: "41499a90-d17a-46e5-87b3-e6e974332ff6",
  contract: "46651847-a095-4661-a70e-ce85eba8fc04",
  ticket: "bc54918e-2b2f-4a6f-a7b5-6b4799d3ec34",
  person: "048bf164-b759-42e9-a902-7b4d1bff19e8",
  opportunity: "83667f24-c3a9-41ba-a52a-f70eb711d21a",
} as const;

type ObjectKey = keyof typeof OBJECT_IDS;

// ── Types ───────────────────────────────────────────────────────────────

type PermissionFlagType =
  | "API_KEYS_AND_WEBHOOKS"
  | "WORKSPACE"
  | "WORKSPACE_MEMBERS"
  | "ROLES"
  | "DATA_MODEL"
  | "SECURITY"
  | "WORKFLOWS"
  | "IMPERSONATE"
  | "SSO_BYPASS"
  | "APPLICATIONS"
  | "MARKETPLACE_APPS"
  | "LAYOUTS"
  | "BILLING"
  | "AI_SETTINGS"
  | "AI"
  | "VIEWS"
  | "UPLOAD_FILE"
  | "DOWNLOAD_FILE"
  | "SEND_EMAIL_TOOL"
  | "HTTP_REQUEST_TOOL"
  | "CODE_INTERPRETER_TOOL"
  | "IMPORT_CSV"
  | "EXPORT_CSV"
  | "CONNECTED_ACCOUNTS"
  | "PROFILE_INFORMATION";

/** "edit" = read + update + soft-delete; "see" = read-only; "none" = no access */
type AccessLevel = "edit" | "see" | "none";

interface RoleDefinition {
  label: string;
  description: string;
  icon: string;
  /** If true, gets full admin flags */
  isAdmin: boolean;
  /** Per-object access. Unspecified objects default to "none". */
  objectAccess: Partial<Record<ObjectKey, AccessLevel>>;
  /** Which permission flags to grant (settings/tools access) */
  permissionFlags: PermissionFlagType[];
}

// ── Role Definitions ────────────────────────────────────────────────────

const ALL_OBJECTS: ObjectKey[] = [
  "tenant",
  "landlord",
  "property",
  "room",
  "contract",
  "ticket",
  "person",
  "opportunity",
];

/** Utility: creates a record with all objects set to the given access level */
function allObjects(level: AccessLevel): Record<ObjectKey, AccessLevel> {
  const record: Partial<Record<ObjectKey, AccessLevel>> = {};
  for (const key of ALL_OBJECTS) {
    record[key] = level;
  }
  return record as Record<ObjectKey, AccessLevel>;
}

/** Common tool flags that most roles get */
const COMMON_TOOL_FLAGS: PermissionFlagType[] = [
  "VIEWS",
  "UPLOAD_FILE",
  "DOWNLOAD_FILE",
  "PROFILE_INFORMATION",
];

/** All permission flags (for admin) */
const ALL_PERMISSION_FLAGS: PermissionFlagType[] = [
  "API_KEYS_AND_WEBHOOKS",
  "WORKSPACE",
  "WORKSPACE_MEMBERS",
  "ROLES",
  "DATA_MODEL",
  "SECURITY",
  "WORKFLOWS",
  "IMPERSONATE",
  "SSO_BYPASS",
  "APPLICATIONS",
  "MARKETPLACE_APPS",
  "LAYOUTS",
  "BILLING",
  "AI_SETTINGS",
  "AI",
  "VIEWS",
  "UPLOAD_FILE",
  "DOWNLOAD_FILE",
  "SEND_EMAIL_TOOL",
  "HTTP_REQUEST_TOOL",
  "CODE_INTERPRETER_TOOL",
  "IMPORT_CSV",
  "EXPORT_CSV",
  "CONNECTED_ACCOUNTS",
  "PROFILE_INFORMATION",
];

const ROLE_DEFINITIONS: RoleDefinition[] = [
  // 1. Admin -- full access
  {
    label: "Admin",
    description: "Full access to everything including settings, data model, and all records",
    icon: "IconShieldCheck",
    isAdmin: true,
    objectAccess: allObjects("edit"),
    permissionFlags: ALL_PERMISSION_FLAGS,
  },

  // 2. PSM (Partner Success Manager)
  {
    label: "PSM",
    description: "Partner Success Manager: manages landlords, properties, contracts, and tickets; read-only on tenants",
    icon: "IconHandshake",
    isAdmin: false,
    objectAccess: {
      landlord: "edit",
      property: "edit",
      contract: "edit",
      ticket: "edit",
      tenant: "see",
      room: "see",
      person: "see",
      opportunity: "see",
    },
    permissionFlags: [...COMMON_TOOL_FLAGS, "IMPORT_CSV", "EXPORT_CSV"],
  },

  // 3. CX Associate
  {
    label: "CX Associate",
    description: "Customer Experience: manages tenants and tickets; read-only on property, room, contract",
    icon: "IconHeadset",
    isAdmin: false,
    objectAccess: {
      tenant: "edit",
      ticket: "edit",
      person: "edit",
      property: "see",
      room: "see",
      contract: "see",
      landlord: "none",
      opportunity: "none",
    },
    permissionFlags: [...COMMON_TOOL_FLAGS, "EXPORT_CSV"],
  },

  // 4. Leasing Agent
  {
    label: "Leasing Agent",
    description: "Leasing: manages people, tenants, and opportunities; read-only on other objects",
    icon: "IconKey",
    isAdmin: false,
    objectAccess: {
      person: "edit",
      tenant: "edit",
      opportunity: "edit",
      property: "see",
      room: "see",
      contract: "see",
      landlord: "see",
      ticket: "see",
    },
    permissionFlags: [...COMMON_TOOL_FLAGS, "IMPORT_CSV", "EXPORT_CSV"],
  },

  // 5. Supply Agent
  {
    label: "Supply Agent",
    description: "Supply: manages landlords, properties, rooms, and opportunities; read-only on others",
    icon: "IconTruck",
    isAdmin: false,
    objectAccess: {
      landlord: "edit",
      property: "edit",
      room: "edit",
      opportunity: "edit",
      person: "see",
      tenant: "see",
      contract: "see",
      ticket: "see",
    },
    permissionFlags: [...COMMON_TOOL_FLAGS, "IMPORT_CSV", "EXPORT_CSV"],
  },

  // 6. F4B Sales
  {
    label: "F4B Sales",
    description: "Furnished for Business sales: manages people and opportunities; no access to tenants/tickets",
    icon: "IconBriefcase",
    isAdmin: false,
    objectAccess: {
      person: "edit",
      opportunity: "edit",
      property: "see",
      room: "see",
      contract: "see",
      landlord: "see",
      tenant: "none",
      ticket: "none",
    },
    permissionFlags: [...COMMON_TOOL_FLAGS, "IMPORT_CSV", "EXPORT_CSV"],
  },

  // 7. Maintenance
  {
    label: "Maintenance",
    description: "Maintenance team: manages tickets; read-only on people, tenants, properties; no access to contracts/opportunities",
    icon: "IconTool",
    isAdmin: false,
    objectAccess: {
      ticket: "edit",
      person: "see",
      tenant: "see",
      property: "see",
      room: "see",
      contract: "none",
      opportunity: "none",
      landlord: "none",
    },
    permissionFlags: [...COMMON_TOOL_FLAGS],
  },

  // 8. Finance
  {
    label: "Finance",
    description: "Finance team: manages landlord financials and contracts; read-only on everything else",
    icon: "IconReportMoney",
    isAdmin: false,
    objectAccess: {
      landlord: "edit",
      contract: "edit",
      tenant: "see",
      property: "see",
      room: "see",
      ticket: "see",
      person: "see",
      opportunity: "see",
    },
    permissionFlags: [...COMMON_TOOL_FLAGS, "IMPORT_CSV", "EXPORT_CSV"],
  },

  // 9. Management
  {
    label: "Management",
    description: "Management: read-only access to all objects, no edit permissions",
    icon: "IconEye",
    isAdmin: false,
    objectAccess: allObjects("see"),
    permissionFlags: [...COMMON_TOOL_FLAGS, "EXPORT_CSV"],
  },
];

// ── GraphQL client ──────────────────────────────────────────────────────

async function gql<T>(query: string): Promise<T> {
  const res = await fetch(METADATA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const json = (await res.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }

  if (!json.data) {
    throw new Error("No data in response");
  }

  return json.data;
}

function esc(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
}

// ── Queries ─────────────────────────────────────────────────────────────

interface ExistingRole {
  id: string;
  label: string;
  description: string | null;
  isEditable: boolean;
  canUpdateAllSettings: boolean;
  canReadAllObjectRecords: boolean;
  canUpdateAllObjectRecords: boolean;
}

async function getExistingRoles(): Promise<ExistingRole[]> {
  const data = await gql<{ getRoles: ExistingRole[] }>(
    `{ getRoles { id label description isEditable canUpdateAllSettings canReadAllObjectRecords canUpdateAllObjectRecords } }`
  );
  return data.getRoles;
}

// ── Mutations ───────────────────────────────────────────────────────────

async function createRole(def: RoleDefinition): Promise<string> {
  const mutation = `mutation {
    createOneRole(createRoleInput: {
      label: "${esc(def.label)}"
      description: "${esc(def.description)}"
      icon: "${esc(def.icon)}"
      canUpdateAllSettings: ${def.isAdmin}
      canAccessAllTools: ${def.isAdmin}
      canReadAllObjectRecords: ${def.isAdmin}
      canUpdateAllObjectRecords: ${def.isAdmin}
      canSoftDeleteAllObjectRecords: ${def.isAdmin}
      canDestroyAllObjectRecords: ${def.isAdmin}
      canBeAssignedToUsers: true
      canBeAssignedToAgents: false
      canBeAssignedToApiKeys: ${def.isAdmin}
    }) { id label }
  }`;

  const data = await gql<{ createOneRole: { id: string; label: string } }>(mutation);
  return data.createOneRole.id;
}

async function upsertObjectPermissions(
  roleId: string,
  objectAccess: Partial<Record<ObjectKey, AccessLevel>>
): Promise<void> {
  const permissions: string[] = [];

  for (const [key, level] of Object.entries(objectAccess)) {
    const objectMetadataId = OBJECT_IDS[key as ObjectKey];
    if (!objectMetadataId) continue;

    const canRead = level === "edit" || level === "see";
    const canUpdate = level === "edit";
    const canSoftDelete = level === "edit";
    const canDestroy = false; // Only admins can hard-delete

    permissions.push(
      `{ objectMetadataId: "${objectMetadataId}", canReadObjectRecords: ${canRead}, canUpdateObjectRecords: ${canUpdate}, canSoftDeleteObjectRecords: ${canSoftDelete}, canDestroyObjectRecords: ${canDestroy} }`
    );
  }

  if (permissions.length === 0) return;

  const mutation = `mutation {
    upsertObjectPermissions(upsertObjectPermissionsInput: {
      roleId: "${roleId}"
      objectPermissions: [${permissions.join(", ")}]
    }) { objectMetadataId }
  }`;

  await gql<{ upsertObjectPermissions: Array<{ objectMetadataId: string }> }>(mutation);
}

async function upsertPermissionFlags(
  roleId: string,
  flags: PermissionFlagType[]
): Promise<void> {
  if (flags.length === 0) return;

  const flagList = flags.map((f) => f).join(", ");

  const mutation = `mutation {
    upsertPermissionFlags(upsertPermissionFlagsInput: {
      roleId: "${roleId}"
      permissionFlagKeys: [${flagList}]
    }) { id }
  }`;

  await gql<{ upsertPermissionFlags: Array<{ id: string }> }>(mutation);
}

// ── Main ────────────────────────────────────────────────────────────────

interface SetupResult {
  rolesCreated: string[];
  rolesSkipped: string[];
  permissionsSet: number;
  errors: Array<{ context: string; message: string }>;
}

function banner(msg: string): void {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${msg}`);
  console.log(`${"=".repeat(60)}`);
}

async function main(): Promise<SetupResult> {
  const result: SetupResult = {
    rolesCreated: [],
    rolesSkipped: [],
    permissionsSet: 0,
    errors: [],
  };

  if (!API_KEY) {
    console.error("ERROR: TWENTY_API_KEY environment variable is required.");
    process.exit(1);
  }

  console.log("Flent Twenty CRM -- RBAC Role Setup");
  console.log(`Metadata API: ${METADATA_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  // ── Step 1: Fetch existing roles ────────────────────────────────────
  banner("Step 1: Fetching existing roles");

  let existingRoles: ExistingRole[];
  try {
    existingRoles = await getExistingRoles();
    console.log(`  Found ${existingRoles.length} existing roles:`);
    for (const r of existingRoles) {
      console.log(`    - ${r.label} (${r.id})`);
    }
  } catch (err) {
    console.error("Failed to fetch roles:", err);
    process.exit(1);
  }

  const existingByLabel = new Map<string, ExistingRole>();
  for (const r of existingRoles) {
    existingByLabel.set(r.label, r);
  }

  // ── Step 2: Create roles + set permissions ──────────────────────────
  banner("Step 2: Creating 9 roles");

  for (const def of ROLE_DEFINITIONS) {
    // Idempotency: skip if role with same label exists
    if (existingByLabel.has(def.label)) {
      const existing = existingByLabel.get(def.label)!;
      console.log(`  [skip] "${def.label}" already exists (${existing.id})`);
      result.rolesSkipped.push(def.label);

      // Still update permissions on existing roles (unless it's the default Admin/Member)
      if (existing.isEditable) {
        try {
          await upsertObjectPermissions(existing.id, def.objectAccess);
          await upsertPermissionFlags(existing.id, def.permissionFlags);
          console.log(`    [updated] Permissions refreshed for "${def.label}"`);
          result.permissionsSet++;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`    [error] Updating permissions for "${def.label}": ${msg}`);
          result.errors.push({ context: `${def.label}.permissions`, message: msg });
        }
      }
      continue;
    }

    try {
      // Create role
      const roleId = await createRole(def);
      console.log(`  [created] "${def.label}" -> ${roleId}`);
      result.rolesCreated.push(def.label);

      // Set object-level permissions (skip for admin, which has "all" flags)
      if (!def.isAdmin) {
        await upsertObjectPermissions(roleId, def.objectAccess);
        console.log(`    [permissions] Object permissions set for "${def.label}"`);
      }

      // Set permission flags
      await upsertPermissionFlags(roleId, def.permissionFlags);
      console.log(`    [flags] Permission flags set for "${def.label}"`);
      result.permissionsSet++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  [error] "${def.label}": ${msg}`);
      result.errors.push({ context: def.label, message: msg });
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────
  banner("RBAC Setup Complete");
  console.log(`  Roles created:     ${result.rolesCreated.length}`);
  console.log(`  Roles skipped:     ${result.rolesSkipped.length}`);
  console.log(`  Permissions set:   ${result.permissionsSet}`);
  console.log(`  Errors:            ${result.errors.length}`);

  if (result.errors.length > 0) {
    console.log("\n  Error details:");
    for (const e of result.errors) {
      console.log(`    - [${e.context}] ${e.message}`);
    }
  }

  if (result.rolesCreated.length > 0) {
    console.log("\n  Roles created:");
    for (const name of result.rolesCreated) {
      console.log(`    + ${name}`);
    }
  }

  return result;
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
