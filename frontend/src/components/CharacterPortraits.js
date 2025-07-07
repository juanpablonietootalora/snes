import React from "react";

// Simple placeholder character portraits as inline SVGs
export const CharacterPortraits = {
  detective: (
    <svg width="48" height="48" viewBox="0 0 48 48" className="pixel-art">
      <rect width="48" height="48" fill="#1a1a2e"/>
      {/* Hat */}
      <rect x="12" y="8" width="24" height="6" fill="#000000"/>
      {/* Face */}
      <rect x="16" y="14" width="16" height="16" fill="#d4a574"/>
      {/* Eyes */}
      <rect x="18" y="18" width="3" height="3" fill="#000000"/>
      <rect x="27" y="18" width="3" height="3" fill="#000000"/>
      {/* Coat */}
      <rect x="14" y="30" width="20" height="18" fill="#8b4513"/>
      {/* Badge */}
      <rect x="20" y="34" width="8" height="6" fill="#ffd700"/>
    </svg>
  ),
  
  witch: (
    <svg width="48" height="48" viewBox="0 0 48 48" className="pixel-art">
      <rect width="48" height="48" fill="#1a1a2e"/>
      {/* Pointed hat */}
      <polygon points="24,4 18,20 30,20" fill="#4b0082"/>
      {/* Face */}
      <rect x="16" y="20" width="16" height="12" fill="#d4a574"/>
      {/* Eyes */}
      <rect x="18" y="22" width="3" height="3" fill="#800080"/>
      <rect x="27" y="22" width="3" height="3" fill="#800080"/>
      {/* Robe */}
      <rect x="12" y="32" width="24" height="16" fill="#4b0082"/>
      {/* Crystal ball */}
      <circle cx="36" cy="26" r="4" fill="#e6e6fa"/>
    </svg>
  ),
  
  scientist: (
    <svg width="48" height="48" viewBox="0 0 48 48" className="pixel-art">
      <rect width="48" height="48" fill="#1a1a2e"/>
      {/* Goggles */}
      <rect x="14" y="12" width="20" height="8" fill="#228b22"/>
      <circle cx="18" cy="16" r="3" fill="#ffffff"/>
      <circle cx="30" cy="16" r="3" fill="#ffffff"/>
      {/* Face */}
      <rect x="16" y="20" width="16" height="12" fill="#d4a574"/>
      {/* Lab coat */}
      <rect x="12" y="32" width="24" height="16" fill="#ffffff"/>
      {/* Mutations */}
      <rect x="8" y="38" width="4" height="8" fill="#32cd32"/>
      <rect x="36" y="40" width="6" height="6" fill="#32cd32"/>
    </svg>
  ),
  
  healer: (
    <svg width="48" height="48" viewBox="0 0 48 48" className="pixel-art">
      <rect width="48" height="48" fill="#1a1a2e"/>
      {/* Plague mask */}
      <rect x="16" y="12" width="16" height="20" fill="#2f4f4f"/>
      <rect x="20" y="22" width="8" height="8" fill="#000000"/>
      {/* Beak */}
      <rect x="24" y="30" width="4" height="6" fill="#8b4513"/>
      {/* Medical robes */}
      <rect x="14" y="32" width="20" height="16" fill="#dc143c"/>
      {/* Cross symbol */}
      <rect x="22" y="36" width="4" height="8" fill="#ffffff"/>
      <rect x="20" y="38" width="8" height="4" fill="#ffffff"/>
    </svg>
  )
};

export default CharacterPortraits;