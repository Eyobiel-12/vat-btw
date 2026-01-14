/**
 * Column Mapping Storage Utilities
 * Handles saving and loading column mappings for Excel imports
 */

export interface SavedMapping {
  id: string
  name: string
  uploadType: "grootboek" | "boekingsregels"
  mapping: Record<string, string>
  createdAt: string
  lastUsed?: string
}

const STORAGE_KEY = "btw-assist-column-mappings"
const MAX_SAVED_MAPPINGS = 10

/**
 * Get all saved mappings from localStorage
 */
export function getSavedMappings(): SavedMapping[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch {
    return []
  }
}

/**
 * Save a new mapping
 */
export function saveMapping(
  name: string,
  uploadType: "grootboek" | "boekingsregels",
  mapping: Record<string, string>
): SavedMapping {
  const mappings = getSavedMappings()
  const newMapping: SavedMapping = {
    id: `mapping-${Date.now()}`,
    name,
    uploadType,
    mapping,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
  }

  // Add to beginning and limit to MAX_SAVED_MAPPINGS
  const updated = [newMapping, ...mappings.filter((m) => m.id !== newMapping.id)].slice(
    0,
    MAX_SAVED_MAPPINGS
  )

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return newMapping
}

/**
 * Update last used timestamp for a mapping
 */
export function updateMappingLastUsed(mappingId: string): void {
  const mappings = getSavedMappings()
  const updated = mappings.map((m) =>
    m.id === mappingId ? { ...m, lastUsed: new Date().toISOString() } : m
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

/**
 * Delete a saved mapping
 */
export function deleteMapping(mappingId: string): void {
  const mappings = getSavedMappings()
  const updated = mappings.filter((m) => m.id !== mappingId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

/**
 * Get mappings for a specific upload type
 */
export function getMappingsForType(
  uploadType: "grootboek" | "boekingsregels"
): SavedMapping[] {
  return getSavedMappings()
    .filter((m) => m.uploadType === uploadType)
    .sort((a, b) => {
      // Sort by last used (most recent first), then by created date
      const aTime = new Date(a.lastUsed || a.createdAt).getTime()
      const bTime = new Date(b.lastUsed || b.createdAt).getTime()
      return bTime - aTime
    })
}

/**
 * Find best matching mapping for given Excel columns
 */
export function findBestMapping(
  excelColumns: string[],
  uploadType: "grootboek" | "boekingsregels"
): SavedMapping | null {
  const mappings = getMappingsForType(uploadType)

  if (mappings.length === 0) return null

  // Find mapping with highest column match rate
  let bestMatch: SavedMapping | null = null
  let bestScore = 0

  for (const mapping of mappings) {
    const mappingColumns = Object.keys(mapping.mapping)
    const matchedColumns = excelColumns.filter((col) => mappingColumns.includes(col))
    const score = matchedColumns.length / Math.max(excelColumns.length, mappingColumns.length)

    if (score > bestScore && score >= 0.5) {
      // At least 50% match required
      bestScore = score
      bestMatch = mapping
    }
  }

  return bestMatch
}

/**
 * Export mappings to JSON
 */
export function exportMappings(): string {
  return JSON.stringify(getSavedMappings(), null, 2)
}

/**
 * Import mappings from JSON
 */
export function importMappings(json: string): { success: boolean; error?: string } {
  try {
    const mappings = JSON.parse(json) as SavedMapping[]
    
    // Validate structure
    if (!Array.isArray(mappings)) {
      return { success: false, error: "Invalid format: expected array" }
    }

    for (const mapping of mappings) {
      if (!mapping.id || !mapping.name || !mapping.uploadType || !mapping.mapping) {
        return { success: false, error: "Invalid format: missing required fields" }
      }
    }

    // Merge with existing (avoid duplicates)
    const existing = getSavedMappings()
    const existingIds = new Set(existing.map((m) => m.id))
    const newMappings = mappings.filter((m) => !existingIds.has(m.id))

    const merged = [...existing, ...newMappings].slice(0, MAX_SAVED_MAPPINGS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to parse JSON" }
  }
}

