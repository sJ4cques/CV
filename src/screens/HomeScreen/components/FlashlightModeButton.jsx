function FlashlightModeButton({ isActive, onActivate }) {
  return (
    <button
      aria-label={isActive ? 'Apagar linterna' : 'Encender linterna'}
      aria-pressed={isActive}
      className="flashlight-mode-button"
      onClick={onActivate}
      title={isActive ? 'Apagar linterna' : 'Encender linterna'}
      type="button"
    >
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path
          d="M8 10a4 4 0 1 1 8 0c0 1.42-.73 2.4-1.48 3.24-.61.68-1.16 1.3-1.3 2.26h-2.44c-.14-.96-.69-1.58-1.3-2.26C8.73 12.4 8 11.42 8 10Z"
          stroke="currentColor"
          strokeLinejoin="miter"
          strokeWidth="2"
        />
        <path d="M10 18h4" stroke="currentColor" strokeLinecap="square" strokeWidth="2" />
        <path d="M10.8 21h2.4" stroke="currentColor" strokeLinecap="square" strokeWidth="2" />
        <path d="M12 1v2" stroke="currentColor" strokeLinecap="square" strokeWidth="2" />
        <path d="M4 6l1.5 1.5" stroke="currentColor" strokeLinecap="square" strokeWidth="2" />
        <path d="M20 6l-1.5 1.5" stroke="currentColor" strokeLinecap="square" strokeWidth="2" />
      </svg>
    </button>
  )
}

export default FlashlightModeButton
