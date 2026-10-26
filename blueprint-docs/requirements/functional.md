# Functional Requirements

## Overview

The application is a personal finance management tool that helps users track income and expenses, create budgets, manage credit cards, set financial goals, and gain insights through reports and graphs. It supports both manual entry and automatic synchronization via Open Finance.

### Core User Personas
- Individual users seeking better control over monthly spending.
- Families managing shared budgets.
- Users with multiple bank accounts and credit cards.

## User Stories

### Account Management
- As a user, I want to create multiple accounts (checking, savings, cash, investment) so that I can see my overall balance.
- As a user, I want to view projected balances that include pending transactions and credit card invoices.

### Transaction Tracking
- As a user, I want to manually add income and expenses with categories, subcategories, and tags.
- As a user, I want to attach receipts/photos to transactions.
- As a user, I want to import transactions from Excel, OFX, or PDF.
- As a user, I want automatic categorization suggestions based on merchant or history.

### Budgeting and Planning
- As a user, I want to create monthly budget plans with spending limits per category.
- As a user, I want alerts when I approach or exceed a category limit.
- As a user, I want to set a savings percentage target (e.g., 20% of income).

### Credit Card Management
- As a user, I want to register credit cards, track limits, current balance, and due dates.
- As a user, I want bill payment reminders.
- As a user, I want to see the impact of credit card spending on my monthly cash flow.

### Goals
- As a user, I want to create financial goals (emergency fund, travel, debt payoff) with target amounts and dates.
- As a user, I want to track progress and link contributions to specific accounts or budgets.

### Reports and Insights
- As a user, I want monthly and annual cash flow graphs.
- As a user, I want spending breakdowns by category.
- As a user, I want advanced filters by account, category, tag, and date range.
- As a user, I want a dashboard with key cards (balance, projected balance, top categories).

### Synchronization and Open Finance
- As a user, I want to connect bank accounts and credit cards via Open Finance (consent-based, read-only).
- As a user, I want transactions to sync automatically after consent.
- As a user, I want offline access with later cloud synchronization.

### Notifications
- As a user, I want email and push notifications for upcoming bills, budget limits, and goal milestones.

## Workflows

1. **Onboarding**: Create account → Add initial accounts/cards → (Optional) Connect Open Finance → Set first budget.
2. **Daily Use**: View dashboard → Add/review transactions → Check budget progress.
3. **Monthly Review**: Analyze reports → Adjust budget → Review goals.

## Feature Prioritization (Inspired by Mobills Free vs Premium)

- **Core (Free)**: Basic tracking, limited categories, basic reports, manual entry.
- **Premium**: Unlimited transactions, full reports, Open Finance sync, advanced goals, custom dashboard, export, priority support.
