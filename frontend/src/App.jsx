import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import UploadCard from './components/UploadCard';
import JsonPasteCard from './components/JsonPasteCard';

function App() {
  const [activeTab, setActiveTab] = useState('sap');

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
            Data Ingestion Portal
          </h1>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>
            Upload raw exports or simulate webhooks to normalize ESG data.
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {activeTab === 'sap' && (
            <UploadCard 
              title="SAP Raw Data (CSV)" 
              description="Upload a joined EKKO/EKPO extract containing materials and fuel usage."
              endpoint="/ingest/sap/"
              accept=".csv"
              scopeLabel="Scope 1 & 3"
            />
          )}
          
          {activeTab === 'utility' && (
            <UploadCard 
              title="Utility Bills (PDF)" 
              description="Upload a regional electricity bill. The LLM will extract the start date, end date, and total kWh."
              endpoint="/ingest/utility/"
              accept=".pdf"
              scopeLabel="Scope 2"
            />
          )}
          
          {activeTab === 'navan' && (
            <JsonPasteCard />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
