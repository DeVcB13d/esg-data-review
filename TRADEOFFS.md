# Tradeoffs

Here are three things deliberately not built in this prototype and why:

1. **Live OAuth2 / Webhook Integrations for Travel Platforms**
   - *Reasoning:* Building a live integration to a production TMC (like Navan or Concur) requires configuring OAuth2 flows, registering callback URLs, and managing access token refreshes. due to significant administrative overhead that distracts from demonstrating core ESG data modeling skills.
2. **Automated Emission Factor Lookups (Carbon Math)**
   - *Reasoning:* The system stops at unit normalization (e.g., yielding a clean `5,160 kWh`). It does not multiply that consumption by an emission factor (e.g., `0.38 kgCO2e/kWh`) to yield a final carbon footprint. Managing a geographically specific, up-to-date emissions factor database (like EPA eGRID or DEFRA) is a massive undertaking. 

3. **Usage of more complex SAP, utility and data formats**
   - *Reasoning:* Currently most of the systems have features to export as CSV and I believe that other formats, could be built upon this.
