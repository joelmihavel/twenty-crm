# HAWKEYE_DESIGN_SYSTEM.md
# Complete design system reference — tokens, components, Tag mappings, primitives, dark mode
# Used by: Claude Code before building any screen. Re-read when visual drift appears.

---

## THE ONE RULE

Every visual value — colour, spacing, font size, border radius, shadow — must come from
a theme token via `({ theme }) => theme.*`. Never hardcode a hex, px, rem, or number.

```tsx
// Correct
background: ${({ theme }) => theme.background.primary};
font-size: ${({ theme }) => theme.font.size.md};
padding: ${({ theme }) => theme.spacing(4)};

// Wrong — breaks dark mode and consistency
background: #ffffff;
font-size: 13px;
padding: 16px;
```

The single exception: `#991B1B` dark-red used in the R3 Overdue Aging chart 15+ bucket
(theme has no dark-red token). Mark it with a comment when used.

---

## TECH STACK CONSTRAINTS (non-negotiable)

| Concern | Library | Rule |
|---|---|---|
| Styling | `@emotion/styled` | All values via `({ theme }) => theme.*` |
| State | Jotai (`createAtomState`, `useAtomState`) | No Redux, no Context for shared state |
| Icons | `@tabler/icons-react` | No heroicons, no lucide, no custom SVGs |
| UI primitives | `twenty-ui` | No MUI, no Radix, no shadcn, no Ant Design |
| Charts | `recharts` | No nivo, no visx, no d3 direct usage |
| Router | React Router v6 | `useNavigate`, `useParams`, `useSearchParams` |
| React | 18 | Named exports only — no default exports from pages/components |

---

## THEME TOKEN REFERENCE

All tokens come from `lightTheme` / `darkTheme` from `'twenty-ui'`.
Accessed via `useTheme()` from `@emotion/react`.

### Typography

| Token | ~px | When to use |
|---|---|---|
| `theme.font.size.xs` | 11px | Labels, section headers, table headers, monospace IDs |
| `theme.font.size.sm` | 12px | Secondary text, breadcrumbs, timestamps |
| `theme.font.size.md` | 13px | Body text, field values, table cells |
| `theme.font.size.lg` | 16px | Page titles, section headings |
| `theme.font.size.xl` | 20px | Dashboard KPI numbers |
| `theme.font.size.xxl` | 24px | Hero numbers, empty state primary text |

| Token | Value | When to use |
|---|---|---|
| `theme.font.weight.regular` | 400 | Body text |
| `theme.font.weight.medium` | 500 | IDs, labels |
| `theme.font.weight.semibold` | 600 | Section titles, table headers, amounts |
| `theme.font.weight.bold` | 700 | Page headings, KPI numbers |

| Token | When to use |
|---|---|
| `theme.font.color.primary` | All primary content — names, values, descriptions |
| `theme.font.color.secondary` | IDs, monospace values, secondary metadata |
| `theme.font.color.tertiary` | Labels (uppercase), placeholders, helper text |
| `theme.font.color.inverted` | Text on dark/coloured backgrounds |
| `theme.font.color.danger` | Destructive actions, error messages |

### Backgrounds, borders, shadows

| Token | When to use |
|---|---|
| `theme.background.primary` | Cards, drawers, modals, table rows |
| `theme.background.secondary` | Page background, table header, hover state |
| `theme.background.tertiary` | Deepest bg, code blocks |
| `theme.border.color.medium` | Card borders, dividers, inputs |
| `theme.border.color.strong` | Focused inputs, active borders |
| `theme.border.radius.sm` | Tags, badges |
| `theme.border.radius.md` | Cards, panels, inputs |
| `theme.border.radius.lg` | Modals, drawers |
| `theme.border.radius.pill` | Full-round buttons |
| `theme.boxShadow.light` | Cards, panels |
| `theme.boxShadow.strong` | Drawers, floating tooltips |

### Spacing scale

`theme.spacing(n)` = `n * 4px`

| Call | px | Common use |
|---|---|---|
| `spacing(1)` | 4px | Tight inline gaps |
| `spacing(2)` | 8px | Label-to-value gap, Tag internal padding |
| `spacing(3)` | 12px | Tight table row padding |
| `spacing(4)` | 16px | Standard flex row gap |
| `spacing(5)` | 20px | Card vertical padding |
| `spacing(6)` | 24px | Card horizontal padding, section gaps |
| `spacing(8)` | 32px | Between cards |
| `spacing(10)` | 40px | Table row height |
| `spacing(12)` | 48px | Empty state padding |

