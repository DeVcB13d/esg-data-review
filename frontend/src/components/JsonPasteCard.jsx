import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import api from '../api';

const JsonPasteCard = () => {
  const [jsonText, setJsonText] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [resultData, setResultData] = useState(null);

  const handlePaste = (e) => {
    setJsonText(e.target.value);
    setStatus('idle');
    setMessage('');
    setResultData(null);
  };

  const handleSubmit = async () => {
    if (!jsonText.trim()) return;
    
    let parsedJson;
    try {
      parsedJson = JSON.parse(jsonText);
    } catch (e) {
      setStatus('error');
      setMessage('Invalid JSON format. Please check your payload.');
      return;
    }
    
    setStatus('uploading');
    
    try {
      const response = await api.post('/webhooks/navan/', parsedJson);
      
      setStatus('success');
      setMessage('Webhook simulated successfully.');
      setResultData(response.data);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.error || error.message || 'An error occurred.');
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '32px', maxWidth: '600px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2>Simulate Navan API Webhook</h2>
          <p className="text-muted">Paste a sample TMC JSON payload to simulate a flight or hotel booking.</p>
        </div>
        <span style={{ 
          background: 'rgba(52, 211, 153, 0.2)', 
          color: 'var(--primary)', 
          padding: '4px 12px', 
          borderRadius: '16px', 
          fontSize: '0.8rem',
          fontWeight: '600'
        }}>
          Scope 3
        </span>
      </div>

      <textarea
        className="input-glass"
        rows={12}
        placeholder='{
  "trip_id": "T-99812",
  "traveler_id": "emp_001",
  "segment_type": "flight",
  "origin": "BLR",
  "destination": "FRA"
}'
        value={jsonText}
        onChange={handlePaste}
        style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.9rem' }}
      ></textarea>

      <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button 
          className="btn-primary" 
          onClick={handleSubmit}
          disabled={!jsonText.trim() || status === 'uploading'}
        >
          {status === 'uploading' ? (
            <><Loader size={18} className="spin" /> Sending...</>
          ) : (
            <><Send size={18} /> Fire Webhook</>
          )}
        </button>

        {status === 'success' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
            <CheckCircle size={20} />
            <span style={{ fontSize: '0.9rem' }}>{message}</span>
          </div>
        )}

        {status === 'error' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)' }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: '0.9rem' }}>{message}</span>
          </div>
        )}
      </div>
      
      {resultData && resultData.distance_km !== undefined && (
        <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
           <h4 style={{ margin: '0 0 12px 0', color: 'var(--secondary)' }}>Haversine Calculation Result</h4>
           <p style={{ margin: 0, color: 'var(--text-main)'}}>
             {resultData.distance_km > 0 
               ? `Calculated Flight Distance: ${resultData.distance_km.toFixed(2)} km`
               : 'No distance calculated (missing valid origin/destination coordinates).'}
           </p>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default JsonPasteCard;
