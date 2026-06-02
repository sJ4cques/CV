import { useEffect, useRef, useState } from 'react'
import SectionHeading from '../../../components/SectionHeading'
import { createProjectRecord, fetchProjects, updateProjectRecord } from '../../../lib/projectsRepository'
import { maxUploadBytes, maxUploadLabel, uploadPublicFile } from '../../../lib/supabaseStorage'

const dateFormatter = new Intl.DateTimeFormat('es-GT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})
const PROJECTS_PER_PAGE = 3

function getFileNameFromUrl(value) {
  try {
    const url = new URL(value)
    const pathFileName = url.pathname.split('/').filter(Boolean).pop()

    return pathFileName ? decodeURIComponent(pathFileName) : null
  } catch {
    return null
  }
}

function formatProjectDate(value) {
  if (!value) {
    return 'Sin fecha'
  }

  return dateFormatter.format(new Date(value))
}

function ProjectsDossierFile({ isEditorUnlocked }) {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [projectUrl, setProjectUrl] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef(null)
  const isEditing = Boolean(editingProjectId)
  const totalPages = Math.max(1, Math.ceil(projects.length / PROJECTS_PER_PAGE))
  const normalizedCurrentPage = Math.min(currentPage, totalPages)
  const pageStartIndex = (normalizedCurrentPage - 1) * PROJECTS_PER_PAGE
  const visibleProjects = projects.slice(pageStartIndex, pageStartIndex + PROJECTS_PER_PAGE)
  const canPaginate = projects.length > PROJECTS_PER_PAGE

  useEffect(() => {
    let isMounted = true

    fetchProjects()
      .then((nextProjects) => {
        if (isMounted) {
          setProjects(nextProjects)
        }
      })
      .catch((error) => {
        console.error(error)
        if (isMounted) {
          setErrorMessage('No se pudieron cargar los proyectos.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const resetEditor = () => {
    setName('')
    setDescription('')
    setProjectUrl('')
    setDownloadUrl('')
    setEditingProjectId(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleEditProject = (project) => {
    setName(project.name || '')
    setDescription(project.description || '')
    setProjectUrl(project.project_url || '')
    setDownloadUrl(project.file_url || '')
    setEditingProjectId(project.id)
    setMessage('')
    setErrorMessage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmedName = name.trim()
    const trimmedDescription = description.trim()
    const trimmedProjectUrl = projectUrl.trim()
    const trimmedDownloadUrl = downloadUrl.trim()

    if (!trimmedName || !trimmedDescription) {
      setErrorMessage('Completa el nombre y la descripcion del proyecto.')
      return
    }

    setIsSubmitting(true)
    setMessage('')
    setErrorMessage('')

    try {
      const selectedFile = fileInputRef.current?.files?.[0]

      if (trimmedProjectUrl) {
        try {
          new URL(trimmedProjectUrl)
        } catch {
          setErrorMessage('La URL del proyecto no es valida.')
          return
        }
      }

      if (selectedFile && trimmedDownloadUrl) {
        setErrorMessage('Usa archivo o URL de descarga, no ambos.')
        return
      }

      if (selectedFile && selectedFile.size > maxUploadBytes) {
        setErrorMessage(`El archivo supera el limite de ${maxUploadLabel}.`)
        return
      }

      if (trimmedDownloadUrl) {
        try {
          new URL(trimmedDownloadUrl)
        } catch {
          setErrorMessage('La URL de descarga no es valida.')
          return
        }
      }

      const uploadedFile = selectedFile
        ? await uploadPublicFile(selectedFile, { directory: 'projects' })
        : null
      const externalFileName = trimmedDownloadUrl ? getFileNameFromUrl(trimmedDownloadUrl) : null
      const projectPayload = {
        description: trimmedDescription,
        fileName: selectedFile?.name || externalFileName || null,
        filePath: uploadedFile?.path,
        fileUrl: uploadedFile?.publicUrl || trimmedDownloadUrl || null,
        name: trimmedName,
        projectUrl: trimmedProjectUrl || null,
      }

      const project = isEditing
        ? await updateProjectRecord(editingProjectId, projectPayload)
        : await createProjectRecord(projectPayload)

      setProjects((currentProjects) => (
        isEditing
          ? currentProjects.map((currentProject) => (
            currentProject.id === project.id ? project : currentProject
          ))
          : [project, ...currentProjects]
      ))
      setCurrentPage(1)
      resetEditor()
      setMessage(isEditing ? 'Proyecto actualizado.' : 'Proyecto archivado.')
    } catch (error) {
      console.error(error)
      const message = error.message?.includes('maximum allowed size')
        ? `El archivo supera el limite de ${maxUploadLabel}.`
        : 'No se pudo guardar el proyecto.'

      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="folder-file folder-file--projects" id="file-proyectos">
      <div className="projects-file">
        <div className="projects-file__header">
          <SectionHeading eyebrow="Proyectos" title="Expedientes de software" />
          <p>
            Registros publicos de proyectos, notas de implementacion y archivos de apoyo.
          </p>
        </div>

        {isEditorUnlocked ? (
          <form className="project-editor" onSubmit={handleSubmit}>
            <SectionHeading eyebrow="Editor" title={isEditing ? 'Editar proyecto' : 'Nuevo proyecto'} />
            <label>
              <span>Nombre</span>
              <input
                onChange={(event) => setName(event.target.value)}
                type="text"
                value={name}
              />
            </label>
            <label>
              <span>Descripcion</span>
              <textarea
                onChange={(event) => setDescription(event.target.value)}
                rows="5"
                value={description}
              />
            </label>
            <label>
              <span>Archivo opcional</span>
              <input ref={fileInputRef} type="file" />
            </label>
            <label>
              <span>URL del proyecto</span>
              <input
                onChange={(event) => setProjectUrl(event.target.value)}
                type="url"
                value={projectUrl}
              />
            </label>
            <label>
              <span>URL de descarga</span>
              <input
                onChange={(event) => setDownloadUrl(event.target.value)}
                type="url"
                value={downloadUrl}
              />
            </label>
            <div className="project-editor__actions">
              <button disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar proyecto' : 'Guardar proyecto'}
              </button>
              {isEditing ? (
                <button disabled={isSubmitting} onClick={resetEditor} type="button">
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
        ) : null}

        <div className="project-status" role="status">
          {message ? <p>{message}</p> : null}
          {errorMessage ? <p className="project-status__error">{errorMessage}</p> : null}
        </div>

        <div className="project-list">
          {isLoading ? <p className="project-empty">Cargando expedientes...</p> : null}
          {!isLoading && !errorMessage && projects.length === 0 ? (
            <p className="project-empty">Sin proyectos archivados.</p>
          ) : null}
          {visibleProjects.map((project) => (
            <article className="project-card" key={project.id}>
              <div className="project-card__meta">
                <span>{formatProjectDate(project.created_at)}</span>
                {project.file_url ? <span>Adjunto</span> : <span>Sin adjunto</span>}
              </div>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <div className="project-card__actions">
                {isEditorUnlocked ? (
                  <button onClick={() => handleEditProject(project)} type="button">
                    Editar
                  </button>
                ) : null}
                {project.project_url ? (
                  <a href={project.project_url} rel="noreferrer" target="_blank">
                    Ver proyecto
                  </a>
                ) : null}
                {project.file_url ? (
                  <a href={project.file_url} rel="noreferrer" target="_blank">
                    Descargar archivo
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
        {canPaginate ? (
          <nav className="project-pagination" aria-label="Paginas de proyectos">
            <button
              disabled={normalizedCurrentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              type="button"
            >
              Anterior
            </button>
            <span>
              {String(normalizedCurrentPage).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
            </span>
            <button
              disabled={normalizedCurrentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              type="button"
            >
              Siguiente
            </button>
          </nav>
        ) : null}
      </div>
    </section>
  )
}

export default ProjectsDossierFile
