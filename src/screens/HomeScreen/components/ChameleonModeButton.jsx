function ChameleonModeButton({ icon, isActive, onActivate }) {
  return (
    <button
      aria-pressed={isActive}
      className="chameleon-mode-button"
      onClick={onActivate}
      type="button"
    >
      <img alt="" src={icon} />
      <span>{isActive ? 'Clasificar' : 'Desclasificar'}</span>
    </button>
  )
}

export default ChameleonModeButton
