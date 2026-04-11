# HubSpot to Twenty CRM: Migration Evaluation & Comparative Analysis

**Prepared**: April 8, 2026  
**Context**: Property & Tenant Management company evaluating migration from HubSpot to self-hosted Twenty CRM on GCP  
**Company**: Flent (Portal ID: 45469632) -- Property & co-living management, Bangalore, India  
**Status**: Complete (all research tracks finished)

---

## Table of Contents

**Part I: Platform Evaluation**
1. [Executive Summary](#1-executive-summary)
2. [Twenty Technical Architecture (from Codebase)](#2-twenty-technical-architecture)
3. [Feature-by-Feature Comparison](#3-feature-by-feature-comparison)
4. [What Twenty Does Better Than HubSpot](#4-what-twenty-does-better)
5. [What HubSpot Does Better Than Twenty](#5-what-hubspot-does-better)

**Part II: 50-Dimension Deep Gap Analysis (Autoresearch)**
6. [Gap Analysis Summary](#6-gap-analysis-summary)
7. [Critical Gaps Ranked by Flent Impact](#7-critical-gaps-ranked-by-flent-impact)
8. [Full 50-Dimension Matrix](#8-full-50-dimension-matrix)
9. [Where Twenty Wins](#9-where-twenty-wins)

**Part III: GCP Infrastructure & Data Model**
10. [Self-Hosting on GCP: Architecture & Optimization](#10-self-hosting-on-gcp)
11. [Property & Tenant Management: Data Model Design](#11-property-tenant-management-data-model)

**Part IV: Migration & Decision**
12. [Migration Plan](#12-migration-plan)
13. [Risk Assessment](#13-risk-assessment)
14. [Cost Comparison](#14-cost-comparison)
15. [Final Recommendation](#15-final-recommendation)
16. [HubSpot Audit: Flent (Portal 45469632)](#16-hubspot-audit)

---

## 1. Executive Summary

**Twenty CRM** is a modern, open-source CRM (AGPL v3 + commercial dual license) built on PostgreSQL 16, NestJS, React, and GraphQL. It is a viable HubSpot replacement **for your specific use case** (property & tenant management with custom data models), but requires significant upfront investment in custom development and external tooling to match HubSpot's out-of-box capabilities.

### The Verdict

| Dimension | Winner | Notes |
|-----------|--------|-------|
| Data model flexibility | **Twenty** | Unlimited custom objects/fields, full source access |
| Cost at scale | **Twenty** | $0 software + ~$370-750/mo GCP infra vs $20-100/user/mo HubSpot |
| UI/UX quality | **Twenty** | Modern Notion-inspired interface, faster navigation |
| API quality | **Twenty** | REST + GraphQL + MCP, auto-generated, no rate limits (self-hosted) |
| Workflow automation | **HubSpot** | Vastly more mature visual workflow builder |
| Reporting/analytics | **HubSpot** | Twenty has essentially none (Labs only) |
| Email marketing | **HubSpot** | Twenty has no native campaigns, sequences, or templates |
| Integration ecosystem | **HubSpot** | 350+ native vs Twenty's handful |
| Enterprise features | **HubSpot** | SSO, RBAC, audit logs, compliance certifications |
| Data ownership | **Twenty** | Full sovereignty, self-hosted |
| Long-term flexibility | **Twenty** | Open source, no vendor lock-in |

### Bottom Line

Your HubSpot setup (Portal 45469632) is a **heavily customized property management platform** with 16,853 records across 8 objects, 613 custom properties, 3 deal pipelines, 2 ticket pipelines, and ~100 workflows. You've effectively outgrown HubSpot's data model -- 364 custom properties on Contacts alone, bank account fields duplicated 15 times, 50+ deprecated fields, and 0 Company records (the standard CRM model doesn't fit).

Twenty is the right move because your core need is **custom data management** (properties, tenants, contracts, rooms), not marketing/sales. The Contact property bloat would be properly normalized into relational objects. Your 4 custom objects map cleanly. Main challenges: rebuilding ~60 workflows (especially WhatsApp automation), setting up payment integration webhooks, and deploying Grafana/Metabase for reporting. Expect **3-4 weeks** of developer effort for a production migration.

---

## 2. Twenty Technical Architecture

*Source: Direct codebase analysis of `github.com/twentyhq/twenty`*

### Core Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| **Database** | PostgreSQL 16 | TypeORM 0.3, `uuid-ossp` + `unaccent` + `pgvector` extensions |
| **Analytics DB** | ClickHouse | Optional, for telemetry/usage events |
| **Backend** | NestJS 11.1 + Express | TypeScript, modular architecture |
| **Frontend** | React 18 + Vite | Jotai state, Apollo Client, Linaria CSS-in-JS |
| **API** | GraphQL (Yoga 4.0) + REST | Auto-generated per workspace, plus MCP protocol |
| **Queue** | BullMQ 5.40 + Redis | Background jobs, cron tasks, workflow execution |
| **Cache** | Redis | Sessions, cache-manager, GraphQL subscriptions |
| **File Storage** | Local FS or S3-compatible | AWS SDK v3, supports GCS via HMAC interop |
| **Auth** | JWT + Passport.js | Google/Microsoft OAuth, SAML (Enterprise), 2FA |
| **AI** | Multi-provider | OpenAI, Anthropic, Google, Mistral, xAI, Bedrock |

### Key Architecture Files

```
packages/twenty-server/src/database/typeorm/core/core.datasource.ts    -- DB connection
packages/twenty-server/src/engine/api/graphql/                          -- GraphQL API
packages/twenty-server/src/engine/api/rest/                             -- REST API
packages/twenty-server/src/engine/api/mcp/                              -- MCP protocol
packages/twenty-server/src/engine/metadata-modules/object-metadata/     -- Custom objects
packages/twenty-server/src/engine/metadata-modules/field-metadata/      -- Custom fields
packages/twenty-server/src/modules/workflow/                            -- Workflow engine
packages/twenty-server/src/engine/metadata-modules/ai/                  -- AI agents/chat
packages/twenty-docker/docker-compose.yml                               -- Docker deployment
```

### Database Architecture Details

- **Schema**: `core` schema for system tables, workspace-specific schemas for tenant data
- **Migrations**: TypeORM migration-based, sequential version upgrades required
- **Connection**: `PG_DATABASE_URL` environment variable, configurable timeout (`PG_DATABASE_PRIMARY_TIMEOUT_MS`, default 10s)
- **FDW Support**: `postgres_fdw`, `mysql_fdw`, Supabase wrappers (Airtable, BigQuery, S3, Stripe)
- **Config Storage**: Configuration variables can be stored in DB with 15-second refresh cycle, or via environment variables only

### Docker Services (4 containers)

1. **server** (port 3000) -- API + frontend, health check at `/healthz`
2. **worker** -- BullMQ job processor (same image, `yarn worker:prod`)
3. **db** -- PostgreSQL 16 (`twentycrm/twenty-postgres-spilo`)
4. **redis** -- Cache + queue backend (`maxmemory-policy noeviction`)

---

## 3. Feature-by-Feature Comparison

### CRM Core

| Feature | Twenty | HubSpot | Gap Severity |
|---------|--------|---------|-------------|
| Contact management | Custom fields, custom objects | Lifecycle stages, enrichment | Low |
| Company records | Full support | Auto-enrichment from domain | Low |
| Deal/opportunity pipeline | Kanban + list views | Multi-pipeline, forecasting, weighted | Medium |
| Tasks | Basic task management | Queues, sequences, auto-assignment | Medium |
| Notes & activity log | Timeline-based | Full timeline (calls, meetings, emails) | Low |
| Products/quotes/CPQ | Not available | Full CPQ capabilities | High (if needed) |
| Territory management | Not available | Enterprise tier | N/A for your use case |
| Duplicate detection | API-based (`find-duplicates`) | Automatic dedup | Low |
| Record merging | API-based (`/merge`) | Built-in UI | Low |

### Customization

| Feature | Twenty | HubSpot | Gap Severity |
|---------|--------|---------|-------------|
| Custom objects | Unlimited, first-class API citizens | Requires Operations Hub Pro ($800/mo) | **Twenty wins** |
| Custom fields | Unlimited, many types | Extensive but tier-limited | **Twenty wins** |
| Custom views | Saved filters/views | Advanced views, conditional | Low |
| Source code access | Full (AGPL) | None | **Twenty wins** |
| Data model flexibility | Shape around your business | Structured, opinionated | **Twenty wins** |

### APIs

| Feature | Twenty | HubSpot | Gap Severity |
|---------|--------|---------|-------------|
| REST API | Full CRUD, auto-generated | Comprehensive | Comparable |
| GraphQL API | Full support + playground | Not available | **Twenty wins** |
| MCP (AI protocol) | Native support | Not available | **Twenty wins** |
| Webhooks | Event-driven, HMAC signed | Supported | Comparable |
| Rate limits (self-hosted) | Unlimited | 100-200 calls/10sec | **Twenty wins** |
| Batch operations | Up to 60 records/call | Supported with limits | Comparable |
| SDK | Client SDK (JS/TS) | Official SDKs (Python, Ruby, PHP, Node) | HubSpot wider |

### Automation & Workflows

| Feature | Twenty | HubSpot | Gap Severity |
|---------|--------|---------|-------------|
| Visual workflow builder | Basic (12 action types available) | Advanced multi-branch, delays, if/then | High |
| Available actions | Record CRUD, HTTP, email, code, AI agent, if-else, iterator, delay, filter, form | 100+ native triggers/actions | Medium |
| Email sequences | Not native | Full A/B tested sequences | High |
| Cron triggers | Supported | Event + time triggers | Low |
| External automation | Via API to n8n/Make/Zapier | Native 350+ integrations | High |
| Code in workflows | JavaScript execution (local/Lambda/E2B) | Operations Hub custom code | Comparable |

### Reporting & Analytics

| Feature | Twenty | HubSpot | Gap Severity |
|---------|--------|---------|-------------|
| Dashboards | In Labs only, basic charts (Nivo) | Comprehensive custom builder | **Critical** |
| Pipeline reports | Not available | Revenue forecasting, deal analytics | High |
| Activity tracking | Basic timeline | Email, call, meeting analytics | Medium |
| Custom reports | Must use Grafana/Metabase externally | Drag-and-drop builder | High |
| Attribution | Not available | Multi-touch (Marketing Hub) | N/A for your use case |

### Email & Communication

| Feature | Twenty | HubSpot | Gap Severity |
|---------|--------|---------|-------------|
| Gmail/Outlook sync | OAuth-based bidirectional | Native, seamless | Comparable |
| IMAP support | Supported (`IS_IMAP_SMTP_ENABLED`) | Not native | **Twenty wins** |
| Send email from CRM | Via workflow mail sender action | Full send + tracking | Medium |
| Email templates | Not available | Full template library | Medium |
| Bulk email/campaigns | Not available | Marketing Hub campaigns | High (if needed) |
| Email tracking (open/click) | Not available | Native | Medium |

### Security & Enterprise

| Feature | Twenty | HubSpot | Gap Severity |
|---------|--------|---------|-------------|
| SSO (SAML/OIDC) | Enterprise license only ($19/user/mo) | Professional+ | Medium |
| 2FA | Supported (OTP) | Supported | Comparable |
| RBAC/permissions | Recently improved, not enterprise-grade | Mature role-based access | Medium |
| Audit logs | Basic | Comprehensive | Medium |
| SOC2/GDPR certification | Self-hosted = you own compliance | HubSpot certified | Depends on requirements |
| Data residency | Full control (self-hosted) | Region selection | **Twenty wins** |

---

## 4. What Twenty Does Better

### 1. Data Model Flexibility (Critical for Your Use Case)
Twenty's custom object system is genuinely first-class. Every custom object gets auto-generated REST + GraphQL + MCP endpoints identical to built-in objects. No tier gates, no limits. For property/tenant management where HubSpot's rigid Contact/Company/Deal model is being bent to fit, this is transformative.

### 2. Cost at Scale
- **Twenty self-hosted**: $0 software + $370-750/mo infrastructure
- **HubSpot Professional (10 users)**: $1,000/mo + $800/mo Operations Hub for custom objects
- **HubSpot Professional (50 users)**: $5,000+/mo
- At 50 users, Twenty saves **$50,000-60,000/year**

### 3. API Quality
REST + GraphQL + MCP protocol. Auto-generated documentation per workspace. No rate limits when self-hosted. Batch operations. The GraphQL playground alone makes integration development significantly faster.

### 4. Modern UI/UX
Consistently praised as the best UI in open-source CRM. Notion-inspired, fast page loads (1-2 seconds), intuitive even for non-technical users. The Kanban views, table views, and timeline are polished.

### 5. Full Data Ownership & Sovereignty
Data lives on your GCP infrastructure. No third-party processing. Full control over backups, retention, and compliance. Critical for property management with tenant PII.

### 6. AI Integration (Built-in)
Native multi-provider AI support (OpenAI, Anthropic, Google, etc.) with agents, chat, text generation, and code interpreter. This is not available in HubSpot at this level of integration.

### 7. No Vendor Lock-in
AGPL license means you can fork, modify, and extend without restrictions (as long as modifications to network-served code remain open source). Source code access means you can fix bugs yourself rather than waiting for vendor support.

### 8. IMAP Support
Unlike HubSpot (Gmail/Outlook only), Twenty supports IMAP/SMTP, so self-hosted email solutions work.

---

## 5. What HubSpot Does Better

### 1. Workflow Automation (Significant Gap)
HubSpot's visual workflow builder is years ahead. Multi-branch conditional logic, delays, enrollment triggers on 100+ events, A/B testing, goal-based completion. Twenty's workflow engine has the building blocks (12 action types including code execution, AI agents, and HTTP requests) but the visual builder and trigger variety are far less mature.

### 2. Reporting & Analytics (Critical Gap)
This is Twenty's weakest area. No native dashboards (Labs only), no pipeline reports, no activity analytics. You **must** deploy Grafana or Metabase alongside Twenty and build custom dashboards. HubSpot's drag-and-drop report builder is mature and powerful.

### 3. Email Marketing
No bulk email, no sequences, no A/B testing, no email templates, no open/click tracking. If you send tenant communications via HubSpot's email tools, you'll need to replace this with n8n + SendGrid/Mailchimp or a similar stack.

### 4. Integration Ecosystem
HubSpot has 350+ native marketplace integrations. Twenty has Gmail, Outlook, Calendar, and a Zapier package. Everything else requires custom API development. If you depend on specific HubSpot integrations today, audit which ones and plan API replacements.

### 5. Non-Technical Administration
HubSpot can be configured entirely through the UI by non-developers. Twenty requires developer involvement for anything beyond basic configuration. Custom objects, workflow setup, and especially reporting all need technical skills.

### 6. Support & Documentation
HubSpot has extensive documentation, training (HubSpot Academy), and tiered support. Twenty's documentation is improving but has gaps, especially for advanced self-hosting scenarios. Community support via Discord is active but not guaranteed.

### 7. Permissions & Access Control
HubSpot's RBAC is mature with field-level, record-level, and feature-level permissions. Twenty's permissions system has been recently improved but is not yet enterprise-grade. If different team members should see different data (e.g., maintenance staff vs. management), this is a concern.

---

## 6. Gap Analysis Summary

*Method: 50-iteration autoresearch across HubSpot documentation + Twenty documentation/codebase*

| Severity | Count | Dimensions |
|----------|-------|-----------|
| **CRITICAL** | 20 | Pipeline Mgmt, Record Scoring, Data Quality, Email Sending, Email Templates, Email Marketing, Sequences, WhatsApp, Chat/Live Chat, Reporting, Forecasting, Goals, Forms, Landing Pages, Teams, GDPR/Privacy, Marketplace, AI Features, Mobile App, Customer Portal |
| **HIGH** | 15 | Contact/Record Mgmt, Associations, Lists/Segmentation, Data Import/Export, Calculated Fields, Workflow Triggers, Tasks/Activities, Notes/Documents, User Permissions, SSO/SAML, Audit Logs, Phone/Call, Meeting Scheduling, SMS, Payment Processing |
| **MEDIUM** | 12 | Custom Objects, Record History, Workflow Actions, Workflow Advanced, Multi-Currency, Sandbox, REST API, Webhooks, Google Workspace, Microsoft 365, Zapier/Make/n8n, Slack |
| **TWENTY-WINS** | 3 | Multi-Language/i18n, Backup/DR, GraphQL API |

### Gap Distribution by Category

| Category | CRITICAL | HIGH | MEDIUM | TWENTY-WINS |
|----------|----------|------|--------|-------------|
| Core CRM (1-10) | 3 | 5 | 2 | 0 |
| Communication (11-20) | 6 | 3 | 1 | 0 |
| Automation & Reporting (21-30) | 5 | 3 | 2 | 0 |
| Enterprise & Security (31-40) | 3 | 3 | 2 | 2 |
| Integrations & AI (41-50) | 3 | 1 | 5 | 1 |

**Communication is the weakest area** (6/10 CRITICAL). Twenty is fundamentally a data management CRM, not a communication platform. Every outbound channel (email, WhatsApp, chat, campaigns, sequences) is either absent or severely limited.

**Integrations & AI is the strongest area** (only 3/10 CRITICAL, with 1 TWENTY-WIN). Twenty's API-first architecture (REST + GraphQL + MCP + webhooks) provides a strong foundation for custom integrations.

### Key Insight: HubSpot's Advantages Are Expensive

Many CRITICAL gaps exist in features that HubSpot gates behind expensive tiers:

| HubSpot Feature | Required Tier | Monthly Cost |
|-----------------|--------------|-------------|
| Custom objects (Flent has 4) | Enterprise | $150+/user/mo |
| Workflows (Flent has 100) | Professional | $800+/mo per hub |
| Sequences | Sales Hub Pro | $100/seat/mo |
| Custom reports | Professional | $800+/mo |
| WhatsApp | Marketing/Service Hub Pro | $890+/mo |
| Customer Portal | Service Hub Pro | $90/seat/mo |
| AI (Breeze Agents) | Professional | $800+/mo + credits |
| SSO/SAML | Enterprise | $150+/user/mo |

**To match all listed features in HubSpot: $3,000-5,000+/month. Twenty self-hosted with mitigations: ~$2,000/month.**

---

## 7. Critical Gaps Ranked by Flent Impact

### Tier 1: Migration Blockers (Must solve BEFORE cutover)

All mitigation work will be done using **Claude Code** -- developer bandwidth is not a constraint.

| # | Gap | Why It Blocks Flent | Mitigation (via Claude Code) | Effort |
|---|-----|--------------------|-----------| ------|
| **15** | **WhatsApp Integration** | Primary tenant/landlord channel. 15+ workflows depend on it. Zero WhatsApp in Twenty. | Build n8n + WhatsApp Business API (Meta Cloud API) integration; or connect Superchat/Periskope via Twenty webhooks | 5-7 days |
| **3** | **Pipeline Management** (single pipeline) | Flent runs 3 deal + 2 ticket pipelines. Twenty supports 1 per object. | Use Select fields + filtered views to simulate multiple pipelines. Or fork Twenty and add multi-pipeline support via Claude Code. | 3-5 days |
| **24** | **Reporting & Dashboards** | No cross-object reports. Dashboard in beta. Management needs daily visibility. | Deploy Grafana/Metabase connected to PostgreSQL. Claude Code builds SQL dashboards for occupancy, revenue, maintenance SLAs. | 5-7 days |
| **11** | **Email Sending from CRM** | Cannot compose emails from Twenty. No open/click tracking. | Use Workflow Send Email for automated sends. Accept Gmail/Outlook for manual. Claude Code can build tracking integration. | 2-3 days |
| **8** | **Data Quality & Validation** | No regex validation. Indian phone/Aadhaar/PAN formats not enforced. Breaks WhatsApp automation. | Claude Code builds validation workflows using Twenty's CODE action for regex checks on record create/update. | 3-4 days |
| **29** | **Forms & Lead Capture** | No form builder. Cannot capture property inquiry leads without custom dev. | Claude Code builds custom forms posting to Twenty REST API, or integrates Typeform/Tally via webhooks. | 2-3 days |
| **32** | **Teams & Hierarchy** | No team concept. Cannot route or segment by property cluster. | Claude Code adds custom Team Select field on workspace members + team-based views. | 1-2 days |
| **5** | **Lists & Segmentation** | Views cannot trigger workflows. No cross-object filtering. | Use database event triggers with filter conditions. Claude Code builds complex segment queries via n8n. | 2-3 days |

**Total Tier 1 effort: ~23-34 days (parallelizable with Claude Code to ~2-3 weeks)**

### Tier 2: Significant Gaps (First month post-migration)

| # | Gap | Flent Impact | Mitigation (via Claude Code) |
|---|-----|-------------|-----------|
| **6** | Record Scoring | Cannot score tenant applications | Claude Code builds scoring workflow with CODE action |
| **9** | Calculated/Formula Fields | No auto-computed rent totals, occupancy rates | Workflow-based calculations; native support planned 2026 |
| **12** | Email Templates & Snippets | No reusable templates | Claude Code builds template system via custom objects or Gmail templates |
| **13** | Email Marketing & Campaigns | No bulk email | Mailchimp/SendGrid + n8n integration built by Claude Code |
| **14** | Sequences (Sales Outreach) | No multi-step nurture | Claude Code chains workflow delays + actions for cadences |
| **25** | Forecasting & Revenue | No weighted pipeline, deprecated probability field | Claude Code builds Grafana dashboards with custom forecast SQL |
| **26** | Goals & Targets | No occupancy targets, leasing quotas | Custom Goal object in Twenty or Grafana KPI dashboards |
| **35** | GDPR & Privacy (DPDP Act) | No consent tracking or automated deletion | Claude Code builds Consent object + deletion workflow |
| **39** | Marketplace | Nascent ecosystem | Claude Code builds integrations via Twenty API + n8n |
| **49** | Mobile App | No native app; property managers need on-site access | Responsive web with home screen shortcut; PWA consideration later |
| **50** | Customer Portal | No tenant/landlord self-service | Claude Code builds custom portal using Twenty's GraphQL API |

### Tier 3: Notable Gaps (Address as needed)

| # | Gap | Severity | Quick Mitigation |
|---|-----|----------|-----------------|
| 1 | Contact dedup | HIGH | API dedup scripts |
| 4 | Association labels | HIGH | Custom fields on junction objects |
| 7 | Import/Export limits | HIGH | Use API for large operations |
| 16 | Chat/Live Chat | CRITICAL | External: Chatwoot (OSS) |
| 17 | Phone/Call | HIGH | External VoIP; HubSpot also dropped India +91 |
| 21 | Workflow Triggers | HIGH | Webhook triggers + n8n |
| 27 | Tasks (queues/priorities) | HIGH | Add priority via custom field |
| 28 | Documents/e-signatures | HIGH | External: DocuSign/Digio for leases |
| 30 | Landing Pages | CRITICAL | External: Webflow/WordPress |
| 31 | Row-level permissions | HIGH | Planned 2026; view-based workaround |
| 33 | SSO/SAML | HIGH | Google OAuth sufficient for Google Workspace |
| 34 | Centralized audit logs | HIGH | PostgreSQL query + custom Grafana dashboard |
| 36 | Multi-Currency | MEDIUM | Adequate for INR-only operations |
| 38 | Sandbox | MEDIUM | Spin up second Docker instance |
| 48 | AI Features | CRITICAL | Claude Code + Twenty API + OpenAI; HubSpot AI costs $800+/mo anyway |

---

## 8. Full 50-Dimension Matrix

| # | Dimension | Gap | HubSpot Tier | Category |
|---|-----------|-----|-------------|----------|
| 1 | Contact/Record Management | HIGH | Free/Pro+ | Core CRM |
| 2 | Custom Objects & Fields | MEDIUM | Enterprise | Core CRM |
| 3 | Deal/Pipeline Management | **CRITICAL** | Starter/Pro/Ent | Core CRM |
| 4 | Associations & Relationships | HIGH | Pro+ | Core CRM |
| 5 | Lists & Segmentation | HIGH | Free/Pro | Core CRM |
| 6 | Record Scoring | **CRITICAL** | Pro+ | Core CRM |
| 7 | Data Import/Export | HIGH | All tiers | Core CRM |
| 8 | Data Quality & Validation | **CRITICAL** | Pro+/Ops Hub | Core CRM |
| 9 | Calculated & Formula Fields | HIGH | Pro+ | Core CRM |
| 10 | Record History & Changelog | MEDIUM | All/Enterprise | Core CRM |
| 11 | Email Sending from CRM | **CRITICAL** | Free/Starter+ | Communication |
| 12 | Email Templates & Snippets | **CRITICAL** | Free/Starter+ | Communication |
| 13 | Email Marketing & Campaigns | **CRITICAL** | Free/Pro | Communication |
| 14 | Sequences (Sales Outreach) | **CRITICAL** | Sales Pro | Communication |
| 15 | WhatsApp Integration | **CRITICAL** | Mkt/Svc Pro | Communication |
| 16 | Chat/Live Chat | **CRITICAL** | Free/Pro | Communication |
| 17 | Phone/Call Integration | HIGH | Starter/Pro | Communication |
| 18 | Meeting Scheduling | HIGH | Free/Starter | Communication |
| 19 | Slack Integration | MEDIUM | Free/Pro | Communication |
| 20 | SMS/Text Messaging | HIGH | Pro + Add-on | Communication |
| 21 | Workflow Triggers | HIGH | Pro+ | Automation |
| 22 | Workflow Actions | MEDIUM | Pro+/Ops Hub | Automation |
| 23 | Workflow Advanced | MEDIUM | Pro+ | Automation |
| 24 | Reporting & Dashboards | **CRITICAL** | Pro+ | Reporting |
| 25 | Forecasting & Revenue | **CRITICAL** | Sales Pro/Ent | Reporting |
| 26 | Goals & Targets | **CRITICAL** | Sales/Svc Pro+ | Reporting |
| 27 | Tasks & Activities | HIGH | Free/Pro+ | Automation |
| 28 | Notes & Documents | HIGH | Free/Starter+ | Automation |
| 29 | Forms & Lead Capture | **CRITICAL** | Free/Pro+ | Lead Gen |
| 30 | Landing Pages & Website | **CRITICAL** | Content Hub | Lead Gen |
| 31 | User Permissions & RBAC | HIGH | Enterprise | Enterprise |
| 32 | Teams & Hierarchy | **CRITICAL** | Starter/Ent | Enterprise |
| 33 | SSO / SAML / OIDC | HIGH | Enterprise | Enterprise |
| 34 | Audit Logs | HIGH | Starter/Ent | Enterprise |
| 35 | GDPR & Privacy Tools | **CRITICAL** | All tiers | Enterprise |
| 36 | Multi-Currency | MEDIUM | Starter+ | Enterprise |
| 37 | Multi-Language / i18n | **TWENTY-WINS** | All tiers | Enterprise |
| 38 | Sandbox / Testing | MEDIUM | Enterprise | Enterprise |
| 39 | Marketplace & Extensions | **CRITICAL** | All tiers | Enterprise |
| 40 | Backup & Disaster Recovery | **TWENTY-WINS** | Starter/Ent | Enterprise |
| 41 | API -- REST | MEDIUM | All tiers | Integration |
| 42 | API -- Webhooks | MEDIUM | Free/Ops Pro | Integration |
| 43 | API -- GraphQL | **TWENTY-WINS** | CMS Pro | Integration |
| 44 | Google Workspace | MEDIUM | Free/Starter+ | Integration |
| 45 | Microsoft 365 | MEDIUM | Starter+ | Integration |
| 46 | Zapier / Make / n8n | MEDIUM | Free+ | Integration |
| 47 | Payment Processing | HIGH | Free (Stripe) | Integration |
| 48 | AI Features | **CRITICAL** | Pro ($800+/mo) | Integration |
| 49 | Mobile App | **CRITICAL** | Free | Integration |
| 50 | Customer Portal | **CRITICAL** | Service Pro | Integration |

---

## 9. Where Twenty Wins

### GraphQL API (Dimension 43)
Twenty's first-class GraphQL API with playground, batch upserts, and relationship queries in a single call. HubSpot's GraphQL is CMS-only and locked behind Content Hub Professional ($360/mo). Major developer experience advantage for building Flent's custom integrations with Claude Code.

### Backup & Disaster Recovery (Dimension 40)
Self-hosted PostgreSQL gives unlimited backup control: continuous WAL archiving, point-in-time recovery to any second, configurable retention, cross-region replication. HubSpot limits customer backups to weekly (Pro) or daily (Enterprise) with 14-day download windows.

### Multi-Language / i18n (Dimension 37)
Twenty supports 26+ UI languages via Lingui.js + Crowdin vs HubSpot's 6. Neither supports Hindi/Kannada, but Twenty's broader coverage is an advantage.

### Also: Custom Objects (no tier gating), Data Ownership, Cost at Scale, IMAP Support, MCP Protocol

---

## 10. Self-Hosting on GCP: Architecture & Optimization

### Recommended Architecture

```
                        Cloud CDN (static assets)
                              |
                      Cloud Load Balancer (L7, SSL termination)
                         /            \
              [GKE Cluster]            [GCS Bucket]
              /     |      \           (file storage, S3 interop)
         server   worker   PgBouncer
         (2-4x)   (2-4x)  (sidecar)
                     |
               Cloud SQL              Memorystore
            (PostgreSQL 16)             (Redis)
             HA / Regional            Standard tier
```

### Why GKE + Cloud SQL (Not Docker Compose on a VM)

For a company putting **all data** into Twenty with custom apps and flows, a single Docker Compose VM is a single point of failure. The recommended production architecture:

- **GKE Standard** -- Multi-zone node pools, HPA auto-scaling, pod health checks
- **Cloud SQL PostgreSQL 16** -- Managed HA with automatic failover, PITR backups, read replicas
- **Memorystore Redis** -- Standard tier for HA with automatic failover
- **GCS** -- S3-compatible file storage via HMAC keys (required for multi-replica)
- **Cloud CDN** -- Cache static React frontend assets, reduce server load

### PostgreSQL Optimization for CRM Workloads

For a **16 GB RAM Cloud SQL instance** (medium deployment):

| Parameter | Value | Why |
|-----------|-------|-----|
| `shared_buffers` | 4 GB (25% RAM) | Cache hot CRM data (contacts, properties) |
| `effective_cache_size` | 12 GB (75% RAM) | Help query planner choose index scans |
| `work_mem` | 8-16 MB | Conservative for OLTP; prevents OOM with many connections |
| `maintenance_work_mem` | 512 MB | Speed up VACUUM and index builds |
| `max_connections` | 200 (100 with PgBouncer) | Balance memory per connection |
| `random_page_cost` | 1.1 | SSD storage (Cloud SQL default) |
| `effective_io_concurrency` | 200 | High for SSD |
| `checkpoint_completion_target` | 0.9 | Spread checkpoint I/O |
| `wal_buffers` | 64 MB | Support write-heavy operations |
| `default_statistics_target` | 200 | Better query plans for CRM queries |

### Connection Pooling

Deploy PgBouncer in `transaction` mode (compatible with TypeORM):

```ini
pool_mode = transaction
max_client_conn = 500
default_pool_size = 25
min_pool_size = 5
reserve_pool_size = 5
server_idle_timeout = 300
```

Or use Cloud SQL's new **Managed Connection Pooling** (GA as of Cloud Next '25).

### Critical Environment Variables for Performance

```env
# Memory
NODE_OPTIONS="--max-old-space-size=8192"

# Database
PG_DATABASE_PRIMARY_TIMEOUT_MS=15000

# Storage (REQUIRED for horizontal scaling)
STORAGE_TYPE=s3
STORAGE_S3_REGION=us-central1
STORAGE_S3_NAME=twenty-crm-files
STORAGE_S3_ENDPOINT=https://storage.googleapis.com

# Redis
REDIS_URL=redis://memorystore-ip:6379

# Disable in worker containers
DISABLE_DB_MIGRATIONS=true
DISABLE_CRON_JOBS_REGISTRATION=true
```

### Scaling Strategy

| Component | Scaling | Trigger |
|-----------|---------|---------|
| Server pods | HPA (2-4 replicas) | CPU > 70% |
| Worker pods | HPA (2-4 replicas) | BullMQ queue depth > 1000 |
| Cloud SQL | Vertical + read replica | Connection count > 80% or query latency > 500ms |
| Redis | Vertical | Memory > 80% |
| Worker node pool | Spot VMs | 60-91% cost savings, workers are fault-tolerant |

### Cost Estimates (us-central1)

| Deployment | Team Size | Monthly Cost |
|------------|-----------|-------------|
| **Small** (Docker Compose on VM) | 1-10 users | ~$120-230/mo |
| **Medium** (GKE + Cloud SQL) | 10-50 users | ~$580-756/mo |
| **Large** (GKE + Cloud SQL HA + read replica) | 50-200 users | ~$1,050-1,674/mo |

#### Medium Deployment Breakdown (10-50 users)

| Service | Spec | Cost/mo |
|---------|------|---------|
| GKE cluster | Standard, management fee | ~$74 |
| GKE nodes | 2x e2-standard-4 (Spot for workers) | ~$120 |
| Cloud SQL | db-custom-4-16384, HA, 100GB SSD | ~$350 |
| Memorystore | Standard 3GB | ~$175 |
| Cloud CDN | Cache + egress | ~$20 |
| GCS | 100GB Standard | ~$2 |
| Network egress | Moderate | ~$15 |
| **Total** | | **~$756/mo** |
| **With 1-year CUDs** | | **~$580/mo** |

### Monitoring Stack

| What | Tool | Cost |
|------|------|------|
| Infrastructure metrics | Cloud Monitoring (free tier covers basics) | $0-50/mo |
| Application logs | Cloud Logging | $0-20/mo |
| BullMQ queue metrics | Prometheus + Grafana on GKE | ~$10/mo |
| Database performance | Cloud SQL Insights (built-in) | $0 |
| Uptime monitoring | Cloud Monitoring uptime checks on `/healthz` | $0 |
| Error tracking | Sentry (free tier or self-hosted) | $0-26/mo |

### Key Alerts to Configure

| Alert | Threshold |
|-------|-----------|
| Server response time (p95) | > 2s |
| Health check failure | Any |
| Node.js heap usage | > 80% of limit |
| DB connection count | > 80% of max_connections |
| DB query latency (p95) | > 500ms |
| Redis memory | > 80% |
| BullMQ queue depth | > 1000 waiting jobs |
| Failed BullMQ jobs | Any sustained increase |
| Worker OOM kills | Any occurrence |

---

## 11. Property & Tenant Management: Data Model Design for Flent

### Proposed Twenty Object Model (Based on HubSpot Audit)

The key improvement over HubSpot: **normalize the bloated Contact object** into proper relational entities. This eliminates the 364-property Contact monster.

#### Person Object (Standard -- Tenants, Landlords, Leads)
Uses Twenty's built-in Person object with a `customer_type` field.

| Field | Type | Source (HubSpot) |
|-------|------|-----------------|
| Customer Type | Select: Tenant/Landlord/POC/Lead | `customer_type` |
| Aadhar Number | Text | `aadhar_number` |
| PAN Card | Text | `pan_card` |
| Budget Preference | Number | `budget` |
| Food Preference | Select | `food_preference` |
| Smoking/Pet Prefs | Select | `smoking_preference`, `pet_preference` |
| Preferred Areas | Multi-select | `preferred_area` (HSR, Koramangala, etc.) |
| Lead Source | Select | `lead_source` |
| Lead Sub-Source | Text | `lead_sub_source` |
| Tenant Lifecycle | Select | `tenant_lifecycle` (10-stage enum) |
| Reserve Status | Select | `reserve_status` |
| NPS Score | Number | `nps_score` |
| Move-in Date | Date | `real_move_in_date` |

#### Property Object (Custom -- replaces HubSpot Property ID)
Maps directly from HubSpot's Property ID custom object (196 records, 94 properties).

| Field | Type | Source |
|-------|------|--------|
| PID | Text (required) | `pid` |
| Property Name | Text | `property_name` |
| Building Name | Text | `building_name` |
| Address | Address (composite) | `property_address` |
| Area | Select | `area_name` (HSR, Koramangala, etc.) |
| Cluster | Text | `cluster` |
| Map Link | Link | `map_link` |
| Property Type | Select | `property_type` (8 options) |
| Grade | Select: T0/T1/T2/T3 | `grade` |
| Furnishings | Text | `furnishings` |
| Floors | Number | `floors` |
| Units | Number | `units` |
| Washrooms | Number | `washrooms` |
| Source | Select | `source` (MyGate/NoBroker/WhatsApp/etc.) |
| Lock Box Installed | Boolean | `lock_box_installed` |
| Lock Box Code | Text | `lock_box_code` |
| Gallery Link | Link | `gallery_link` |
| Owner | Relation -> Person (Landlord) | Association |

#### Property Utilities Object (Custom -- NEW, normalizes utility data from Property ID)
Extracts utility credentials from the 94-property Property ID object into a clean sub-entity.

| Field | Type | Notes |
|-------|------|-------|
| Property | Relation -> Property | Parent property |
| Utility Type | Select: Electricity/Gas/Water/WiFi | Category |
| Provider | Text | BESC, ACT, etc. |
| Account ID | Text | Provider account number |
| User ID | Text | Portal login |
| Portal Password | Text (encrypted) | Provider portal access |
| SSID | Text | WiFi only |
| WiFi Password | Text | WiFi only |
| Plan Details | Text | Current plan |
| Registered Number | Phone | Contact for recharges |
| Payment Status | Select | Current/Overdue/Inactive |
| Billing Start | Date | |
| Billing End | Date | |
| Recharge Steps | Rich Text | How to recharge |

#### Room Object (Custom -- replaces HubSpot Room ID)

| Field | Type | Source |
|-------|------|--------|
| Room ID | Text (required) | `roomid` |
| Property | Relation -> Property | Association |
| 3-Month Lock-in Rent | Number | `n3_month_lock_in_rent` |
| 6-Month Lock-in Rent | Number | `n6_month_lock_in_rent` |
| 11-Month Lock-in Rent | Number | `n11_month_lock_in_rent` |
| No Lock-in Rent | Number | `no_lock_in_rent` |

#### Contract Object (Custom -- replaces HubSpot Contract)
Core business object (1,199 records, 54 properties). Maps nearly 1:1.

| Field | Type | Source |
|-------|------|--------|
| Contract ID | Text | `contract_id` |
| Contract UID | Text | `contract_uid` |
| Contract Type | Select: Tenant/Landlord Agreement | `contract_type` |
| State | Select: Active/Renewed/Terminated/Upcoming/Didn't Move In/Room Change | `state` |
| Business Type | Select: Unfurnished/Fully Furnished/F4B/Partially Furnished | `business_type` |
| Person | Relation -> Person | `email_id` / `party_phone` |
| Property | Relation -> Property | `pid` |
| Room | Relation -> Room | `rid` |
| Start Date | Date | `contract_start_date` |
| End Date | Date | `contract_end_date` |
| Go-Live Date | Date | `go_live_date` |
| Lock-in End | Date | `lock_in_end_date` |
| Lock-in Plan | Text | `lock_in_plan` |
| Monthly License Fee | Number | `monthly_license_fee` |
| Base Rent | Number | `property_base_rent` |
| Security Deposit | Number | `security_deposit` |
| Platform Fees | Number | `platform_fees` |
| Convenience Fee | Number | `convenience_fee` |
| Furnishing Fees | Number | `furnishing_fees` |
| FMR | Number | `fmr` |
| GST | Number | `gst` |
| TDS Amount | Number | `tds_amount` |
| Maintenance Amount | Number | `maintenance_amount` |
| Retail Monthly Rent (GMV) | Number | `retail_monthly_rent` |
| Acquisition Cost | Number | `contract_acquisition_cost` |
| Rental Cycle | Text | `rental_cycle` |
| Increment Percentage | Number | `increment_percentage` |
| Move-in Inspector | Text | `move_in_inspector` |
| Move-in Status | Select | `move_in_status` |
| Move-out Inspector | Text | `move_out_inspector` |
| Move-out Status | Select | `move_out_status` |
| Deposit Settled | Boolean | `deposit_settled` |
| Settlement Amount | Number | `settlement_amount` |

#### Bank Account Object (Custom -- NEW, normalizes from Contact properties)
Eliminates the 15+ bank account fields crammed into Contact properties.

| Field | Type | Notes |
|-------|------|-------|
| Person | Relation -> Person (Landlord) | Owner of this account |
| Owner Label | Text | "Owner 1", "Owner 2", "Owner 3" |
| Account Number | Text | Bank account number |
| IFSC Code | Text | |
| Bank Name | Text | |
| Account Type | Select | Savings/Current |
| Is Primary | Boolean | Default payout account |

#### Ticket Object (Custom -- replaces HubSpot Tickets)

| Field | Type | Source |
|-------|------|--------|
| Ticket Type | Select: Support/Landlord | Pipeline mapping |
| Category | Select | `ticket_category` |
| Property | Relation -> Property | Via PID |
| Tenant | Relation -> Person | Reporter |
| Status | Select (pipeline) | Maps to Support/Landlord pipeline stages |
| Priority | Select | `hs_ticket_priority` |
| Cost | Number | `cost_associated` |
| Cost Paid By | Select: Flent/Landlord/Tenant | `cost_paid_by` |
| Resolution Notes | Rich Text | `resolution_notes` |
| Tenant Rating | Number (1-5) | `tenant_rating` |
| Scheduled On | Date | `scheduled_on` |
| Time Slot | Text | `time_slot` |

#### Notification Request Object (Custom)

| Field | Type | Source |
|-------|------|--------|
| Type | Text (required) | `notification_type` |
| Status | Select: Active/Fulfilled/Cancelled | `status` |
| Property | Relation -> Property | `property_id` |
| Room | Relation -> Room | `room_id` |
| Person | Relation -> Person | `greeting_name` |
| NR Flow Stage | Select: Stage 1/2/3 | `nr_flow_stage` |

### Pipeline Mapping

| HubSpot Pipeline | Twenty Pipeline | Stages |
|-----------------|-----------------|--------|
| Reserve (Deals) | Opportunity: Reserve | Form Filled -> Payment Completed -> Qualified -> Options Shared -> Visits Scheduled -> Converted/Dropped/Refunded |
| Occupancy (Deals) | Opportunity: Occupancy | Lead Qualified -> Visit Scheduled -> Visit Completed -> Negotiation -> Token Received -> Move in Done/Dropped |
| F4B (Deals) | Opportunity: F4B | Reach-out -> Contact Made -> Meeting -> Proposal -> Negotiation -> Token -> Converted/Lost |
| Support (Tickets) | Ticket: Support | New -> Waiting on Customer/Vendor/Landlord/Product -> Action Pending -> Ready for Closure -> Closed |
| Landlord (Tickets) | Ticket: Landlord | New -> Waiting on Tenant/Landlord/Flent -> External Dependency -> Vendor Scheduled -> Closed/Blocked |

### Workflow Automations to Rebuild (Priority Order)

**Critical (must have before cutover):**
1. **Rent reminders** (1st/3rd/5th day + overdue) -- WhatsApp via n8n + WA Business API or Superchat webhook
2. **Tenant lifecycle transitions** -- Token Pending through Inventory Check pipeline automation
3. **Rent calculation** -- Monthly license fee, GST, TDS computation on contract creation
4. **Move-out intimation** (<7 days) -- Slack notification to team
5. **Contract state activation** -- Auto-set contract state on move-in completion
6. **Ticket created alerts** -- Slack notification on new support/landlord tickets

**High Priority (week 1 post-migration):**
7. **Reserve pipeline automation** -- Form fill to qualification to deal creation
8. **Token/FMR+Deposit collection** -- Payment status tracking and WhatsApp confirmation
9. **NPS scoring** -- Tenant and landlord NPS calculation and email flows
10. **Landlord payout population** -- Calculate and set payout amounts

**Medium Priority (week 2-3):**
11. **Data sync to Google Sheets** -- Twenty API -> n8n -> Sheets (replaces HubSpot-Sheets connector)
12. **Electricity bill checker** -- Cron job checking utility billing dates on Property objects
13. **Marketing attribution** -- UTM tracking, lead source population
14. **Notification request flows** -- Room availability notifications to waiting list

### Data Cleanup Before Migration

Before migrating, triage the 364 Contact properties:

| Category | Action | ~Count |
|----------|--------|--------|
| Core Flent data | Migrate | ~100 |
| Integration-generated (FormPay, Calendly, Cooby, Koalify, Periskope) | Skip (re-integrate directly with Twenty) | ~75 |
| Deprecated ("[Do not use]") | Skip | ~50 |
| HubSpot system properties | Skip (auto-generated) | ~139 |
| **Properties to actually migrate** | | **~100** |

---

## 12. Migration Plan

### Phase 1: Infrastructure Setup (Days 1-3)

1. Provision GCP infrastructure (GKE, Cloud SQL, Memorystore, GCS)
2. Deploy Twenty via Helm chart
3. Configure SSL, domain, reverse proxy
4. Set up monitoring and alerting
5. Configure SMTP for email notifications
6. Verify health checks and auto-scaling

### Phase 2: Data Model & Customization (Days 4-7)

1. Create custom objects (Properties, Leases, Maintenance Requests, Payments)
2. Configure custom fields on all objects
3. Set up pipeline stages for Maintenance Requests
4. Configure views and filters for each object
5. Set up user accounts and basic permissions
6. Configure Google/Microsoft OAuth for email sync

### Phase 3: Data Migration (Days 8-11)

**Volume**: ~16,853 records total (8,393 contacts, 3,782 deals, 2,739 tickets, 1,199 contracts, 196 properties, 74 rooms, 470 notifications)

1. Triage Contact properties: ~100 to migrate (skip ~264 deprecated/integration/system fields)
2. Export HubSpot data via API (batch GET, not CSV -- preserves associations)
3. Transform: split Contacts by `customer_type` into Tenant/Landlord/Lead Person records
4. Normalize: extract bank accounts from Contact properties into BankAccount objects
5. Normalize: extract utility data from Property ID into PropertyUtilities objects
6. Import via Twenty REST API in dependency order: Properties -> Rooms -> People -> Contracts -> Opportunities -> Tickets -> Notifications
7. Verify: record counts per object, relationship integrity (Contract -> Property -> Room links)
8. Re-create 73 HubSpot lists as Twenty saved views/filters

### Phase 4: Automation & Integrations (Days 12-17)

1. Rebuild HubSpot workflows in Twenty's workflow engine or n8n
2. Set up email notification templates
3. Build Grafana/Metabase dashboards for reporting
4. Connect any external tools via Twenty's API
5. Configure webhooks for real-time integrations
6. Set up backup and disaster recovery procedures

### Phase 5: Testing & Cutover (Days 18-22)

1. Parallel run: operate in both HubSpot and Twenty for 1-2 weeks
2. User acceptance testing with the team
3. Fix issues found during parallel run
4. Final data sync from HubSpot
5. DNS/access cutover to Twenty
6. Decommission HubSpot (keep export backup)

### Phase 6: Post-Migration (Days 23-30)

1. Monitor performance and fix issues
2. Gather team feedback, iterate on views/workflows
3. Build additional dashboards based on real usage
4. Document custom configuration for the team
5. Train team on Twenty's interface

---

## 13. Risk Assessment

### High Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Reporting gap** -- Team relies on HubSpot dashboards daily | Work blocked without data visibility | Build Grafana dashboards BEFORE migration; deploy Metabase as backup |
| **Workflow gaps** -- Critical automations break during migration | Missed lease renewals, late rent notices | Map every HubSpot workflow first; rebuild and test in parallel run |
| **Upgrade fragility** -- Known issue with blank screens after version upgrades | CRM downtime | Always backup before upgrading; test upgrades in staging first; pin to stable versions |
| **Developer dependency** -- Twenty requires dev skills for admin | Mitigated: Claude Code handles development | Document everything; use Twenty's DB-backed config (admin panel); Claude Code available for ongoing maintenance |

### Medium Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Permission gaps** -- Everyone sees all data | Sensitive tenant data exposed to wrong staff | Evaluate Twenty's current RBAC; implement field-level access as it matures |
| **Email feature gaps** -- No bulk email or tracking | Can't communicate with tenants at scale | Deploy n8n + SendGrid for bulk communications from day 1 |
| **Performance under load** -- Twenty cloud is known to be slow | User frustration, adoption resistance | Self-host with tuned PostgreSQL, PgBouncer, and CDN; monitor proactively |
| **Data migration errors** -- Relationship mapping failures | Orphaned records, broken tenant-property links | Write validation scripts; verify counts and relationships post-import |

### Low Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Twenty project abandonment** | No more updates | AGPL ensures code remains available; 20K+ stars, YC-backed, active dev |
| **AGPL license compliance** | Legal exposure if serving modified code externally | For internal self-hosting only, AGPL has no copyleft trigger |
| **GCP outage** | CRM downtime | Multi-zone GKE + Cloud SQL HA; RPO=0, RTO<2min for most components |

---

## 14. Cost Comparison

### Current HubSpot (Flent -- Portal 45469632)

Flent uses HubSpot STANDARD account with custom objects, ~100 workflows, and multi-channel integrations.

| Item | Cost/mo (est.) | Annual |
|------|---------|--------|
| HubSpot CRM (Standard, seats TBD) | ~$800-1,600 | $9,600-19,200 |
| Operations Hub (needed for custom objects + workflows) | ~$800 | $9,600 |
| External integrations (Superchat, Calendly, FormPay) | ~$200-500 | $2,400-6,000 |
| **Total** | **~$1,800-2,900** | **~$21,600-34,800** |

*Note: Exact plan details not available via API. The account type is "STANDARD" with 4 custom objects and ~100 workflows, suggesting at minimum Professional-tier equivalent.*

### Proposed Twenty on GCP (Medium Deployment)

| Item | Cost/mo | Annual |
|------|---------|--------|
| Twenty CRM software | $0 | $0 |
| GKE cluster + nodes | ~$194 | $2,328 |
| Cloud SQL PostgreSQL HA | ~$350 | $4,200 |
| Memorystore Redis | ~$175 | $2,100 |
| GCS + CDN + networking | ~$37 | $444 |
| Monitoring/logging | ~$30 | $360 |
| **Infrastructure total** | **~$786** | **~$9,432** |
| Claude Code (Pro plan for migration + ongoing) | ~$200 | $2,400 |
| External tools (Grafana, Mailchimp, n8n, Chatwoot) | ~$150 | $1,800 |
| **Year 1 total** | -- | **~$13,632** |
| **Year 2+ total** | -- | **~$13,632** |

### 3-Year TCO Comparison

| Option | Year 1 | Year 2 | Year 3 | 3-Year Total |
|--------|--------|--------|--------|-------------|
| HubSpot (10 users, grows to 20) | $31,200 | $38,400 | $45,600 | **$115,200** |
| Twenty self-hosted on GCP + Claude Code | $13,632 | $13,632 | $13,632 | **$40,896** |
| **Savings with Twenty** | | | | **$74,304 (64%)** |

*Savings increase dramatically with more users since Twenty has no per-seat cost.*

### At 50 Users (3-Year)

| Option | 3-Year Total |
|--------|-------------|
| HubSpot Professional (50 seats) | ~$324,000 |
| Twenty self-hosted (larger GCP infra) | ~$90,000 |
| **Savings** | **$234,000 (72%)** |

---

## 15. Final Recommendation

### Decision: Go with Twenty

Based on the complete analysis -- 50-dimension gap analysis, HubSpot API audit, Twenty codebase analysis, and GCP infrastructure research -- **Twenty is the right move for Flent**, and the 20 critical gaps are manageable because:

1. **Developer bandwidth is not a constraint** -- You'll use Claude Code for all migration, integration, and customization work. This eliminates the traditional "dev team availability" bottleneck that makes Twenty risky for most companies.

2. **Your core need is custom data management**, not marketing/sales automation. The 364-property Contact bloat, 4 custom objects, and 0 Company records prove HubSpot's standard CRM model doesn't fit your business.

3. **Many of HubSpot's advantages are cost-prohibitive** -- Custom objects require Enterprise ($150+/user/mo), workflows need Professional ($800+/mo), WhatsApp needs Marketing Hub Pro ($890+/mo). Matching your current usage costs $3,000-5,000+/month.

4. **The 8 migration blockers are all solvable via Claude Code + n8n**:
   - WhatsApp: n8n + Meta Cloud API
   - Pipelines: Select field workaround or Twenty fork
   - Reporting: Grafana + PostgreSQL dashboards
   - Email: Workflow Send Email + Gmail
   - Validation: CODE workflow actions with regex
   - Forms: Custom forms -> Twenty REST API
   - Teams: Custom field workaround
   - Segments: Database event triggers with filters

### Migration Approach (Claude Code-Driven)

**Phase 0: Proof of Concept (1 week)**
- Claude Code deploys Twenty on GCE VM
- Creates property management data model
- Imports 500 sample records
- Builds 3 key Grafana dashboards
- Sets up n8n + WhatsApp Business API for 2 test workflows
- Demo to team for feedback

**Phase 1: Build Mitigations for 8 Blockers (2-3 weeks)**
Claude Code works in parallel on:
- Pipeline workaround implementation
- WhatsApp integration via n8n
- Grafana reporting dashboards (occupancy, revenue, maintenance SLAs)
- Data validation workflows (phone/Aadhaar/PAN regex)
- Form integration (Typeform/Tally -> Twenty API)
- Email sending configuration
- Team field + segment triggers

**Phase 2: Data Migration & Parallel Run (2 weeks)**
- Claude Code writes migration scripts (HubSpot API -> transform -> Twenty API)
- Full migration of 16,853 records in dependency order
- Rebuilds top 30 critical workflows
- 2-week parallel run with both systems

**Phase 3: Cutover & Enhancement (1 week + ongoing)**
- Final data sync, DNS switch
- Monitor & fix issues
- Claude Code continues building Tier 2 mitigations (scoring, templates, sequences, forecasting)
- Custom tenant portal development
- Ongoing maintenance via Claude Code

**Total: 6-8 weeks to production. No traditional developer hiring needed.**

### What NOT to Migrate

| HubSpot Feature | Decision | Reason |
|-----------------|----------|--------|
| Email marketing campaigns | Replace with Mailchimp + n8n | Twenty will never be an email marketing platform |
| Landing pages | Keep on Webflow/WordPress | CRM shouldn't be a CMS |
| Live chat widget | Replace with Chatwoot (OSS) | Dedicated chat tools are better |
| HubSpot Academy training | N/A | Team learns Twenty's simpler UI directly |
| HubSpot mobile app | Accept responsive web | PWA possible later via Claude Code |

---

## 16. HubSpot Audit: Flent (Portal 45469632)

### Account Overview

| Field | Value |
|-------|-------|
| **Portal ID** | 45469632 |
| **Company** | Flent |
| **Account Type** | STANDARD |
| **Time Zone** | Asia/Calcutta (UTC+05:30) |
| **Currency** | INR (Indian Rupee) |
| **Data Hosting** | NA2 |

Flent is a **property management / co-living company** operating in Bangalore, India. They manage residential properties, connecting landlords with tenants, handling contracts, rent collection, maintenance, and move-in/move-out operations.

### Data Volumes

| Object | Records | Custom Properties |
|--------|---------|-------------------|
| **Contacts** | 8,393 | 364 |
| **Companies** | 0 (unused) | 7 |
| **Deals** | 3,782 | 50 |
| **Tickets** | 2,739 | 29 |
| **Room IDs** (custom) | 74 | 5 |
| **Contracts** (custom) | 1,199 | 54 |
| **Property IDs** (custom) | 196 | 94 |
| **Notification Requests** (custom) | 470 | 10 |
| **Total** | **~16,853** | **~613 custom** |

### How Flent Uses HubSpot

This is far beyond typical CRM usage. Flent has built an **end-to-end property management operations platform**:

1. **Dual-sided marketplace CRM**: Contacts serve as both Tenants and Landlords (via `customer_type` field). Companies object is completely unused.

2. **Three distinct sales funnels**: Reserve (inbound tenant leads), Occupancy (property viewing to move-in), and F4B (B2B Flent for Business outreach).

3. **Full financial operations**: Rent calculations, payment collection via Cashfree/Razorpay/FormPay, security deposit tracking, utility billing, TDS management, landlord payouts -- all tracked in contact and contract properties.

4. **Property operations**: Property ID custom object is a full property management database with utility credentials (electricity, gas, water, WiFi), building contacts, maintenance schedules, and financial configs.

5. **Heavy automation**: ~100 workflows automate WhatsApp/email communications, Slack notifications, pipeline transitions, rent calculations, NPS collection, and Google Sheets sync.

6. **Multi-channel communication**: Deep WhatsApp integration (Superchat/Cooby/Periskope), Intercom, Calendly, Slack, and email.

### Contact Properties Deep Dive (364 Custom Properties)

The Contact object is heavily overloaded. Key property groups:

| Group | ~Count | Examples |
|-------|--------|---------|
| **Contact Info** | 80 | Aadhar/PAN docs, customer type, budget, food/smoking/pet prefs, location prefs, lead source |
| **Rent Info** | 15 | Monthly rent, base rent, maintenance, convenience fee, GST, deposit, increment |
| **Payment IDs** | 40 | Cashfree/Razorpay vendor/order IDs, virtual account (number/IFSC/UPI), payment links (rent/reserve/token/SD/utility/overdue) |
| **Landlord Info** | 25 | Address, bank accounts (up to 5 across 3 owners), IFSC codes, TDS details |
| **Agreement Signing** | 12 | Licensee/licensor names/emails, billing commencement, premise type, rent escalation |
| **Pre-Move-In** | 7 | Cleaning status, info shared, preferred/real move-in dates |
| **WiFi (ACT)** | 8 | Account ID, billing dates, payment status |
| **FormPay/MWB** | 30 | Payment link transaction tracking, subscription details |
| **WhatsApp (Cooby/Periskope/Superchat)** | 10 | Chat IDs, message timestamps, conversation IDs |
| **Calendly** | 20 | Scheduling form questions/answers |
| **Koalify Dedup** | 5 | Duplicate detection fields |

**Key Enumerations:**
- `customer_type`: Tenant, Landlord, POC, Landlord Lead, Landlord Churned, Tenant Lead, Tenant Churned
- `tenant_lifecycle`: Token Pending -> Token Received -> FMR+Deposit Pending -> FMR+Deposit Completed -> Agreement Pending -> Agreement Signed -> Move In Pending -> Move In Blocked -> Inventory Check Pending -> Inventory Check Completed
- `preferred_area`: HSR Layout, Koramangala, Bellandur-Sarjapura, Indiranagar, Whitefield, Ulsoor-MG Road
- `lead_source`: Organic-website, Facebook, Twitter(X), Instagram, LinkedIn, Friends and Family, Intercom, Supply-Ad Leads (NRI), Google Search

### Custom Objects Deep Dive

#### Contract (1,199 records, 54 properties)
Core business object for all running landlord and tenant agreements.

| Category | Key Fields |
|----------|-----------|
| **Identity** | contract_id, contract_uid, email_id, party_phone, PID, RID |
| **Dates** | start/end, go_live, lock_in_end, key_handover, move_in/out actual |
| **Financial** | monthly_license_fee, base_rent, security_deposit, platform_fees, convenience_fee, furnishing_fees, FMR, GST, TDS, maintenance, retail monthly rent (GMV), acquisition cost |
| **Type/Status** | contract_type (Tenant/Landlord), state (Active/Renewed/Terminated/Upcoming), business_type (Unfurnished/Fully Furnished/Flent for Business/Partially Furnished) |
| **Config** | lock_in_plan, rental_cycle, maintenance_cycle, increment_percentage, short_term_flag, water_charges_separate |
| **Move-in/out** | inspector, status, issues, notes, deposit settled/amount |

#### Property ID (196 records, 94 properties)
Most property-rich custom object -- full property master data.

| Category | Key Fields |
|----------|-----------|
| **Identity** | pid, property_name, building_name, house/apartment number |
| **Location** | area_name, cluster, location, map_link, property_address |
| **Classification** | property_type (8 types), grade (T0-T3), furnishings, floors, washrooms, units |
| **Electricity** | provider (BESC), account ID, user ID, portal password, bill details, payment status |
| **Gas** | gas ID, provider, contact, type |
| **Water** | source, service provider, recharge steps, separate meter/bill |
| **WiFi** | ISP, account ID, SSID, password, plan details, start/end dates |
| **Landlord Payments** | license fee settlement cycle/day, maintenance settlement, TDS, monthly fees, unoccupancy penalty |
| **Other** | source (MyGate/NoBroker/WhatsApp/Security Guard), lock box code, parking, gallery link |

#### Room ID (74 records, 5 properties)
- `roomid` (text, required)
- Rent tiers: 3/6/11-month lock-in rent, no lock-in rent

#### Notification Request (470 records, 10 properties)
- type, status (active/fulfilled/cancelled), property_id, room_id, NR flow stage (1/2/3)

### Pipelines

#### Deal Pipelines (3)

**Reserve Pipeline** (default):
Form Filled -> Payment Completed -> Qualified -> Options Shared -> Visits Scheduled -> Converted | Disqualified | Dropped | Refunded

**Occupancy Pipeline**:
Lead Qualified -> Visit Scheduled -> Visit Completed -> Negotiation -> Token Received -> Move in Done | Dropped | Disqualified

**F4B (Flent for Business)**:
Reach-out Initiated -> Contact Made -> Meeting Scheduled -> No Decision Post-Meeting -> Proposal Sent -> Negotiation Started -> Token Received -> Converted | Lost | Disqualified

#### Ticket Pipelines (2)

**Support Pipeline**:
New Request -> Waiting on Customer -> Waiting on Vendor -> Waiting on Landlord -> Waiting on Product -> Action Pending -> Ready For Closure -> Closed

**Landlord Pipeline**:
New -> Waiting on Tenant -> Waiting on Landlord -> Waiting on Flent -> External Dependency -> Vendor Scheduled -> Closed | Blocked

### Workflows (~100 total, ~60 enabled)

| Category | Count | Examples |
|----------|-------|---------|
| **WhatsApp Communication** | ~15 | Reserve payment, token collection, rent reminders (1st/3rd/5th day/overdue), move-in/out confirmation, CSAT, NPS |
| **Slack Notifications** | ~8 | Move-out alerts (<7 days), ticket created, landlord dependency, supply lead alerts |
| **Lead Management** | ~8 | Qualification to deal, visit scheduled, token done, FMR+Deposit = moved in, auto-qualify |
| **Lifecycle/Status** | ~10 | Tenant move-out/lead marking, duplicate merge, offboarding, agreement renewal |
| **Pipeline Stage Automation** | ~8 | Automated actions per Occupancy Pipeline stage |
| **Payment/Financial** | ~5 | Rent calculation, landlord payout population, overdue charges |
| **Data Sync** | ~5 | HubSpot-to-Sheets (tenant/landlord), contract creation/sanitization |
| **NPS** | ~6 | NPS scoring/email (tenants & landlords), incentive links |
| **Custom Object** | ~6 | Contract state activation, lock-in extension, electricity bill checker |
| **Marketing/Attribution** | ~5 | WAX code, NRI landlord, Meta CAPI, Google UTM |

### Lists (73 total)

Key lists: Active Tenants, Move-out next 15 days, Tenants (Active + Previous), Landlords FE, Landlord Inbound Leads, F4B, 6-month Retention, Renewal batches, Utility batches, Rent due = 0, Unengaged contacts, Koalify duplicate detection lists.

### Structural Pain Points (Evident from Data)

1. **Contact property bloat**: 364 custom properties on one object. Bank account fields duplicated across 3 owners x 5 accounts each. This is a schema limitation workaround.

2. **Deprecated fields**: Several properties marked "[Do not use]" / "[Not to be used]" indicate schema evolution without cleanup.

3. **No Company usage**: 0 records. Landlords and property owners are modeled as Contacts, not Companies.

4. **Mixed concerns**: Contacts hold tenant data, landlord data, payment IDs, agreement data, and operational data simultaneously.

5. **Integration property sprawl**: ~75 properties from integrations (FormPay, Calendly, Cooby, Koalify, Periskope) that pollute the Contact schema.

### Migration Mapping: HubSpot -> Twenty

| HubSpot Source | Twenty Target | Records | Priority |
|---------------|---------------|---------|----------|
| Contacts (Tenant) | Person (type: Tenant) | ~4,000 | P1 |
| Contacts (Landlord) | Person (type: Landlord) | ~2,000 | P1 |
| Contacts (Leads) | Person (type: Lead) | ~2,400 | P2 |
| Contract (custom) | Custom Object: Contract | 1,199 | P1 |
| Property ID (custom) | Custom Object: Property | 196 | P1 |
| Room ID (custom) | Custom Object: Room | 74 | P1 |
| Deals (Reserve) | Opportunity (Reserve pipeline) | ~1,500 | P2 |
| Deals (Occupancy) | Opportunity (Occupancy pipeline) | ~1,500 | P2 |
| Deals (F4B) | Opportunity (F4B pipeline) | ~800 | P3 |
| Tickets (Support) | Custom Object: Ticket or Task | ~2,000 | P2 |
| Tickets (Landlord) | Custom Object: Ticket or Task | ~700 | P2 |
| Notification Request | Custom Object: Notification | 470 | P3 |

### Key Migration Challenges

1. **Contact splitting**: HubSpot uses one Contact object for Tenants, Landlords, and Leads. In Twenty, these should be separate Person records with a `type` field, but relationships (a landlord who is also a tenant contact) need careful mapping.

2. **Bank account normalization**: Currently 15+ bank account fields crammed into Contact properties. Twenty should have a **BankAccount** custom object linked to Person (Landlord) via relation.

3. **Payment integration IDs**: Cashfree/Razorpay/FormPay IDs stored as contact properties need to map to Twenty fields. The payment integrations themselves need API webhook setup in Twenty.

4. **WhatsApp automation**: 15+ workflows depend on WhatsApp messaging (via Superchat/Cooby/Periskope). This is the single biggest integration dependency. Options: n8n + WhatsApp Business API, or continue using Superchat/Periskope via Twenty webhooks.

5. **~100 workflows**: The 60 enabled workflows need triage. Critical ones (rent reminders, lifecycle transitions, payment calculations) must be rebuilt in Twenty's workflow engine or n8n before cutover.

6. **Property triage**: Only ~100 of the 364 contact properties are core Flent data. ~75 are integration-generated (FormPay, Calendly, Cooby) and ~50 are deprecated. A cleanup pass before migration will significantly reduce effort.

7. **Calculated fields**: GST calculations, rent amounts, settlement figures currently computed by HubSpot workflows need to be recreated as Twenty workflow actions or external calculation logic.

---

## Appendix A: Key Twenty Configuration Reference

### Environment Variables Cheat Sheet

```env
# === REQUIRED ===
SERVER_URL=https://crm.yourdomain.com
APP_SECRET=<random-64-char-string>
PG_DATABASE_URL=postgres://user:pass@host:5432/twenty
REDIS_URL=redis://host:6379

# === PERFORMANCE ===
NODE_OPTIONS="--max-old-space-size=8192"
PG_DATABASE_PRIMARY_TIMEOUT_MS=15000

# === STORAGE (use S3 for production) ===
STORAGE_TYPE=s3
STORAGE_S3_REGION=us-central1
STORAGE_S3_NAME=twenty-files
STORAGE_S3_ENDPOINT=https://storage.googleapis.com
STORAGE_S3_ACCESS_KEY_ID=<hmac-key>
STORAGE_S3_SECRET_ACCESS_KEY=<hmac-secret>

# === EMAIL ===
EMAIL_DRIVER=smtp
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=crm@yourdomain.com
EMAIL_SMTP_PASSWORD=<app-password>

# === GOOGLE OAUTH (for Gmail/Calendar sync) ===
AUTH_GOOGLE_ENABLED=true
AUTH_GOOGLE_CLIENT_ID=<client-id>
AUTH_GOOGLE_CLIENT_SECRET=<client-secret>
AUTH_GOOGLE_CALLBACK_URL=https://crm.yourdomain.com/auth/google/redirect
MESSAGING_PROVIDER_GMAIL_ENABLED=true
CALENDAR_PROVIDER_GOOGLE_ENABLED=true

# === MONITORING ===
SENTRY_DSN=<your-sentry-dsn>
SENTRY_ENVIRONMENT=production

# === WORKERS ===
DISABLE_DB_MIGRATIONS=true         # Set in worker containers only
DISABLE_CRON_JOBS_REGISTRATION=true # Set in worker containers only
```

### Useful CLI Commands

```bash
# Database operations
yarn database:migrate:prod --force    # Run migrations
yarn command:prod upgrade             # Run data migrations after version upgrade

# Backup
docker exec twenty-postgres pg_dump -U postgres twenty > backup.sql

# Health check
curl https://crm.yourdomain.com/healthz
```

## Appendix B: Homeseller Case Study (Property Sector Reference)

Homeseller, a Singapore-based property transaction company, rebuilt their entire operations on Twenty:

- **Custom data model** shaped around their specific property sales and operations flow
- **2,000+ daily WhatsApp messages** parsed by AI and fed into Twenty via API
- **n8n + Webhooks** for automated workflows
- **Grafana dashboards** pulling live data from Twenty's PostgreSQL for real-time business metrics
- **Result**: 150+ monthly hours saved, 2x growth readiness without additional staff

This is the closest analog to your property management use case and validates Twenty's viability for non-traditional CRM workloads.

## Appendix C: Twenty Release Cadence

| Version | Date | Notable Feature |
|---------|------|-----------------|
| v1.15 | Jan 8, 2026 | Show who last updated a record |
| v1.14 | Dec 20, 2025 | Resizable side panel and nav menu |
| v1.13 | Dec 17, 2025 | Stop Workflow button |
| v1.12 | Dec 2, 2025 | Side panel opens next to content |

Development is active with biweekly releases. The project has 20,000+ GitHub stars, 300+ contributors, and is YC S23-backed with a $5M seed round.

---

*Document complete. HubSpot audit, Twenty codebase analysis, online research, and GCP optimization research all finalized as of April 8, 2026.*
