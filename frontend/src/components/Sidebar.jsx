import React from 'react';
import { Database, FileText, Plane, LayoutDashboard } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'sap', label: 'SAP Data', icon: Database },
    { id: 'utility', label: 'Utility Bills', icon: FileText },
    { id: 'navan', label: 'Corporate Travel', icon: Plane },
  ];

  return (
    <div className="sidebar">
      <div>
        <h2 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LayoutDashboard size={28} />
          Breathe ESG
        </h2>
        <p className="text-muted" style={{ marginTop: '-12px', fontSize: '0.85rem' }}>Data Review Portal</p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                border: '1px solid',
                borderColor: isActive ? 'var(--primary)' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                fontWeight: isActive ? '600' : '400',
              }}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      <div style={{ marginTop: 'auto', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.85rem' }}>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Logged in as</p>
        <p style={{ margin: '4px 0 0 0', fontWeight: 'bold' }}>Sustainability Analyst</p>
      </div>
    </div>
  );
};

export default Sidebar;
