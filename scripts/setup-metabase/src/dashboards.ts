/**
 * Dashboard and query definitions for Flent Metabase setup.
 *
 * All SQL queries use a {{SCHEMA}} placeholder that gets replaced
 * with the actual workspace schema name at runtime.
 *
 * Twenty CRM stores custom objects in a workspace-specific schema
 * (e.g. workspace_abc123). Field names in the DB are camelCase
 * (matching the metadata API names). Currency fields use a composite
 * column pattern: "<fieldName>AmountMicros" (bigint) and
 * "<fieldName>CurrencyCode" (text). SELECT fields are stored as text
 * containing the SCREAMING_SNAKE_CASE value.
 */

// ── Types ───────────────────────────────────────────────────────────────────

export interface QueryDefinition {
  name: string;
  sql: string;
  display: "bar" | "pie" | "line" | "table" | "scalar" | "funnel" | "row";
  visualizationSettings?: Record<string, unknown>;
}

export interface DashboardDefinition {
  name: string;
  description: string;
  queries: QueryDefinition[];
}

// ── Dashboard 1: Occupancy Overview ─────────────────────────────────────────

const occupancyOverview: DashboardDefinition = {
  name: "Occupancy Overview",
  description: "Room occupancy rates across properties and areas",
  queries: [
    {
      name: "Total Rooms vs Occupied Rooms",
      display: "pie",
      sql: `
SELECT
  CASE
    WHEN "roomStatus" = 'OCCUPIED' THEN 'Occupied'
    ELSE 'Not Occupied'
  END AS status,
  COUNT(*) AS count
FROM "{{SCHEMA}}"."room"
WHERE "deletedAt" IS NULL
GROUP BY 1
ORDER BY 1
      `.trim(),
      visualizationSettings: {
        "pie.show_legend": true,
        "pie.show_total": true,
      },
    },
    {
      name: "Occupancy Rate by Property",
      display: "bar",
      sql: `
SELECT
  p."propertyName" AS property,
  COUNT(*) FILTER (WHERE r."roomStatus" = 'OCCUPIED') AS occupied,
  COUNT(*) AS total,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE r."roomStatus" = 'OCCUPIED') / NULLIF(COUNT(*), 0),
    1
  ) AS occupancy_pct
FROM "{{SCHEMA}}"."room" r
JOIN "{{SCHEMA}}"."room" r2 ON r.id = r2.id
JOIN "{{SCHEMA}}"."property" p ON r."propertyId" = p.id
WHERE r."deletedAt" IS NULL
  AND p."deletedAt" IS NULL
GROUP BY p."propertyName"
ORDER BY occupancy_pct DESC
      `.trim(),
      visualizationSettings: {
        "graph.x_axis.title_text": "Property",
        "graph.y_axis.title_text": "Occupancy %",
        "graph.metrics": ["occupancy_pct"],
        "graph.dimensions": ["property"],
      },
    },
    {
      name: "Occupancy Rate by Area",
      display: "bar",
      sql: `
SELECT
  p."area" AS area,
  COUNT(*) FILTER (WHERE r."roomStatus" = 'OCCUPIED') AS occupied,
  COUNT(*) AS total,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE r."roomStatus" = 'OCCUPIED') / NULLIF(COUNT(*), 0),
    1
  ) AS occupancy_pct
FROM "{{SCHEMA}}"."room" r
JOIN "{{SCHEMA}}"."property" p ON r."propertyId" = p.id
WHERE r."deletedAt" IS NULL
  AND p."deletedAt" IS NULL
  AND p."area" IS NOT NULL
GROUP BY p."area"
ORDER BY occupancy_pct DESC
      `.trim(),
      visualizationSettings: {
        "graph.x_axis.title_text": "Area",
        "graph.y_axis.title_text": "Occupancy %",
        "graph.metrics": ["occupancy_pct"],
        "graph.dimensions": ["area"],
      },
    },
    {
      name: "Vacant Rooms",
      display: "table",
      sql: `
SELECT
  r."roomId" AS room_id,
  p."propertyName" AS property,
  p."area" AS area,
  r."noLockInRentAmountMicros" / 1000000.0 AS no_lockin_rent,
  r."threeMonthLockInRentAmountMicros" / 1000000.0 AS three_month_rent,
  r."sixMonthLockInRentAmountMicros" / 1000000.0 AS six_month_rent,
  r."elevenMonthLockInRentAmountMicros" / 1000000.0 AS eleven_month_rent
FROM "{{SCHEMA}}"."room" r
JOIN "{{SCHEMA}}"."property" p ON r."propertyId" = p.id
WHERE r."deletedAt" IS NULL
  AND p."deletedAt" IS NULL
  AND r."roomStatus" = 'VACANT'
ORDER BY p."propertyName", r."roomId"
      `.trim(),
    },
  ],
};

