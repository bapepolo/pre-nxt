function EnterIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24">
      <path d="M4 9V4h5" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M20 9V4h-5" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M4 15v5h5" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M20 15v5h-5" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  );
}

function ExitIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24">
      <path d="M8 3v5H3" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M16 3v5h5" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M8 21v-5H3" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M16 21v-5h5" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  );
}

export { EnterIcon, ExitIcon };