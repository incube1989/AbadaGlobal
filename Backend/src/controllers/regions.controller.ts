import type { Request, Response } from 'express'
import type { RegionInput } from '../models/region.js'
import {
  createRegion,
  deleteRegion,
  getRegion,
  listRegions,
  updateRegion,
} from '../services/regions.service.js'

function parseId(raw: string | string[]): number | null {
  const id = Number(raw)
  return Number.isInteger(id) && id >= 1 ? id : null
}

function parseInput(body: unknown): RegionInput | null {
  if (typeof body !== 'object' || body === null) {
    return null
  }
  const b = body as Record<string, unknown>
  const { name, countryId } = b
  if (typeof name !== 'string' || !name.trim()) {
    return null
  }
  const cid = Number(countryId)
  if (!Number.isInteger(cid) || cid < 1) {
    return null
  }
  return { name: name.trim(), countryId: cid }
}

export async function listRegionsHandler(req: Request, res: Response): Promise<void> {
  const countryId =
    req.query.countryId !== undefined ? Number(req.query.countryId) : undefined
  const search = typeof req.query.search === 'string' ? req.query.search : undefined
  res.json(await listRegions(countryId, search))
}

export async function getRegionHandler(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id)
  if (id === null) {
    res.status(400).json({ error: 'Region id must be a positive integer' })
    return
  }
  const region = await getRegion(id)
  if (!region) {
    res.status(404).json({ error: 'Region not found' })
    return
  }
  res.json(region)
}

export async function createRegionHandler(req: Request, res: Response): Promise<void> {
  const input = parseInput(req.body)
  if (!input) {
    res.status(400).json({ error: 'Region name and countryId are required' })
    return
  }
  res.status(201).json(await createRegion(input))
}

export async function updateRegionHandler(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id)
  if (id === null) {
    res.status(400).json({ error: 'Region id must be a positive integer' })
    return
  }
  const input = parseInput(req.body)
  if (!input) {
    res.status(400).json({ error: 'Region name and countryId are required' })
    return
  }
  const region = await updateRegion(id, input)
  if (!region) {
    res.status(404).json({ error: 'Region not found' })
    return
  }
  res.json(region)
}

export async function deleteRegionHandler(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id)
  if (id === null) {
    res.status(400).json({ error: 'Region id must be a positive integer' })
    return
  }
  const deleted = await deleteRegion(id)
  if (!deleted) {
    res.status(404).json({ error: 'Region not found' })
    return
  }
  res.status(204).end()
}