### Semantic colour tokens

| Token | Role |
|---|---|
| `theme.color.blue` | Primary action, active |
| `theme.color.green` | Positive, paid, success |
| `theme.color.red` | Danger, overdue, failed |
| `theme.color.orange` | Warning, pending, cost |
| `theme.color.yellow` | Caution, unprocessed |
| `theme.color.purple` | In-flight, converted |
| `theme.color.pink` | Notice, active-negative |
| `theme.color.turquoise` | Qualified, special complete |
| `theme.color.sky` | Softer active, done |
| `theme.color.gray` | Neutral, inactive, closed |

---

## TAG COLOR → STATUS MAPPING

The complete reference. Use whenever a field is rendered as `<Tag color="..." text="..." />`.

### Tenant Lifecycle

| Stage | color |
|---|---|
| New Inquiry | `yellow` |
| Visit Scheduled | `blue` |
| Visit Done | `sky` |
| Negotiation | `orange` |
| Converted | `purple` |
| Gestation | `purple` |
| Moved In | `green` |
| Notice Period | `pink` |
| Moved Out | `gray` |
| Dead Lead | `red` |

### Tenant Qualification

| Status | color |
|---|---|
| Qualified | `turquoise` |
| Not Qualified | `red` |
| Dead | `gray` |
| Paused | `yellow` |

### BGV Status

| Status | color |
|---|---|
| Not Started | `gray` |
| In Progress | `blue` |
| Passed | `green` |
| Failed | `red` |

### Room Status (RID)

| Status | color |
|---|---|
| Available | `green` |
| Occupied | `blue` |
| Under Maintenance | `yellow` |
| Blocked | `red` |

### Item State

| State | color | Meaning |
|---|---|---|
| BUY | `yellow` | Ordered, not received |
| WIB | `yellow` | Warehouse in-bound |
| WOB | `yellow` | Warehouse out-bound |
| PIB | `purple` | In property, in use |
| POB | `turquoise` | Property out-bound |
| WORK | `pink` | Under repair |
| DEAD | `gray` | Written off |

### Ticket Status

| Status | color |
|---|---|
| New Request | `blue` |
| Waiting on Customer | `sky` |
| Waiting on Vendor | `orange` |
| Waiting on Landlord | `orange` |
| Blocked | `red` |
| Waiting for Payment | `yellow` |
| Ready for Closure | `turquoise` |
| Closed | `gray` |

### Ticket Priority

| Priority | color |
|---|---|
| Low | `gray` |
| Medium | `blue` |
| High | `orange` |
| Urgent | `red` |
| Critical | `red` |

### Ticket Pipeline

| Pipeline | color |
|---|---|
| Tenant | `blue` |
| Landlord | `purple` |

### Ticket Category

| Category | color |
|---|---|
| Plumbing | `blue` |
| Electrical | `yellow` |
| Appliance | `orange` |
| Carpentry | `purple` |
| Utility | `sky` |
| Inventory | `turquoise` |
| Agreement | `pink` |
| Reimbursement | `green` |
| OO (On/Off-boarding) | `gray` |
| Something else / Other | `gray` |

### Ticket Flag

| Flag | color |
|---|---|
| Reasonable | `green` |
| Not Reasonable | `red` |
| Subjective | `yellow` |

### Merchant Type

| Type | color |
|---|---|
| Landlord | `green` |
| POC | `blue` |
| Lead | `yellow` |
| Broker | `orange` |
| Management | `purple` |

### PID Type

| Type | color |
|---|---|
| lead | `yellow` |
| active | `green` |
| churned | `gray` |

### PID Deal Stage

| Stage | color |
|---|---|
| To be contacted | `gray` |
| In touch | `blue` |
| LL Interested | `sky` |
| Qualified | `turquoise` |
| Evaluation | `blue` |
| Negotiations | `orange` |
| Offer Extended | `purple` |
| Under Contract | `green` |
| To nurture | `yellow` |

### Contract — Payment Lifecycle (Tenant)

