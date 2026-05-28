# Data Model

## Overview
The architecture is designed to handle the core challenge of ESG data, To achieve this, the database is split into two distinct layers:
1. **The Raw Ingestion Layer:** Separate tables for each distinct data source (e.g., `RawSAPData`, `RawUtilityBill`, `RawTravelData`). These act as an immutable landing zone, storing the exact payload, file, or JSON received.
2. **The Normalized Emission Layer:** A single, unified `NormalizedEmission` table. This is the source of truth for the Analyst Dashboard and downstream reporting.

## Schema Design & Core Requirements

### Multi-Tenancy
Every table (both Raw and Normalized) includes a `tenant_id` field (indexed). This ensures that data from different enterprise clients is strictly siloed at the database row level. Database queries are always scoped by this `tenant_id`.

### Scope 1/2/3 Categorization
The `NormalizedEmission` table features a `scope` enum column (`Scope 1`, `Scope 2`, `Scope 3`). When data flows from the raw tables, the normalization pipeline assigns the correct scope:
- SAP direct fuel purchases $\rightarrow$ Scope 1
- Utility electricity bills $\rightarrow$ Scope 2
- Navan flights/hotels $\rightarrow$ Scope 3

### Unit Normalization
The `NormalizedEmission` table strictly enforces standard units of measure (e.g., `kWh` for electricity, `km` for travel, `L` or `KG` for materials). The normalization logic (in the backend views/tasks) handles conversions (like mapping SAP `GAL` to `L`, or calculating distances using Haversine for flights) before inserting the row. The table stores `consumption_value` and `unit`.

## Source of Truth & Audit Trail

### Traceability
To prove exactly where a number came from during an audit, the `NormalizedEmission` table includes:
- `source_type`: A string identifying the origin (e.g., "Utility", "Navan", "SAP").
- `raw_record_id`: A reference ID pointing back to the primary key in the specific raw ingestion table. If an auditor asks why a Scope 2 record says 5,160 kWh, the system uses this link to pull up the exact `RawUtilityBill` row and the associated PDF text.

### Edit Tracking & Lifecycle
Since analysts will review and potentially fix data before it becomes finalized for an ESG report, the `NormalizedEmission` table includes an audit trail:
- `status`: Tracks the row's lifecycle (`Pending Review`, `Approved`, `Flagged`).
- `is_edited`: A boolean flag that trips to `True` if a human alters the normalization.
- `last_edited_by` & `last_edited_at`: Captures exactly who made the change and when.
- `created_at`: The timestamp of original ingestion.

By keeping the Raw layer immutable and logging edits in the Normalized layer, the system maintains strict provenance: we always know what the API/file originally said, what the automated parser extracted, and what the human analyst finalized.
