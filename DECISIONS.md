
# Decisions & Ambiguities Resolved

## SAP Ingestion

**Subset Handled:** I am handling a subset of SAP Material Management (MM) purchasing data, specifically focusing on flat-file CSV exports that contain joined data from the `EKKO` (Header) and `EKPO` (Item) tables.

**Ingestion Mechanism:** File Upload (CSV).

**Why:** While modern SAP environments support OData APIs, the reality of legacy enterprise IT is that sustainability analysts often rely on scheduled flat-file exports or manual GUI transaction extracts. I chose to simulate this reality. Instead of forcing the user to upload heavily normalized, fragmented tables, the prototype accepts a pre-joined master CSV. This mimics what an analyst would realistically generate, shifting the backend focus to the actual ESG challenges: mapping raw plant codes (`WERKS`) to facility entities and normalizing chaotic units of measure (e.g., converting `GAL` to `L`). I explicitly chose not to build an IDoc or XML parser, as CSVs represent the most universal baseline for legacy ingestion.

## Utility Data Ingestion

**Subset Handled:** Commercial electricity bills

**Ingestion Mechanism:** PDF File Upload with LLM-Assisted Extraction.

**Why:** Digital PDF invoices are t. I opted for a high-value extraction pipeline. The user uploads a PDF (e.g., a standard regional commercial bill). The backend extracts the raw text and passes it to an LLM to reliably pull the `start_date`, `end_date`, and `total_kwh`, explicitly ignoring non-emitting Demand Charges (KVA). This resolves the ambiguity of unpredictable regional bill layouts without writing brittle regex scrapers, and perfectly handles the reality of service periods that do not align with calendar months.

## Corporate Travel Ingestion

**Subset Handled:** Scope 3 travel data from modern SaaS Travel Management Companies (TMCs) like Navan or Concur, focusing on flights and hotel stays.

**Ingestion Mechanism:** Simulated JSON Webhook (Manual Paste).

**Why:** Unlike legacy SAP data, modern travel platforms push clean, structured JSON payloads via REST APIs or webhooks. Building a live OAuth2 integration to a production Navan instance is outside the scope of a 4-day sprint. To simulate the exact backend reality without the overhead, the frontend UI provides a text area to paste a standard TMC JSON payload. The backend processes this exactly as it would a live webhook. To resolve the ambiguity of missing distances (receiving only airport codes like `BLR` to `FRA`), the backend implements a coordinate lookup dictionary and uses the Haversine formula to calculate flight distance before normalizing the record.

## Questions for the PM

1. **Unmapped Entities:** When our pipeline encounters an SAP plant code (`WERKS`) that does not exist in our internal facility lookup table, should the system drop the row, or ingest it and flag it as "Action Required" on the analyst dashboard?
2. **Pro-Rating Utilities:** Since utility billing periods rarely align perfectly with quarterly ESG reporting boundaries (e.g., a bill spanning Dec 15 to Jan 14), how does the accounting team prefer we pro-rate the emissions? Should the normalization layer automatically split the kWh evenly across the days, or keep it attached to the bill's end date?
3. **Webhook Updates:** For travel data, if we ingest a booked flight via webhook, but the employee later cancels the trip, how do Navan/Concur typically send that modification payload? Should our database use soft deletes to maintain the audit trail for canceled emissions?

## SAP Ingestion
*(What subset of SAP data did you choose to handle? What ingestion mechanism? Why?)*

## Utility Data Ingestion
*(What mode of utility data did you choose? What ingestion mechanism? Why?)*

## Corporate Travel Ingestion
*(How are you handling Concur/Navan data? What ingestion mechanism? Why?)*

## Questions for the PM
*(List any questions you would ask the Product Manager if you had the chance.)*

