import type { Request, Response } from 'express'
import type { CountryInput } from '../models/country.js'
import {
  createCountry,
  deleteCountry,
  getCountry,
  listCountries,
  updateCountry,
} from '../services/countries.service.js'

function parseId(raw: string | string[]): number | null {
  const id = Number(raw)
  return Number.isInteger(id) && id >= 1 ? id : null
}

function parseInput(body: unknown): CountryInput | null {
  if (typeof body !== 'object' || body === null) {
    return null
  }
  const name = (body as Record<string, unknown>).name
  if (typeof name !== 'string' || !name.trim()) {
    return null
  }
  return { name: name.trim() }
}

export async function listCountriesHandler(req: Request, res: Response): Promise<void> {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined
  res.json(await listCountries(search))
}

export async function getCountryHandler(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id)
  if (id === null) {
    res.status(400).json({ error: 'Country id must be a positive integer' })
    return
  }
  const country = await getCountry(id)
  if (!country) {
    res.status(404).json({ error: 'Country not found' })
    return
  }
  res.json(country)
}

export async function createCountryHandler(req: Request, res: Response): Promise<void> {
  const input = parseInput(req.body)
  if (!input) {
    res.status(400).json({ error: 'Country name is required' })
    return
  }
  res.status(201).json(await createCountry(input))
}

export async function updateCountryHandler(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id)
  if (id === null) {
    res.status(400).json({ error: 'Country id must be a positive integer' })
    return
  }
  const input = parseInput(req.body)
  if (!input) {
    res.status(400).json({ error: 'Country name is required' })
    return
  }
  const country = await updateCountry(id, input)
  if (!country) {
    res.status(404).json({ error: 'Country not found' })
    return
  }
  res.json(country)
}

export async function deleteCountryHandler(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id)
  if (id === null) {
    res.status(400).json({ error: 'Country id must be a positive integer' })
    return
  }
  const deleted = await deleteCountry(id)
  if (!deleted) {
    res.status(404).json({ error: 'Country not found' })
    return
  }
  res.status(204).end()
}