| Stage | color |
|---|---|
| Token Paid | `yellow` |
| FMR Paid | `blue` |
| SD Paid | `sky` |
| FMR and SD Cleared | `turquoise` |
| Payments Done | `green` |

### Contract — Agreement Lifecycle (Tenant)

| Stage | color |
|---|---|
| L&L and C&S Released | `yellow` |
| L&L Signed | `blue` |
| C&S Signed | `sky` |
| All agreements signed | `green` |

### Contract — Agreement Status (Merchant)

| Status | color |
|---|---|
| Negotiation | `orange` |
| Triggered | `blue` |
| Active | `green` |

### Transaction Direction

| Direction | Tag color | Amount text color |
|---|---|---|
| Credit | `green` | `theme.color.green` |
| Debit | `red` | `theme.color.red` |

### Repair Recommendation (Item Detail panel)

| Recommendation | color | Threshold |
|---|---|---|
| Repair | `green` | total repair < 30% of unit price |
| Monitor | `orange` | 30–70% |
| Replace | `red` | > 70% |

### NPS Category

| Category | color |
|---|---|
| Promoter (9–10) | `green` |
| Passive (7–8) | `yellow` |
| Detractor (0–6) | `red` |

### Vendor Quality Tier

| Tier | color |
|---|---|
| T1 | `green` |
| T2 | `blue` |
| T3 | `gray` |

### FSIN Stock Status

| Status | color |
|---|---|
| Sufficient | `green` |
| Reorder | `orange` |

### Overhead Category

| Category | color |
|---|---|
| Maintenance | `blue` |
| WiFi | `sky` |
| Electricity | `yellow` |
| DG (Generator) | `orange` |
| Water | `turquoise` |
| Water Purifier | `turquoise` |
| Gas Connection | `orange` |
| Helper | `purple` |


---

## TWENTY UI COMPONENT REFERENCE

Import paths are exact. Do not guess or improvise import paths.

### Tag

```tsx
import { Tag } from '@/ui/display/tag/components/Tag';

<Tag color="green" text="Moved In" />
<Tag color="red" text="Dead Lead" />
<Tag color="blue" text="Occupied" />
```

`color` is one of: `blue | green | red | orange | yellow | purple | pink | turquoise | sky | gray`

**Use Tag when:** the value is a finite enum with a defined color above.
**Do NOT use Tag for:** free text, numbers, dates, IDs, amounts.

### Chip and EntityChip

```tsx
import { Chip, EntityChip } from 'twenty-ui/components';

// Chip — plain label, for codes and IDs
<Chip label="PID9" onClick={() => navigate('/pids/PID9')} />
<Chip label="09BR2" onClick={() => navigate('/rids/09BR2')} />
<Chip label="CNT-T-2025-001" onClick={() => navigate('/contracts/CNT-T-2025-001')} />

// EntityChip — with avatar, for named people and organisations
<EntityChip
  name="Rahul Nene"
  avatarUrl={undefined}
  onClick={() => navigate('/tenants/t-001')}
/>
```

**Chip** → PID codes, RID codes, Contract UIDs, UTN when navigating to full page
**EntityChip** → Tenant names, Merchant names, Vendor names
**StyledMonoValue** → UTNs and Item Codes in read-only display (no navigation, or opening drawer)

### Button variants

```tsx
import { Button }          from '@/ui/input/button/components/Button';
import { LightButton }     from '@/ui/input/button/components/LightButton';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';

// Button — primary action
<Button title="Save" onClick={handleSave} />
<Button title="Open Full Record →" onClick={() => navigate(url)} />

// LightButton — secondary action with optional icon
<LightButton title="Back" Icon={IconArrowLeft} onClick={() => navigate(-1)} />
<LightButton title="Edit" Icon={IconEdit} onClick={handleEdit} />

// LightIconButton — icon-only
<LightIconButton Icon={IconFile}         onClick={() => window.open(url)} />       // view file
<LightIconButton Icon={IconCopy}         onClick={handleCopy} />                    // copy ID
<LightIconButton Icon={IconEye}          onClick={toggleReveal} />                  // reveal password
<LightIconButton Icon={IconExternalLink} onClick={() => window.open(url, '_blank')} /> // external URL
<LightIconButton Icon={IconX}            onClick={handleClose} />                   // close drawer
<LightIconButton Icon={IconMapPin}       onClick={() => window.open(mapUrl)} />    // open map
```

