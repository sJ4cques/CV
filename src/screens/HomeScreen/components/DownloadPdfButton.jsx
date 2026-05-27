function DownloadPdfButton({ onClick }) {
  return (
    <button className="download-pdf-button" onClick={onClick} type="button">
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M12 3v11" stroke="currentColor" strokeLinecap="square" strokeWidth="2" />
        <path d="m7 10 5 5 5-5" stroke="currentColor" strokeLinecap="square" strokeWidth="2" />
        <path d="M5 18h14v3H5z" stroke="currentColor" strokeLinejoin="miter" strokeWidth="2" />
      </svg>
      <span>Descargar PDF</span>
    </button>
  )
}

export default DownloadPdfButton
