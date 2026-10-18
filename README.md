# Personal Finance App Blueprint

## Overview

This repository contains a comprehensive documentation blueprint for a personal finance management (PFM) application, inspired by the analysis of **Mobills** and similar finance apps (YNAB, historical Mint, etc.).

The goal is to structure how modern personal finance applications work to **improve the financial health of people** through better budgeting, expense tracking, goal setting, credit management, and data-driven insights.

### Key Inspirations from Mobills
- Customizable categories, subcategories, and tags
- Multi-account and credit card management
- Budget planning with spending limits and alerts
- Financial goals and projected balances
- Reports and graphs (cash flow, category breakdowns)
- Cloud sync with offline support
- Open Finance / bank aggregation for automatic transaction import (via partners like Belvo in Brazil)
- Import/export (Excel, OFX, PDF)
- Bill reminders and notifications

### Project Purpose
This is a **specification and architecture documentation** repository. It serves as the foundation for building or evaluating a PFM app focused on user financial well-being.

## Repository Structure

```
project-root/
├── README.md
├── CONTRIBUTING.md
└── docs/
    ├── requirements/
    │   ├── functional.md
    │   └── non_functional.md
    ├── architecture/
    │   ├── system_design.md
    │   └── adr/
    ├── database/
    │   ├── schema.dbml
    │   ├── schema_init.sql
    │   └── data_dictionary.md
    ├── api/
    │   └── openapi.yaml
    └── design/
        └── ui_ux_spec.md
```

## Getting Started

1. Read the functional and non-functional requirements.
2. Review the system design and ADRs.
3. Explore the database schema and API specification.
4. Check the UI/UX guidelines.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT (for documentation purposes).
