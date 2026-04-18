# Hawkeye CRM — Full Untitled UI Integration Spec

**Date**: 2026-04-11
**Goal**: Integrate ALL available Untitled UI components into Hawkeye and add missing features (mobile responsiveness, dashboards, forms, analytics)

---

## 1. Dashboard & Analytics

### 1A. Dashboard Page (`/dashboard`)
- Pull Untitled UI dashboard examples via MCP CLI
- KPI metric cards at top: total records per object, counts by status
- Charts (recharts): bar, line, pie using Twenty's GraphQL aggregation
- Date range picker for filtering dashboard period
- Auto-generate metrics from any object's data

### 1B. Metric Cards Component
- Reusable stat card: title, value, trend arrow, percentage change
- Color variants: success (green up), error (red down), neutral
- Use for: occupancy rate, revenue, pipeline conversion, ticket SLA

### 1C. Chart Widgets
- Bar chart: records by SELECT field (e.g., tenants by status)
- Line chart: records created over time
- Pie chart: distribution by SELECT field
- Area chart: cumulative metrics
- All driven by Twenty's GraphQL data

---

## 2. Enhanced Forms

### 2A. Form Validation (React Hook Form integration)
- Use Untitled UI's `hook-form` component for all create/edit forms
- Schema validation from metadata (required fields, type checking)
- Error messages per field
- Loading state on submit

### 2B. Date Picker Fields
- Replace basic `<input type="date">` with Untitled UI DatePicker
- Range calendar for date range filters
- Date presets (Today, This week, This month, Last 30 days)

### 2C. File Upload
- Use Untitled UI FileUpload for attachment fields
- Drag-and-drop zone
- Upload progress indicator
- File type icons via @untitledui/file-icons

### 2D. Relation Field Editor
- Use ComboBox for searching/selecting related records
- Search Twenty's GraphQL for matching records
- Show avatar + name in dropdown results

### 2E. Tag Select for Multi-Select
- Use TagSelect component for MULTI_SELECT fields
- Shows selected values as removable tags
- Dropdown to add more

---

## 3. Mobile Responsiveness

### 3A. Responsive Sidebar
- Collapse to hamburger menu on mobile (<768px)
- Overlay sidebar with backdrop
- Close on navigation

### 3B. Mobile Table
- Stack columns vertically on mobile (card layout)
- Show first 3-4 fields as card, expand for rest
- Swipe actions (edit, delete)

### 3C. Mobile Kanban
- Horizontal scroll between columns
- Single column view on very small screens

### 3D. Mobile Bottom Navigation
- Fixed bottom nav bar on mobile
- Quick access: Home, Search (Cmd+K), Add Record, Notifications

### 3E. Responsive Record Detail
- Full screen on mobile (instead of slideout)
- Sticky save/cancel footer

---

## 4. Component Integration

### 4A. Avatar
- Use in: record cards (tenant photo), sidebar (user avatar), table cells (assignee)
- Fallback to initials when no image
- Status indicator (online/offline for team members)

### 4B. Toggle
- Use for: boolean fields in record detail (replace checkbox)
- Better UX for settings switches

### 4C. Tooltip
- Use on: table column headers (field description)
- Use on: icon-only buttons (action labels)
- Use on: truncated text (show full value)

### 4D. Tabs
- Use in: record detail (Details | Notes | Tasks | Activity)
- Use in: dashboard (different metric views)
- Use in: settings (Profile | Team | Integrations)

### 4E. Progress Indicators
- Lifecycle progress bar on tenant/contract records
- Occupancy percentage circles on property cards
- Upload progress during file upload

### 4F. Carousel
- Property photo gallery in record detail
- Onboarding walkthrough slides

### 4G. Notification Toasts
- Build toast system using Untitled UI Badge + animation
- Success/error/info/warning variants
- Auto-dismiss after 5s
- Show on: record created, updated, deleted, error

### 4H. Breadcrumbs
- Show current path: Home > Tenants > John Doe
- Use Untitled UI dropdown-account-breadcrumb

### 4I. Dark Mode Toggle
- Use existing theme provider
- Toggle in sidebar footer
- Persist preference in localStorage

---

## 5. Settings Pages

### 5A. Profile Settings (`/settings/profile`)
- Avatar upload, name, email, timezone
- Change password
- Use Untitled UI settings page examples

### 5B. Team Settings (`/settings/team`)
- List workspace members
- Invite new members
- Assign roles

### 5C. Integration Settings (`/settings/integrations`)
- Connected accounts (Gmail, Calendar)
- API keys management
- Webhook configuration

---

## 6. Additional Pages

### 6A. Import Data Page (`/import`)
- CSV upload with file-upload component
- Column mapping form
- Import progress bar
- Import results summary

### 6B. 404 Page
- Use Untitled UI 404 example
- Search suggestion
- Navigation back to dashboard

---

## Implementation Priority

| Phase | Features | Effort |
|-------|----------|--------|
| **Phase A** | Dashboard + Charts + Metric Cards | 2 days |
| **Phase B** | Enhanced Forms (DatePicker, FileUpload, ComboBox, HookForm, TagSelect) | 2 days |
| **Phase C** | Mobile Responsiveness (sidebar, table, kanban, bottom nav) | 2 days |
| **Phase D** | Component Integration (Avatar, Toggle, Tooltip, Tabs, Toasts, Breadcrumbs, Dark Mode) | 2 days |
| **Phase E** | Settings Pages + Import + 404 | 1 day |
| **Total** | | **9 days** |
