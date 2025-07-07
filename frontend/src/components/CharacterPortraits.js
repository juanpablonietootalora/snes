import React from "react";

// SNES-style character portraits based on the reference sprite
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
      {/* Purple hood - matching the reference sprite */}
      <ellipse cx="24" cy="16" rx="12" ry="10" fill="#7860a0"/>
      <ellipse cx="24" cy="15" rx="10" ry="8" fill="#9480c0"/>
      <ellipse cx="24" cy="14" rx="8" ry="6" fill="#b0a0e0"/>
      
      {/* Face (partially visible in hood) */}
      <ellipse cx="24" cy="17" rx="6" ry="5" fill="#f0c8a0"/>
      <ellipse cx="24" cy="16" rx="5" ry="4" fill="#d0a880"/>
      
      {/* Glowing eyes */}
      <rect x="21" y="16" width="2" height="2" fill="#ffff80"/>
      <rect x="25" y="16" width="2" height="2" fill="#ffff80"/>
      
      {/* Dark robe body */}
      <rect x="16" y="26" width="16" height="18" fill="#403060"/>
      <rect x="17" y="27" width="14" height="16" fill="#504070"/>
      
      {/* Medical cross on chest */}
      <rect x="22" y="30" width="4" height="8" fill="#c8b490"/>
      <rect x="20" y="32" width="8" height="4" fill="#c8b490"/>
      
      {/* Arms */}
      <rect x="12" y="28" width="6" height="8" fill="#403060"/>
      <rect x="30" y="28" width="6" height="8" fill="#403060"/>
      
      {/* Feet */}
      <rect x="18" y="42" width="4" height="4" fill="#403060"/>
      <rect x="26" y="42" width="4" height="4" fill="#403060"/>
    </svg>
  )
};

export default CharacterPortraits;