Never use a bare `<button>` HTML element.

### TextInput / AutosizeTextInput

```tsx
import { TextInput }         from '@/ui/input/components/TextInput';
import { AutosizeTextInput } from '@/ui/input/components/AutosizeTextInput';

<TextInput placeholder="Search tenants…" value={search} onChange={setSearch} />

// Grows with content — use for resolution notes, long text fields
<AutosizeTextInput placeholder="Add resolution notes…" value={notes} onChange={setNotes} />
```

### Toggle

```tsx
import { Toggle } from 'twenty-ui/input';

// ALL boolean fields render as Toggle in read-only display
// Never render true/false as text or checkbox
<Toggle value={item.ac} onChange={() => {}} />
<Toggle value={overhead.maintenance_pay_to_ll} onChange={() => {}} />
```

### Select

```tsx
import { Select } from '@/ui/input/components/Select';

<Select
  options={[
    { value: 'Moved In', label: 'Moved In' },
    { value: 'Notice Period', label: 'Notice Period' },
  ]}
  value={lifecycle}
  onChange={setLifecycle}
/>
```

### AnimatedCheckmark

```tsx
import { AnimatedCheckmark } from 'twenty-ui/display';

// Boolean fields in tables — true shows checkmark, false shows dash
{rid.ac ? <AnimatedCheckmark isChecked={true} /> : <span>—</span>}

// CSAT survey success state — shown after submission
{submitted && <AnimatedCheckmark isChecked={true} />}
```

### MenuItem

```tsx
import { MenuItem } from 'twenty-ui/display';

// Sidebar navigation items only
<MenuItem
  LeftIcon={IconUsers}
  text="Tenants"
  isActive={isActive}
  onClick={() => navigate('/tenants')}
/>
```

### CircularProgressBar / ProgressBar

```tsx
import { ProgressBar, CircularProgressBar } from 'twenty-ui/feedback';

// Loading state — every async fetch shows this centred in the content area
<CircularProgressBar size={40} barColor="blue" />

// Horizontal bar — occupancy rate, completion percentages
<ProgressBar value={75} color="green" />
```

### AppTooltip / OverflowingTextWithTooltip

```tsx
import { AppTooltip, OverflowingTextWithTooltip } from 'twenty-ui/display';

// Truncates text, shows full text in tooltip on hover
// Use for: ticket titles in list (2-line clamp), long descriptions
<OverflowingTextWithTooltip text={ticket.ticket_name} />

// Explicit tooltip on any element
// Use for: lifecycle Tag showing "N days in this stage" on hover
<AppTooltip content={`${daysInStage} days in this stage`}>
  <Tag color={color} text={stage} />
</AppTooltip>
```

---

## SHARED STYLED PRIMITIVES

Defined in `src/styles/shared.ts`. Import from there everywhere.
Never redefine in individual screen files.

```tsx
// src/styles/shared.ts
import styled from '@emotion/styled';

export const StyledPage = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  min-height: 100vh;
`;

export const StyledPageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(5)} ${({ theme }) => theme.spacing(6)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  background: ${({ theme }) => theme.background.primary};
`;

export const StyledCard = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(5)};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const StyledTh = styled.th`
  text-align: left;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semibold};
  color: ${({ theme }) => theme.font.color.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  background: ${({ theme }) => theme.background.secondary};
`;

export const StyledTr = styled.tr`
  height: ${({ theme }) => theme.spacing(10)};
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  &:hover { background: ${({ theme }) => theme.background.secondary}; }
`;

export const StyledTd = styled.td`
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.font.color.primary};
`;

export const StyledDetailGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(6)};
`;

export const StyledSectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semibold};
  color: ${({ theme }) => theme.font.color.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: ${({ theme }) => theme.spacing(4)} 0 ${({ theme }) => theme.spacing(2)};
`;

export const StyledFieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

export const StyledFieldLabel = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

export const StyledFieldValue = styled.span`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.font.color.primary};
`;

// For IDs, codes, UTNs, reference numbers
export const StyledMonoValue = styled.span`
  font-family: 'Courier New', monospace;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.secondary};
  letter-spacing: 0.02em;