// ── Dashboard 2: Revenue by Property ────────────────────────────────────────

const revenueByProperty: DashboardDefinition = {
  name: "Revenue by Property",
  description: "Monthly rent collected and revenue trends by property and area",
  queries: [
    {
      name: "Monthly Rent by Property (Active Contracts)",
      display: "bar",
      sql: `
SELECT
  p."propertyName" AS property,
  SUM(c."monthlyLicenseFeeAmountMicros") / 1000000.0 AS monthly_rent
FROM "{{SCHEMA}}"."contract" c
JOIN "{{SCHEMA}}"."property" p ON c."propertyId" = p.id
WHERE c."deletedAt" IS NULL
  AND p."deletedAt" IS NULL
  AND c."state" = 'ACTIVE'
  AND c."contractType" = 'TENANT_AGREEMENT'
GROUP BY p."propertyName"
ORDER BY monthly_rent DESC
      `.trim(),
      visualizationSettings: {
        "graph.x_axis.title_text": "Property",
        "graph.y_axis.title_text": "Monthly Rent (INR)",
        "graph.y_axis.auto": true,
      },
    },
    {
      name: "Total Monthly Revenue Trend",
      display: "line",
      sql: `
SELECT
  DATE_TRUNC('month', c."startDate") AS month,
  SUM(c."monthlyLicenseFeeAmountMicros") / 1000000.0 AS monthly_revenue
FROM "{{SCHEMA}}"."contract" c
WHERE c."deletedAt" IS NULL
  AND c."state" IN ('ACTIVE', 'RENEWED')
  AND c."contractType" = 'TENANT_AGREEMENT'
  AND c."startDate" IS NOT NULL
GROUP BY DATE_TRUNC('month', c."startDate")
ORDER BY month
      `.trim(),
      visualizationSettings: {
        "graph.x_axis.title_text": "Month",
        "graph.y_axis.title_text": "Revenue (INR)",
        "graph.show_values": true,
      },
    },
    {
      name: "Revenue per Area",
      display: "pie",
      sql: `
SELECT
  p."area" AS area,
  SUM(c."monthlyLicenseFeeAmountMicros") / 1000000.0 AS monthly_rent
FROM "{{SCHEMA}}"."contract" c
JOIN "{{SCHEMA}}"."property" p ON c."propertyId" = p.id
WHERE c."deletedAt" IS NULL
  AND p."deletedAt" IS NULL
  AND c."state" = 'ACTIVE'
  AND c."contractType" = 'TENANT_AGREEMENT'
  AND p."area" IS NOT NULL
GROUP BY p."area"
ORDER BY monthly_rent DESC
      `.trim(),
      visualizationSettings: {
        "pie.show_legend": true,
        "pie.show_total": true,
      },
    },
  ],
};

// ── Dashboard 3: Pipeline Funnel ────────────────────────────────────────────

