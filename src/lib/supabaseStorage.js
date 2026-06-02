import { getSupabaseClient } from './supabaseClient'

const DEFAULT_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'uploads'

function normalizeStorageName(fileName) {
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function getPublicStorageUrl(path, options = {}) {
  const bucket = options.bucket || DEFAULT_BUCKET
  const client = getSupabaseClient()
  const { data } = client.storage.from(bucket).getPublicUrl(path)

  return data.publicUrl
}

export async function uploadPublicFile(file, options = {}) {
  const bucket = options.bucket || DEFAULT_BUCKET
  const client = getSupabaseClient()
  const safeFileName = normalizeStorageName(file.name) || 'upload'
  const path = options.path || `${Date.now()}-${safeFileName}`

  const { data, error } = await client.storage.from(bucket).upload(path, file, {
    cacheControl: options.cacheControl || '3600',
    contentType: options.contentType || file.type || undefined,
    upsert: options.upsert || false,
  })

  if (error) {
    throw error
  }

  return {
    ...data,
    publicUrl: getPublicStorageUrl(data.path, { bucket }),
  }
}
