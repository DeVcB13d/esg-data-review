import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import api from '../api';

const UploadCard = ({ title, description, endpoint, accept, scopeLabel }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [message, setMessage] = useState('');
  const [resultData, setResultData] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
      setResultData(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setStatus('uploading');
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setStatus('success');
      setMessage('Successfully ingested and normalized.');
      setResultData(response.data);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.error || error.message || 'An error occurred during upload.');
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '32px', maxWidth: '600px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2>{title}</h2>
          <p className="text-muted">{description}</p>
        </div>
        <span style={{ 
          background: 'rgba(52, 211, 153, 0.2)', 
          color: 'var(--primary)', 
          padding: '4px 12px', 
          borderRadius: '16px', 
          fontSize: '0.8rem',
          fontWeight: '600'
        }}>
          {scopeLabel}
        </span>
      </div>

      <div 
        className={`drop-zone ${file ? 'active' : ''}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud size={48} color={file ? 'var(--primary)' : 'var(--text-muted)'} />
        {file ? (
          <div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{file.name}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
        ) : (
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            Click to select or drag and drop a file <br/>
            <span style={{ fontSize: '0.8rem' }}>({accept})</span>
          </p>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept={accept}
          onChange={handleFileChange}
        />
      </div>

      <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button 
          className="btn-primary" 
          onClick={handleUpload}
          disabled={!file || status === 'uploading'}
        >
          {status === 'uploading' ? (
            <><Loader size={18} className="spin" /> Processing...</>
          ) : (
            'Process Data'
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

      {resultData && resultData.extracted_data && (
        <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 12px 0', color: 'var(--secondary)' }}>Extracted Data</h4>
          <pre style={{ margin: 0, fontSize: '0.85rem', overflowX: 'auto', color: 'var(--text-muted)' }}>
            {JSON.stringify(resultData.extracted_data, null, 2)}
          </pre>
        </div>
      )}
      
      {resultData && resultData.records_processed && (
        <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
           <h4 style={{ margin: '0 0 12px 0', color: 'var(--secondary)' }}>Processing Complete</h4>
           <p style={{ margin: 0, color: 'var(--text-main)'}}>Successfully processed {resultData.records_processed} SAP records.</p>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default UploadCard;
