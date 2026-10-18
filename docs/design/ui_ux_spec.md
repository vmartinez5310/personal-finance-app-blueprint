# UI/UX Specification

## Design Principles
- **Clarity first**: Financial data must be immediately understandable.
- **Action-oriented**: Guide users toward better financial decisions (budget adherence, goal progress).
- **Trust & Calm**: Use professional, trustworthy visual language. Avoid anxiety-inducing reds except for alerts.
- **Mobile-first**: Primary experience is on mobile; web for deeper analysis.

## Color Palette
| Purpose | Color | Hex |
|---------|-------|-----|
| Primary | Deep Teal / Blue | `#0F766E` |
| Positive / Income | Green | `#10B981` |
| Negative / Expense | Soft Red | `#EF4444` |
| Neutral / Background | Light Gray | `#F8FAFC` |
| Dark Mode Background | Dark Navy | `#0F172A` |
| Accent | Amber | `#F59E0B` |
| Text Primary | Near Black | `#1E2937` |
| Text Secondary | Gray | `#64748B` |

## Typography
- Headings: Inter or SF Pro (system)
- Body: System fonts for performance
- Numbers: Tabular figures for alignment in tables and cards

## Key Screens

### 1. Dashboard
- Top cards: Total Balance, Projected Balance, Monthly Income vs Expenses
- Quick actions: Add Transaction, Connect Account
- Category spending progress bars
- Upcoming bills / reminders
- Recent transactions list

### 2. Transactions List
- Filter bar (account, category, date, tag)
- Grouped by date
- Swipe actions (edit, delete, categorize)
- Search

### 3. Budget Planner
- Monthly overview with overall progress
- Per-category limits with visual bars
- Alert indicators when approaching limit
- Ability to adjust limits inline

### 4. Goals
- Progress circles or bars
- Contribution history
- Suggested monthly contribution

### 5. Credit Cards
- Card visual with limit usage
- Invoice summary
- Due date reminder

### 6. Reports
- Interactive charts (pie for categories, line for cash flow)
- Export options (PDF, Excel)
- Time range selectors

## Accessibility
- Minimum contrast ratio 4.5:1 for text
- Support for dynamic type / font scaling
- Screen reader labels on all interactive elements and charts
- Keyboard navigation on web
- Color is never the sole indicator (use icons + text)

## Micro-interactions
- Subtle success animations on transaction save
- Progress celebration when a goal milestone is reached
- Gentle haptics on mobile for confirmations

## Figma Links
*(To be added once designs are created)*
- Mobile Dashboard
- Transaction Flow
- Budget Planner
- Reports

## Dark Mode
Full support with adjusted palette (darker backgrounds, brighter accent colors for data).