const pipelineFunnel: DashboardDefinition = {
  name: "Pipeline Funnel",
  description: "Opportunity pipeline stages and conversion rates",
  queries: [
    {
      name: "Occupancy Pipeline by Stage",
      display: "bar",
      sql: `
SELECT
  o."stage" AS stage,
  COUNT(*) AS count
FROM "{{SCHEMA}}"."opportunity" o
WHERE o."deletedAt" IS NULL
  AND o."pipelineType" = 'OCCUPANCY'
GROUP BY o."stage"
ORDER BY count DESC
      `.trim(),
      visualizationSettings: {
        "graph.x_axis.title_text": "Stage",
        "graph.y_axis.title_text": "Count",
      },
    },
    {
      name: "Reserve Pipeline by Stage",
      display: "bar",
      sql: `
SELECT
  o."stage" AS stage,
  COUNT(*) AS count
FROM "{{SCHEMA}}"."opportunity" o
WHERE o."deletedAt" IS NULL
  AND o."pipelineType" = 'RESERVE'
GROUP BY o."stage"
ORDER BY count DESC
      `.trim(),
      visualizationSettings: {
        "graph.x_axis.title_text": "Stage",
        "graph.y_axis.title_text": "Count",
      },
    },
    {
      name: "Supply Pipeline by Stage",
      display: "bar",
      sql: `
SELECT
  o."stage" AS stage,
  COUNT(*) AS count
FROM "{{SCHEMA}}"."opportunity" o
WHERE o."deletedAt" IS NULL
  AND o."pipelineType" = 'SUPPLY'
GROUP BY o."stage"
ORDER BY count DESC
      `.trim(),
      visualizationSettings: {
        "graph.x_axis.title_text": "Stage",
        "graph.y_axis.title_text": "Count",
      },
    },
    {
      name: "Opportunities by Pipeline Type",
      display: "pie",
      sql: `
SELECT
  o."pipelineType" AS pipeline,
  COUNT(*) AS count
FROM "{{SCHEMA}}"."opportunity" o
WHERE o."deletedAt" IS NULL
  AND o."pipelineType" IS NOT NULL
GROUP BY o."pipelineType"
ORDER BY count DESC
      `.trim(),
      visualizationSettings: {
        "pie.show_legend": true,
        "pie.show_total": true,
      },
    },
    {
      name: "Move-Ins This Month (Conversion Proxy)",
      display: "scalar",
      sql: `
SELECT
  COUNT(*) AS move_ins_this_month
FROM "{{SCHEMA}}"."tenant" t
WHERE t."deletedAt" IS NULL
  AND t."moveInDate" >= DATE_TRUNC('month', CURRENT_DATE)
  AND t."moveInDate" < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
      `.trim(),
    },
  ],
};

// ── Dashboard 4: Ticket SLA ────────────────────────────────────────────────

const ticketSla: DashboardDefinition = {
  name: "Ticket SLA",
  description: "Open ticket aging, resolution times, and CSAT scores",
  queries: [
    {
      name: "Open Tickets by Age",
      display: "bar",
      sql: `
SELECT
  CASE
    WHEN CURRENT_DATE - t."createdAt"::date <= 3  THEN '0-3 days'
    WHEN CURRENT_DATE - t."createdAt"::date <= 7  THEN '3-7 days'
    ELSE '7+ days'
  END AS age_bucket,
  COUNT(*) AS count
FROM "{{SCHEMA}}"."ticket" t
WHERE t."deletedAt" IS NULL
  AND t."ticketStatus" NOT IN ('CLOSED', 'READY_FOR_CLOSURE')
GROUP BY 1
ORDER BY
  CASE
    WHEN CURRENT_DATE - t."createdAt"::date <= 3 THEN 1
    WHEN CURRENT_DATE - t."createdAt"::date <= 7 THEN 2
    ELSE 3
  END
      `.trim(),
      visualizationSettings: {
        "graph.x_axis.title_text": "Age Bucket",
        "graph.y_axis.title_text": "Open Tickets",
      },
    },
    {
      name: "Avg Resolution Time by Category (days)",
      display: "bar",
      sql: `
SELECT
  t."category" AS category,
  ROUND(
    AVG(
      EXTRACT(EPOCH FROM (t."updatedAt" - t."createdAt")) / 86400.0
    )::numeric,
    1
  ) AS avg_days_to_resolve
FROM "{{SCHEMA}}"."ticket" t
WHERE t."deletedAt" IS NULL
  AND t."ticketStatus" IN ('CLOSED', 'READY_FOR_CLOSURE')
  AND t."category" IS NOT NULL
GROUP BY t."category"
ORDER BY avg_days_to_resolve DESC
      `.trim(),
      visualizationSettings: {
        "graph.x_axis.title_text": "Category",
        "graph.y_axis.title_text": "Avg Days to Resolve",
      },
    },
    {
      name: "CSAT Score Distribution",
      display: "pie",
      sql: `
SELECT
  CASE
    WHEN t."tenantRating" = 'RATING_1' THEN '1 Star'
    WHEN t."tenantRating" = 'RATING_2' THEN '2 Stars'
    WHEN t."tenantRating" = 'RATING_3' THEN '3 Stars'
    WHEN t."tenantRating" = 'RATING_4' THEN '4 Stars'
    WHEN t."tenantRating" = 'RATING_5' THEN '5 Stars'
    ELSE 'Unrated'
  END AS rating,
  COUNT(*) AS count
FROM "{{SCHEMA}}"."ticket" t
WHERE t."deletedAt" IS NULL
  AND t."tenantRating" IS NOT NULL
GROUP BY 1
ORDER BY rating
      `.trim(),
      visualizationSettings: {
        "pie.show_legend": true,
        "pie.show_total": true,
      },
    },
    {
      name: "Total Open Tickets",
      display: "scalar",
      sql: `
SELECT COUNT(*) AS open_tickets
FROM "{{SCHEMA}}"."ticket" t
WHERE t."deletedAt" IS NULL
  AND t."ticketStatus" NOT IN ('CLOSED', 'READY_FOR_CLOSURE')
      `.trim(),
    },
  ],
};

