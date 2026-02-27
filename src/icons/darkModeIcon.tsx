function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.5A8.5 8.5 0 1111.5 3 
              6.5 6.5 0 0021 12.5z"/>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4"/>
      <line x1="12" y1="2" x2="12" y2="5"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="5" y2="12"/>
      <line x1="19" y1="12" x2="22" y2="12"/>
      <line x1="4.5" y1="4.5" x2="6.5" y2="6.5"/>
      <line x1="17.5" y1="17.5" x2="19.5" y2="19.5"/>
      <line x1="4.5" y1="19.5" x2="6.5" y2="17.5"/>
      <line x1="17.5" y1="6.5" x2="19.5" y2="4.5"/>
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">

      {/* monitor frame */}
      <rect x="3" y="4" width="18" height="12" rx="2"/>

      {/* left half fill */}
      <rect x="3" y="4" width="9" height="12" rx="2" fill="currentColor" stroke="none"/>

      {/* stand */}
      <line x1="8" y1="20" x2="16" y2="20"/>
      <line x1="12" y1="16" x2="12" y2="20"/>

    </svg>
  );
}

export { MoonIcon, SunIcon, SystemIcon };