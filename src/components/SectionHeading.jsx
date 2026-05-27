function SectionHeading({ eyebrow, title, align = 'left', tone = 'light' }) {
  const alignment = align === 'center' ? 'items-center text-center' : 'items-start'
  const titleColor = tone === 'dark' ? 'text-[#F2F2F2]' : 'text-black'

  return (
    <div className={`classified-heading flex flex-col gap-3 ${alignment}`}>
      {eyebrow ? (
        <span className="classified-heading__eyebrow w-fit px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black">
          {eyebrow}
        </span>
      ) : null}
      <h2 className={`max-w-3xl text-2xl font-semibold sm:text-3xl ${titleColor}`}>
        {title}
      </h2>
    </div>
  )
}

export default SectionHeading
