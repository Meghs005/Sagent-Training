import React, { useEffect } from 'react';
export default function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`toast ${type === 'error' ? 'err' : 'ok'}`}><span>{type === 'error' ? '✕' : '✓'}</span>{message}</div>;
}
