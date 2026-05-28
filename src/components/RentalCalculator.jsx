import { useState } from 'react';

export default function RentalCalculator({ targetProperties, onSaveAnalysis, onUploadAnalysis, day }) {
  const [notes, setNotes] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!propertyId || !notes.trim()) return;
    setSaving(true);
    await onSaveAnalysis(propertyId, notes.trim());
    setNotes('');
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const selectStyle = {
    width: '100%', fontSize: 13, padding: '9px 12px', borderRadius: 8,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#ccc', fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <div>
      {/* CDS Rental Calculator iframe */}
      <div style={{
        position: 'relative', width: '100%', overflow: 'hidden',
        borderRadius: 8, marginBottom: 14, background: '#fff',
      }}>
        <iframe
          src="https://cds-rental-calc.web.app/"
          style={{
            width: '100%', minHeight: 500, height: '80vh', maxHeight: 800,
            border: 'none', display: 'block',
          }}
          title="CDS Rental Calculator"
          loading="lazy"
        />
      </div>

      {/* Save analysis to a property */}
      <div style={{
        padding: '14px 16px', borderRadius: 10,
        background: 'rgba(233,69,96,0.04)', border: '1px solid rgba(233,69,96,0.15)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e94560', marginBottom: 10 }}>
          Save Analysis to a Property
        </div>
        <select value={propertyId} onChange={e => setPropertyId(e.target.value)}
          style={{ ...selectStyle, marginBottom: 8 }}>
          <option value="">Select target property...</option>
          {(targetProperties || []).map(c => (
            <option key={c.id} value={c.id}>
              {c.name}{c.property ? ` — ${c.property.split('|')[0]}` : ''}
            </option>
          ))}
        </select>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Paste your analysis results here (purchase price, rent, cash flow, cap rate, etc.)"
          rows={4}
          style={{
            width: '100%', fontSize: 13, padding: '9px 12px', borderRadius: 8,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#eee', resize: 'vertical', fontFamily: "'DM Sans', sans-serif",
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <button
            disabled={!propertyId || !notes.trim() || saving}
            onClick={handleSave}
            style={{
              padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: propertyId && notes.trim() ? 'pointer' : 'default',
              fontFamily: "'DM Sans', sans-serif", border: 'none',
              background: propertyId && notes.trim() ? 'rgba(233,69,96,0.2)' : 'rgba(255,255,255,0.06)',
              color: propertyId && notes.trim() ? '#e94560' : '#555',
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Analysis'}
          </button>
          {saved && (
            <span style={{ fontSize: 12, color: '#48c78e', fontWeight: 600 }}>
              Saved! Properties analyzed +1
            </span>
          )}
        </div>
      </div>

      {/* Upload from CDS App */}
      <UploadAnalysis
        targetProperties={targetProperties}
        onUploadAnalysis={onUploadAnalysis}
        onSaveAnalysis={onSaveAnalysis}
        day={day}
      />
    </div>
  );
}

function UploadAnalysis({ targetProperties, onUploadAnalysis, onSaveAnalysis, day }) {
  const [open, setOpen] = useState(false);
  const [propertyId, setPropertyId] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState('');

  const MAX_SIZE = 10 * 1024 * 1024;

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_SIZE) {
      setError('File must be under 10MB');
      setFile(null);
      return;
    }
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(f.type)) {
      setError('Upload a PDF or image (PNG, JPG, WebP)');
      setFile(null);
      return;
    }
    setError('');
    setFile(f);
  };

  const handleUpload = async () => {
    if (!propertyId || !file) return;
    setUploading(true);
    setError('');
    try {
      if (onUploadAnalysis) {
        const result = await onUploadAnalysis(propertyId, file, day);
        if (!result) { setError('Upload failed — try again'); setUploading(false); return; }
      }
      await onSaveAnalysis(propertyId, `[Uploaded from CDS Rental Calculator App]\nFile: ${file.name}\nDate: ${new Date().toLocaleDateString()}\nDay: ${day}`);
      setUploaded(true);
      setFile(null);
      setPropertyId('');
      setTimeout(() => setUploaded(false), 3000);
    } catch (err) {
      setError('Upload failed — try again');
    }
    setUploading(false);
  };

  return (
    <div style={{
      marginTop: 12, borderRadius: 10,
      border: '1px solid rgba(240,165,0,0.2)', overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(240,165,0,0.06)', border: 'none',
          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>📄</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f0a500' }}>Upload from CDS App</div>
            <div style={{ fontSize: 11, color: '#888' }}>Import a PDF or screenshot from the CDS Rental Calculator app</div>
          </div>
        </div>
        <span style={{ fontSize: 12, color: '#888', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </button>

      {open && (
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 12, lineHeight: 1.6 }}>
            Ran the analysis on the CDS Rental Calculator app? Export the one-page PDF or take a screenshot and upload it here to attach to a target property.
          </div>

          <select value={propertyId} onChange={e => setPropertyId(e.target.value)}
            style={{
              width: '100%', fontSize: 13, padding: '9px 12px', borderRadius: 8, marginBottom: 10,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#ccc', fontFamily: "'DM Sans', sans-serif",
            }}>
            <option value="">Select target property...</option>
            {(targetProperties || []).map(c => (
              <option key={c.id} value={c.id}>
                {c.name}{c.property ? ` — ${c.property.split('|')[0]}` : ''}
              </option>
            ))}
          </select>

          <label style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px 16px', borderRadius: 8, marginBottom: 10, cursor: 'pointer',
            border: '2px dashed rgba(240,165,0,0.3)', background: 'rgba(240,165,0,0.04)',
            fontSize: 13, color: file ? '#f0a500' : '#888', fontWeight: 600,
          }}>
            <input type="file" accept=".pdf,image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              style={{ display: 'none' }} />
            {file ? `${file.name} (${(file.size / 1024).toFixed(0)} KB)` : 'Choose PDF or Image...'}
          </label>

          {error && (
            <div style={{ fontSize: 12, color: '#e94560', marginBottom: 10 }}>{error}</div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              disabled={!propertyId || !file || uploading}
              onClick={handleUpload}
              style={{
                padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: propertyId && file ? 'pointer' : 'default',
                fontFamily: "'DM Sans', sans-serif", border: 'none',
                background: propertyId && file ? 'rgba(240,165,0,0.2)' : 'rgba(255,255,255,0.06)',
                color: propertyId && file ? '#f0a500' : '#555',
                opacity: uploading ? 0.5 : 1,
              }}
            >
              {uploading ? 'Uploading...' : 'Upload & Save'}
            </button>
            {uploaded && (
              <span style={{ fontSize: 12, color: '#48c78e', fontWeight: 600 }}>
                Uploaded & saved!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
