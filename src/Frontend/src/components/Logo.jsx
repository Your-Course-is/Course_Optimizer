// src/components/Logo.jsx
import React from 'react';

function Logo({ size = 40, className = "" }) {
  return (
    <img 
      src="/logo.png" 
      alt="Campus Compass Logo" 
      style={{ height: `${size}px`, width: 'auto' }}
      className={`logo ${className}`}
    />
  );
}

export default Logo;
