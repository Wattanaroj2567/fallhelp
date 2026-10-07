# Health Data Export

[English](health-data-export.md) · [ภาษาไทย](health-data-export.th.md)

## Doc Meta

- **Audience**: Dev / QA / Stakeholder / Researcher
- **Source of Truth**: Not yet developed (Planned Feature)
- **Status**: **Planned** — a feature planned for future development
- Last Updated: May 10, 2026

## Overview

Health data export is an add-on feature that lets caregivers export an elder's health data as a PDF or CSV file, for use when seeing a doctor or for keeping as a personal health record.

**Note**: This feature has not been developed yet; it is part of the system's future development plan.

## Current Data Constraint

The current system persists only fall events in the `Event` table, and stores `bpm` only as a snapshot at the moment of the fall.
The normal/abnormal heart-rate stream uses realtime updates and is not yet stored as separate events in the database.
A report that counts "abnormally high/low pulse occurrences" therefore needs an additional data model for heart-rate history, or the scope must be reduced to summarising fall-event BPM snapshots only.

## Users

- **Caregiver (family member)** — wants a health report to bring to a doctor
- **Doctor / medical staff** — wants to view historical health data
- **Admin** — manages the data export system

## Features

### 1. Monthly Report Export

**Report contents:**

- **Fall count summary** — number of falls in that month
- **Abnormal heart rate summary** — heart-rate history storage must be added before these occurrences can be counted, split into:
  - Abnormally high pulse (number of occurrences)
  - Abnormally low pulse (number of occurrences)
- **Most frequent incident time** — shows the Peak Hour
- **Elder information** — name, age, chronic conditions, weight, height

### 2. Date Range Report Export

**Range options:**

- **Single month** — pick a month/year, up to 12 months back
- **Custom** — pick your own date range (e.g. the last 3 months)
- **All** — data since the start of use

### 3. Export File Formats

| Format        | Characteristics                                          | Used for                                |
| ------------- | -------------------------------------------------------- | --------------------------------------- |
| **PDF**       | - Easy to read\n- Prints nicely\n- Can be emailed        | Printing / sending to a doctor / filing |
| **CSV/Excel** | - Data analysis\n- Charting\n- Import into other systems | Further data analysis                   |

## Related Screens

### Monthly Summary Report Screen

**File:** `(features)/(report)/report-summary.tsx` (an export button will be added)
**What the user sees:**

- An "Export Report" button at the top right of the screen
- A file format selector (PDF / CSV)
  **What the user can do:**
- Tap the export button to download the current month's report

### Export Range Selection Screen

**File:** `(features)/(report)/export-options.tsx` (to be created in the future)
**What the user sees:**

- Range options (Single month / Custom / All)
- File format options (PDF / CSV)
- An "Export" button
  **What the user can do:**
- Choose the desired range and format
- Tap export to download the file

## Business Rules

| Topic            | Details                                   |
| ---------------- | ----------------------------------------- |
| Export range     | Up to 12 months back                      |
| File format      | PDF for printing, CSV for analysis        |
| Elder data       | Always included in the report             |
| Processing       | File is generated immediately, no waiting |
| Security         | Users can only export their own data      |

---

**Important note:** This document is part of the system's future development plan (Future Roadmap). It has not been implemented yet, but serves as guidance for further development.