`;

// For monetary amounts
export const StyledCurrencyValue = styled.span`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
  font-variant-numeric: tabular-nums;
`;

export const StyledEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(12)};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const StyledBreadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
`;

export const StyledToast = styled.div`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing(6)};
  right: ${({ theme }) => theme.spacing(6)};
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.primary};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  animation: fadeOut 2.5s forwards;
  @keyframes fadeOut {
    0%, 70% { opacity: 1; }
    100% { opacity: 0; pointer-events: none; }
  }
`;
```

---

## LAYOUT DIMENSIONS (hardcoded by exception)

These are the only non-token numbers allowed, because they define structural proportions.

| Element | Value | Notes |
|---|---|---|
| Sidebar width | `240px` | Fixed, full height |
| Detail grid | `2fr 1fr` | Main content + right sidebar |
| Table row height | `theme.spacing(10)` = 40px | All list screens |
| Form max-width | `640px` | All `/forms/` screens |
| Mobile max-width | `390px` | Inspection + Survey only |
| FSIN thumbnail (list) | `32×32px` | In FSIN list table |
| FSIN image (detail) | `48×48px` | FSIN detail + Item detail |
| Item snapshot | `80×80px` | Item detail snapshot field |
| Loading spinner | `size={40}` | `CircularProgressBar` |

---

## UTILITY FUNCTIONS

All in `src/utils/format.ts`. Import everywhere. Never redefine locally.

```ts
// src/utils/format.ts

// Indian format: 28000 → "₹28,000" | 125000 → "₹1,25,000" | 4500000 → "₹45,00,000"
export function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

// Short date: ISO → "01 Apr 2025"
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// Relative time: "just now" | "2 minutes ago" | "3 hours ago" | "4 days ago"
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 2) return 'just now';
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

// Days between two ISO dates (defaults to today as end)
export function daysBetween(from: string, to?: string): number {
  const end = to ? new Date(to) : new Date();
  return Math.floor((end.getTime() - new Date(from).getTime()) / 86400000);
}

// Repair vs Replace — C-01 business rule
// < 30% → Repair (green Tag) | 30–70% → Monitor (orange Tag) | > 70% → Replace (red Tag)
export function repairRecommendation(
  totalRepairCost: number,
  unitPrice: number
): 'Repair' | 'Monitor' | 'Replace' {
  const ratio = totalRepairCost / unitPrice;
  if (ratio < 0.3) return 'Repair';
  if (ratio < 0.7) return 'Monitor';
  return 'Replace';
}

// Lifecycle → Tag color (use with <Tag color={lifecycleToTagColor(stage)} text={stage} />)
export function lifecycleToTagColor(stage: string): string {
  const map: Record<string, string> = {
    'New Inquiry': 'yellow', 'Visit Scheduled': 'blue', 'Visit Done': 'sky',
    'Negotiation': 'orange', 'Converted': 'purple', 'Gestation': 'purple',
    'Moved In': 'green', 'Notice Period': 'pink', 'Moved Out': 'gray',
    'Dead Lead': 'red',
  };
  return map[stage] ?? 'gray';
}

// Item state → Tag color
export function itemStateToTagColor(state: string): string {
  const map: Record<string, string> = {
    BUY: 'yellow', WIB: 'yellow', WOB: 'yellow',
    PIB: 'purple', POB: 'turquoise', WORK: 'pink', DEAD: 'gray',
  };
  return map[state] ?? 'gray';
}

// Ticket status → Tag color
export function ticketStatusToTagColor(status: string): string {
  const map: Record<string, string> = {
    'New Request': 'blue', 'Waiting on Customer': 'sky',
    'Waiting on Vendor': 'orange', 'Waiting on Landlord': 'orange',
    'Blocked': 'red', 'Waiting for Payment': 'yellow',
    'Ready for Closure': 'turquoise', 'Closed': 'gray',
  };
  return map[status] ?? 'gray';
}
```

---

## DARK MODE SETUP

### Atom

```ts
// src/state/colorSchemeState.ts
export type ColorScheme = 'light' | 'dark' | 'system';
export const colorSchemeState = createAtomState<ColorScheme>({
  key: 'colorSchemeState',
  defaultValue: 'system',   // system is the default — reads OS preference
});
```

### Persistence

```ts
// On app init — seed from localStorage
const stored = localStorage.getItem('hawkeye-color-scheme') as ColorScheme | null;
if (stored) setColorScheme(stored);