// ── Dashboard 5: Lease Expiry Calendar ──────────────────────────────────────

const leaseExpiry: DashboardDefinition = {
  name: "Lease Expiry Calendar",
  description: "Upcoming contract expirations at 30/60/90-day horizons",
  queries: [
    {
      name: "Contracts Expiring in 30 Days",
      display: "table",
      sql: `
SELECT
  c."contractId" AS contract_id,
  c."contractType" AS type,
  c."state" AS state,
  p."propertyName" AS property,
  r."roomId" AS room,
  c."endDate" AS end_date,
  c."monthlyLicenseFeeAmountMicros" / 1000000.0 AS monthly_rent,
  (c."endDate"::date - CURRENT_DATE) AS days_remaining
FROM "{{SCHEMA}}"."contract" c
LEFT JOIN "{{SCHEMA}}"."property" p ON c."propertyId" = p.id
LEFT JOIN "{{SCHEMA}}"."room" r ON c."roomId" = r.id
WHERE c."deletedAt" IS NULL
  AND c."state" IN ('ACTIVE', 'RENEWED')
  AND c."endDate" IS NOT NULL
  AND c."endDate"::date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
ORDER BY c."endDate"
      `.trim(),
    },
    {
      name: "Expiring in 60 Days (Count)",
      display: "scalar",
      sql: `
SELECT COUNT(*) AS contracts_expiring_60d
FROM "{{SCHEMA}}"."contract" c
WHERE c."deletedAt" IS NULL
  AND c."state" IN ('ACTIVE', 'RENEWED')
  AND c."endDate" IS NOT NULL
  AND c."endDate"::date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '60 days'
      `.trim(),
    },
    {
      name: "Expiring in 90 Days (Count)",
      display: "scalar",
      sql: `
SELECT COUNT(*) AS contracts_expiring_90d
FROM "{{SCHEMA}}"."contract" c
WHERE c."deletedAt" IS NULL
  AND c."state" IN ('ACTIVE', 'RENEWED')
  AND c."endDate" IS NOT NULL
  AND c."endDate"::date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '90 days'
      `.trim(),
    },
    {
      name: "Expiry Timeline by Month",
      display: "bar",
      sql: `
SELECT
  TO_CHAR(DATE_TRUNC('month', c."endDate"), 'YYYY-MM') AS month,
  COUNT(*) AS expiring_contracts
FROM "{{SCHEMA}}"."contract" c
WHERE c."deletedAt" IS NULL
  AND c."state" IN ('ACTIVE', 'RENEWED')
  AND c."endDate" IS NOT NULL
  AND c."endDate"::date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', c."endDate")
ORDER BY month
      `.trim(),
      visualizationSettings: {
        "graph.x_axis.title_text": "Month",
        "graph.y_axis.title_text": "Contracts Expiring",
      },
    },
  ],
};

// ── Export ───────────────────────────────────────────────────────────────────

export const DASHBOARDS: DashboardDefinition[] = [
  occupancyOverview,
  revenueByProperty,
  pipelineFunnel,
  ticketSla,
  leaseExpiry,
];
