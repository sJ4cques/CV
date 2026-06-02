import { getSupabaseClient } from './supabaseClient'

const DEFAULT_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'uploads'
const DEFAULT_MAX_UPLOAD_MB = 50
const maxUploadMb = Number(import.meta.env.VITE_SUPABASE_MAX_UPLOAD_MB) || DEFAULT_MAX_UPLOAD_MB

export const maxUploadBytes = maxUploadMb * 1024 * 1024
export const maxUploadLabel = `${maxUploadMb} MB`

function normalizeStorageName(fileName) {
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function buildPublicUploadPath(fileName, directory = '') {
  const safeFileName = normalizeStorageName(fileName) || 'upload'
  const uniqueId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`

  return [directory, `${uniqueId}-${safeFileName}`].filter(Boolean).join('/')
}

export function getPublicStorageUrl(path, options = {}) {
  const bucket = options.bucket || DEFAULT_BUCKET
  const client = getSupabaseClient()
  const { data } = client.storage.from(bucket).getPublicUrl(path)

  return data.publicUrl
}

export async function uploadPublicFile(file, options = {}) {
  if (file.size > maxUploadBytes) {
    throw new Error(`El archivo supera el limite de ${maxUploadLabel}.`)
  }

  const bucket = options.bucket || DEFAULT_BUCKET
  const client = getSupabaseClient()
  const path = options.path || buildPublicUploadPath(file.name, options.directory)

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
