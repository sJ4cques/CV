import { jsPDF } from 'jspdf'

const COLORS = {
  accent: [182, 176, 159],
  black: [0, 0, 0],
  muted: [78, 78, 78],
  paper: [242, 242, 242],
}

const projectDateFormatter = new Intl.DateTimeFormat('es-GT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

function setText(doc, color, size, style = 'normal') {
  doc.setFont('helvetica', style)
  doc.setFontSize(size)
  doc.setTextColor(...color)
}

function drawFrame(doc, pageWidth, pageHeight) {
  doc.setDrawColor(...COLORS.black)
  doc.setLineWidth(0.35)
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

  doc.setFillColor(...COLORS.accent)
  doc.rect(10, 10, pageWidth - 20, 5, 'F')
}

function getImageDataUrl(imageUrl) {
  return fetch(imageUrl)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((resolve) => {
          const reader = new FileReader()

          reader.addEventListener('load', () => resolve(reader.result))
          reader.readAsDataURL(blob)
        }),
    )
}

function formatProjectDate(value) {
  if (!value) {
    return 'Sin fecha'
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? 'Sin fecha' : projectDateFormatter.format(date)
}

async function downloadFormalCvPdf({
  contactItems,
  education,
  experience,
  interests,
  languages,
  profile,
  projects = [],
}) {
  const doc = new jsPDF({ format: 'letter', unit: 'mm' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 18
  const contentWidth = pageWidth - margin * 2
  const dateColumnWidth = 38
  const dateGap = 8
  const bodyColumnWidth = contentWidth - dateColumnWidth - dateGap
  const projectItems = Array.isArray(projects) ? projects : []
  let y = margin + 8

  const ensureSpace = (height) => {
    if (y + height <= pageHeight - margin) {
      return
    }

    doc.addPage()
    drawFrame(doc, pageWidth, pageHeight)
    y = margin + 8
  }

  const addWrappedText = (text, x, maxWidth, options = {}) => {
    const {
      after = 2,
      color = COLORS.black,
      lineHeight = 5,
      size = 10,
      style = 'normal',
    } = options
    const lines = doc.splitTextToSize(text, maxWidth)

    ensureSpace(lines.length * lineHeight + after)
    setText(doc, color, size, style)
    doc.text(lines, x, y)
    y += lines.length * lineHeight + after
  }

  const addMetadataLine = (label, value, maxWidth = contentWidth - 32) => {
    const lineHeight = 4.4
    const lines = doc.splitTextToSize(value, maxWidth)

    ensureSpace(lines.length * lineHeight + 1)
    setText(doc, COLORS.muted, 8, 'bold')
    doc.text(`${label.toUpperCase()}:`, margin, y)
    setText(doc, COLORS.black, 9)
    doc.text(lines, margin + 32, y)
    y += lines.length * lineHeight + 1
  }

  const addSectionTitle = (title) => {
    ensureSpace(11)
    y += 3
    doc.setDrawColor(...COLORS.accent)
    doc.setLineWidth(1)
    doc.line(margin, y - 4, pageWidth - margin, y - 4)
    setText(doc, COLORS.black, 11, 'bold')
    doc.text(title.toUpperCase(), margin, y)
    y += 6
  }

  const addDatedEntryHeader = (title, period) => {
    const titleLines = doc.splitTextToSize(title, bodyColumnWidth)
    const lineHeight = 5

    ensureSpace(titleLines.length * lineHeight + 4)
    setText(doc, COLORS.black, 11, 'bold')
    doc.text(titleLines, margin, y)
    setText(doc, COLORS.muted, 9, 'bold')
    doc.text(period, pageWidth - margin, y, { align: 'right' })
    y += titleLines.length * lineHeight + 1
  }

  const addTechnologyTags = (technologies) => {
    const gap = 2
    const rowHeight = 6.5
    const paddingX = 2.2
    const chipMaxWidth = contentWidth
    const rightEdge = margin + contentWidth
    let x = margin

    ensureSpace(12)
    setText(doc, COLORS.muted, 8, 'bold')
    doc.text('TECNOLOGIAS:', margin, y)
    y += 6

    setText(doc, COLORS.black, 8, 'bold')

    technologies.forEach((technology) => {
      const label = technology.trim()
      const labelWidth = doc.getTextWidth(label)

      if (labelWidth + paddingX * 2 > chipMaxWidth) {
        if (x !== margin) {
          x = margin
          y += rowHeight
        }

        addWrappedText(label, margin, contentWidth, {
          after: 0,
          color: COLORS.black,
          lineHeight: 4.5,
          size: 8,
          style: 'bold',
        })
        y += gap
        return
      }

      const chipWidth = labelWidth + paddingX * 2

      if (x + chipWidth > rightEdge) {
        x = margin
        y += rowHeight
      }

      ensureSpace(rowHeight + 2)
      doc.setDrawColor(...COLORS.accent)
      doc.setFillColor(...COLORS.paper)
      doc.rect(x, y - 3.9, chipWidth, 5.8, 'FD')
      setText(doc, COLORS.black, 8, 'bold')
      doc.text(label, x + paddingX, y)
      x += chipWidth + gap
    })

    y += rowHeight
  }

  const getProjectLinks = (project) => (
    [
      project.project_url ? { label: 'Ver proyecto', url: project.project_url } : null,
      project.file_url ? { label: 'Descargar archivo', url: project.file_url } : null,
    ].filter(Boolean)
  )

  const getProjectCardHeight = (project, width) => {
    const cardPadding = 4.5
    const textWidth = width - cardPadding * 2
    const titleLines = doc.splitTextToSize(project.name || 'Proyecto sin nombre', textWidth)
    const descriptionLines = doc.splitTextToSize(project.description || 'Sin descripcion.', textWidth)
    const links = getProjectLinks(project)

    return Math.max(
      36,
      cardPadding * 2
        + 4.2
        + titleLines.length * 4.9
        + 1.5
        + descriptionLines.length * 4.15
        + (links.length ? 3 + links.length * 4.4 : 0),
    )
  }

  const drawProjectCard = (project, x, cardY, width, height) => {
    const cardPadding = 4.5
    const textWidth = width - cardPadding * 2
    const titleLines = doc.splitTextToSize(project.name || 'Proyecto sin nombre', textWidth)
    const descriptionLines = doc.splitTextToSize(project.description || 'Sin descripcion.', textWidth)
    const links = getProjectLinks(project)
    let textY = cardY + cardPadding + 3.2

    doc.setDrawColor(...COLORS.accent)
    doc.setFillColor(250, 250, 250)
    doc.rect(x, cardY, width, height, 'FD')
    doc.setFillColor(...COLORS.accent)
    doc.rect(x, cardY, 2, height, 'F')

    setText(doc, COLORS.muted, 7, 'bold')
    doc.text(formatProjectDate(project.created_at).toUpperCase(), x + cardPadding, textY)
    textY += 5

    setText(doc, COLORS.black, 9.5, 'bold')
    doc.text(titleLines, x + cardPadding, textY)
    textY += titleLines.length * 4.9 + 1.5

    setText(doc, COLORS.black, 8.2)
    doc.text(descriptionLines, x + cardPadding, textY)
    textY += descriptionLines.length * 4.15 + 2

    links.forEach((link) => {
      setText(doc, COLORS.black, 7.6, 'bold')
      if (typeof doc.textWithLink === 'function') {
        doc.textWithLink(link.label, x + cardPadding, textY, { url: link.url })
      } else {
        doc.text(link.label, x + cardPadding, textY)
      }
      textY += 4.4
    })
  }

  const addProjectTextEntry = (project) => {
    const links = getProjectLinks(project)

    ensureSpace(15)
    setText(doc, COLORS.muted, 8, 'bold')
    doc.text(formatProjectDate(project.created_at).toUpperCase(), margin, y)
    y += 4.5

    addWrappedText(project.name || 'Proyecto sin nombre', margin, contentWidth, {
      after: 0,
      color: COLORS.black,
      lineHeight: 4.7,
      size: 10,
      style: 'bold',
    })
    addWrappedText(project.description || 'Sin descripcion.', margin, contentWidth, {
      after: 1,
      color: COLORS.black,
      lineHeight: 4.6,
      size: 8.8,
    })

    links.forEach((link) => {
      ensureSpace(5)
      setText(doc, COLORS.black, 8, 'bold')
      if (typeof doc.textWithLink === 'function') {
        doc.textWithLink(link.label, margin, y, { url: link.url })
      } else {
        doc.text(link.label, margin, y)
      }
      y += 4.8
    })

    y += 2
  }

  const addProjectCards = () => {
    const columnGap = 5
    const rowGap = 5
    const columnWidth = (contentWidth - columnGap) / 2
    const maxCardHeight = pageHeight - margin * 2 - 8
    let index = 0

    while (index < projectItems.length) {
      const currentProject = projectItems[index]
      const nextProject = projectItems[index + 1]
      const currentHeight = getProjectCardHeight(currentProject, columnWidth)
      const nextHeight = nextProject ? getProjectCardHeight(nextProject, columnWidth) : 0
      const rowHeight = Math.max(currentHeight, nextHeight)

      if (rowHeight > maxCardHeight) {
        const fullWidthHeight = getProjectCardHeight(currentProject, contentWidth)

        if (fullWidthHeight > maxCardHeight) {
          addProjectTextEntry(currentProject)
          index += 1
          continue
        }

        ensureSpace(fullWidthHeight + rowGap)
        drawProjectCard(currentProject, margin, y, contentWidth, fullWidthHeight)
        y += fullWidthHeight + rowGap
        index += 1
        continue
      }

      ensureSpace(rowHeight + rowGap)
      drawProjectCard(currentProject, margin, y, columnWidth, rowHeight)

      if (nextProject) {
        drawProjectCard(nextProject, margin + columnWidth + columnGap, y, columnWidth, rowHeight)
      }

      y += rowHeight + rowGap
      index += 2
    }
  }

  doc.setProperties({
    author: profile.name,
    subject: 'Curriculum vitae formal',
    title: `CV - ${profile.name}`,
  })

  const photoDataUrl = profile.photo ? await getImageDataUrl(profile.photo) : null

  drawFrame(doc, pageWidth, pageHeight)

  if (photoDataUrl) {
    const photoWidth = 30
    const photoHeight = 40
    const photoX = pageWidth - margin - photoWidth
    const photoY = y - 4

    doc.setDrawColor(...COLORS.black)
    doc.setLineWidth(0.35)
    doc.rect(photoX - 1.5, photoY - 1.5, photoWidth + 3, photoHeight + 3)
    doc.addImage(photoDataUrl, 'JPEG', photoX, photoY, photoWidth, photoHeight)
  }

  const headerTextWidth = photoDataUrl ? contentWidth - 40 : contentWidth
  const nameLines = doc.splitTextToSize(profile.name.toUpperCase(), headerTextWidth)

  setText(doc, COLORS.black, 20, 'bold')
  doc.text(nameLines, margin, y)
  y += nameLines.length * 8
  setText(doc, COLORS.muted, 11, 'bold')
  doc.text(doc.splitTextToSize(profile.headline.toUpperCase(), headerTextWidth), margin, y)
  y += 8

  contactItems.forEach((item) => {
    addMetadataLine(item.label, item.value, headerTextWidth - 32)
  })

  y = Math.max(y, margin + 43)

  addSectionTitle('Perfil profesional')
  addWrappedText(profile.summary, margin, contentWidth, {
    color: COLORS.black,
    lineHeight: 5,
    size: 10,
  })

  addSectionTitle('Experiencia')
  experience.forEach((item) => {
    addDatedEntryHeader(item.role, item.period)

    if (item.company) {
      addWrappedText(item.company, margin, bodyColumnWidth, {
        after: 0,
        color: COLORS.black,
        size: 9,
        style: 'bold',
      })
    }

    if (item.location) {
      addWrappedText(item.location, margin, bodyColumnWidth, {
        after: 0,
        color: COLORS.muted,
        size: 9,
      })
    }

    addWrappedText(item.summary, margin, contentWidth, { after: 1, color: COLORS.black, size: 9 })

    if (item.technologies) {
      addTechnologyTags(item.technologies)
    }

    y += 2
  })

  addSectionTitle('Formacion')
  education.forEach((item) => {
    addDatedEntryHeader(item.level, item.period)

    addWrappedText(item.place, margin, bodyColumnWidth, { after: 0, color: COLORS.muted, size: 9 })
    addWrappedText(item.title, margin, contentWidth, { after: 0, color: COLORS.black, size: 9 })

    if (item.detail) {
      addWrappedText(item.detail, margin, contentWidth, { color: COLORS.black, size: 9 })
    }

    y += 2
  })

  addSectionTitle('Idiomas')
  languages.forEach((language) => {
    addWrappedText(`${language.name}: ${language.details.join(', ')}`, margin, contentWidth, {
      color: COLORS.black,
      size: 9,
      style: 'bold',
    })
  })

  addSectionTitle('Intereses')
  addWrappedText(interests.join(', '), margin, contentWidth, { color: COLORS.black, size: 9 })

  addSectionTitle('Proyectos')
  if (projectItems.length) {
    addProjectCards()
  } else {
    addWrappedText('Portafolio de proyectos disponible en el sitio web.', margin, contentWidth, {
      color: COLORS.black,
      size: 9,
      style: 'bold',
    })
  }

  doc.save('CV-James-Yang.pdf')
}

export default downloadFormalCvPdf