// On every change — persist
useEffect(() => {
  localStorage.setItem('hawkeye-color-scheme', colorScheme);
}, [colorScheme]);
```

### Resolve hook

```ts
// src/styles/useResolvedTheme.ts
import { lightTheme, darkTheme } from 'twenty-ui';

export function useResolvedTheme() {
  const [scheme] = useAtomState(colorSchemeState);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (scheme === 'system') return prefersDark ? darkTheme : lightTheme;
  return scheme === 'dark' ? darkTheme : lightTheme;
}
```

### App root

```tsx
// src/App.tsx
export function App() {
  const theme = useResolvedTheme();
  return (
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
```

### ThemeToggle component

```tsx
// src/components/ThemeToggle.tsx
import { IconSun, IconDeviceDesktop, IconMoon } from '@tabler/icons-react';

export function ThemeToggle() {
  const [scheme, setScheme] = useAtomState(colorSchemeState);
  return (
    <StyledThreeWayToggle>
      {([
        { value: 'light',  Icon: IconSun },
        { value: 'system', Icon: IconDeviceDesktop },
        { value: 'dark',   Icon: IconMoon },
      ] as const).map(({ value, Icon }) => (
        <StyledToggleButton key={value} isActive={scheme === value} onClick={() => setScheme(value)}>
          <Icon size={14} />
        </StyledToggleButton>
      ))}
    </StyledThreeWayToggle>
  );
}
```

### Dark mode verification checklist

Run this after completing every new screen:

- [ ] Page background is `theme.background.secondary`
- [ ] Cards are `theme.background.primary`
- [ ] Table row hover is `theme.background.secondary`
- [ ] All text uses `theme.font.color.*` tokens
- [ ] All borders use `theme.border.color.*` tokens
- [ ] Tags render correctly in both modes (twenty-ui handles internally)
- [ ] Chart colours update when theme toggles (from `useChartColors()` hook)
- [ ] Chart tooltips use `theme.background.primary` + `theme.border.color.medium`
- [ ] Icons from `@tabler/icons-react` inherit `currentColor` — no hardcoded fill
- [ ] Password reveal toggle visible in both modes
- [ ] Empty state icons visible in both modes (use `theme.font.color.tertiary`)

---

## HISTORY TIMELINE ENTRY RENDERING

Each `HistoryEntry.type` maps to a specific icon and colour:

| type | Icon | Colour |
|---|---|---|
| `stage_change` | `IconArrowRight` | `theme.color.blue` |
| `field_update` | `IconEdit` | `theme.color.gray` |
| `linked_event` | `IconLink` | `theme.color.purple` |
| `payment` (credit) | `IconCoin` | `theme.color.green` |
| `payment` (debit) | `IconCoin` | `theme.color.red` |
| `document` | `IconFile` | `theme.color.orange` |
| `assignment` | `IconUser` | `theme.color.blue` |
| `note` | `IconNote` | `theme.color.gray` |

Entry layout per row:
```
[Icon]  [summary — font.size.sm, font.color.primary]       [timeAgo — font.size.xs, tertiary]
        [detail — font.size.xs, font.color.secondary]       (if present)
        [linkedObject chip navigating to entity]             (if present)
        [previousValue → newValue — xs, secondary]          (if stage_change)
```

Group by month with a `StyledSectionTitle` separator between months.

---

## FIELD RENDERING RULES

### File URL fields → `LightIconButton(IconFile)`
Never `<img>`, never raw URL text.

Fields: `aadhaar_front_image` · `aadhaar_back_image` · `pan_card_image` · `bgv_report`
· `aadhaar_back` (Merchant) · `pan_card_image` (Merchant) · `potential_report`
· `final_invoice` · `rules_regulations` · `annexure` · `agreement_pdf`
· `inventory_list` · `document` (Overhead) · `bill_document_id` (Item)

Exceptions:
- `snapshot` (Item) → render as 80×80 image box
- `image` (FSIN) → render as 48×48 placeholder colour box

### Password fields → masked `••••••` + `LightIconButton(IconEye)` reveal toggle

Fields: `wifi_password` · `electricity_password` · `water_password` · `gas_password`
Merchant `bank_account_number` → show last 4 digits only: `•••• •••• 5678`

### Boolean fields → `<Toggle value={val} />`
In tables: true → `<AnimatedCheckmark />` | false → `—`

### Monospace fields → `StyledMonoValue`
`pid` · `rid` · `contract_uid` · `utn` · `ticket_id` · `vendor_code` · `fsin_code`
· `item_code` · `po_line_id` · `gateway_reference_id` · `wax_code`
· `google_click_id` · `facebook_click_id`

### Amount fields → `formatINR()` in `StyledCurrencyValue`
Never raw number. Never `₹125,000` (wrong locale). Always `₹1,25,000`.

### External URL fields → `LightIconButton(IconExternalLink)`
`linkedin_url` · `twitter_url` · `instagram_id` · `google_map_location` · `google_map_location_lead`

### Copy-to-clipboard fields → add `LightIconButton(IconCopy)` + `StyledToast`
`wax_code` · `google_click_id` · `facebook_click_id` · `bank_account_number` · `ifsc_code`

---

## SCREEN LAYOUT PATTERNS

### List screen structure

```tsx
<StyledPage>
  <StyledPageHeader>
    <h1>{title}</h1>
    <Tag text={`${total}`} color="gray" />
    <Button title="+ Create" onClick={handleCreate} />
  </StyledPageHeader>
  <FilterBar>
    {/* filter dropdowns + TextInput search */}
  </FilterBar>
  {loading  && <CircularProgressBar size={40} barColor="blue" />}
  {error    && <StyledEmptyState>Failed to load</StyledEmptyState>}
  {!loading && data.length === 0 && <StyledEmptyState>No records found</StyledEmptyState>}
  {!loading && data.length > 0  && (
    <StyledTable>
      <thead><tr>{columns}</tr></thead>
      <tbody>{rows}</tbody>
    </StyledTable>
  )}
</StyledPage>
```

### Detail screen structure

```tsx
<StyledPage>
  <StyledPageHeader>
    <LightButton Icon={IconArrowLeft} title="Back" onClick={() => navigate(-1)} />
    <h1>{displayName}</h1>
    {statusTags}
    <LightButton Icon={IconEdit} title="Edit" onClick={handleEdit} />
  </StyledPageHeader>
  <TabBar>{tabLabels}</TabBar>
  <StyledDetailGrid>
    <main>{activeTabContent}</main>
    <aside>{sidebarPanels}</aside>
  </StyledDetailGrid>
</StyledPage>
```

### Sidebar structure

```tsx
<StyledSidebar>  {/* 240px fixed left, background.secondary, full height */}
  <SidebarNav>
    {primaryNavItems.map(item => (
      <MenuItem LeftIcon={item.Icon} text={item.label} isActive={…} onClick={…} />
    ))}
    <Divider />
    {quickActionItems.map(…)}
  </SidebarNav>
  <SidebarFooter>
    <ThemeToggle />
    <FlentWordmark />
  </SidebarFooter>
</StyledSidebar>
```

---

## MOST COMMON MISTAKES

| Wrong | Correct |
|---|---|
| `color: #333` | `color: ${({ theme }) => theme.font.color.primary}` |
| `padding: 16px` | `padding: ${({ theme }) => theme.spacing(4)}` |
| `font-size: 13px` | `font-size: ${({ theme }) => theme.font.size.md}` |
| `import { Button } from '@mui/material'` | `import { Button } from '@/ui/input/button/components/Button'` |
| `<input type="text">` | `<TextInput>` |
| `true` / `false` text | `<Toggle value={val} />` |
| `<img src={fileUrl}>` | `<LightIconButton Icon={IconFile} />` |
| `₹125,000` | `₹1,25,000` via `formatINR()` |
| `navigate('/tenants')` in back button | `navigate(-1)` |
| `export default function TenantList` | `export function TenantList` |
| `useContext(ThemeContext)` | `useTheme()` from `@emotion/react` |
| Redefining `StyledCard` in a screen file | Import from `src/styles/shared.ts` |
| `useState` for Transaction Drawer open/close | Jotai `drawerStateAtom` |
| Hardcoded hex in chart `fill` prop | `useChartColors()` hook values |
