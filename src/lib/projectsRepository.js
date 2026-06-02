import { getSupabaseClient } from './supabaseClient'

const PROJECTS_TABLE = 'projects'

const projectFields = 'id, name, description, project_url, file_path, file_name, file_url, created_at'

export async function fetchProjects() {
  const { data, error } = await getSupabaseClient()
    .from(PROJECTS_TABLE)
    .select(projectFields)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

export async function createProjectRecord(project) {
  const { data, error } = await getSupabaseClient()
    .from(PROJECTS_TABLE)
    .insert({
      description: project.description,
      file_name: project.fileName || null,
      file_path: project.filePath || null,
      file_url: project.fileUrl || null,
      name: project.name,
      project_url: project.projectUrl || null,
    })
    .select(projectFields)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateProjectRecord(projectId, project) {
  const { data, error } = await getSupabaseClient()
    .from(PROJECTS_TABLE)
    .update({
      description: project.description,
      file_name: project.fileName || null,
      file_path: project.filePath || null,
      file_url: project.fileUrl || null,
      name: project.name,
      project_url: project.projectUrl || null,
    })
    .eq('id', projectId)
    .select(projectFields)
    .single()

  if (error) {
    throw error
  }

  return data
}
