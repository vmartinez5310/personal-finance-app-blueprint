# Data Dictionary

## users
Stores application users.
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR | Unique login email |
| password_hash | VARCHAR | Hashed password |
| name | VARCHAR | Display name |
| preferred_currency | VARCHAR | Default currency (e.g., BRL) |
| timezone | VARCHAR | User timezone for date handling |
| created_at / updated_at | TIMESTAMP | Audit timestamps |

## accounts
Financial accounts (bank, cash, credit card, etc.).
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner |
| name | VARCHAR | Account display name |
| type | VARCHAR | checking, savings, credit_card, cash, investment |
| balance | DECIMAL | Current balance |
| currency | VARCHAR | Account currency |
| institution_name | VARCHAR | Bank or institution |
| is_active | BOOLEAN | Soft delete flag |

## categories
Hierarchical categories for income and expenses (supports subcategories via parent_id).
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner (or system) |
| name | VARCHAR | Category name |
| type | VARCHAR | income or expense |
| parent_id | UUID | Parent category for hierarchy |
| is_system | BOOLEAN | Predefined system category |

## transactions
Core ledger entries.
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id / account_id / category_id | UUID | Relations |
| amount | DECIMAL | Positive value; type indicates direction |
| type | VARCHAR | income, expense, transfer |
| description | VARCHAR | Short description |
| transaction_date | DATE | Effective date |
| external_id | VARCHAR | ID from Open Finance provider |
| is_recurring | BOOLEAN | Flag for recurring rules |

## budgets & budget_categories
Monthly or period-based spending plans with per-category limits.

## goals
Savings or financial objectives with progress tracking.

## credit_cards
Additional attributes for credit card accounts (limits, invoice cycle).

## open_finance_links
Tracks user consents and connections to external aggregators.

## receipts
Attachments (images/PDFs) linked to transactions.

## Relationships Summary
- One User → Many Accounts, Categories, Transactions, Budgets, Goals
- One Account → Many Transactions
- One Category → Many Transactions and Budget Categories
- Many-to-Many between Transactions and Tags
- Credit Cards extend specific Account records
