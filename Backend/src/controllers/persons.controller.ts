import type { Request, Response } from 'express'
import type { PersonInput } from '../models/person.js'
import {
  createPerson,
  deletePerson,
  getPerson,
  listPersons,
  updatePerson,
} from '../services/persons.service.js'

function parseId(raw: string | string[]): number | null {
  const id = Number(raw)
  return Number.isInteger(id) && id >= 1 ? id : null
}

function parseInput(body: unknown): PersonInput | null {
  if (typeof body !== 'object' || body === null) {
    return null
  }
  const b = body as Record<string, unknown>
  const { nickname, countryId } = b
  if (typeof nickname !== 'string' || !nickname.trim()) {
    return null
  }
  const cid = Number(countryId)
  if (!Number.isInteger(cid) || cid < 1) {
    return null
  }
  let userId: number | null = null
  if (b.userId !== undefined && b.userId !== null) {
    const uid = Number(b.userId)
    if (!Number.isInteger(uid) || uid < 1) {
      return null
    }
    userId = uid
  }
  return { nickname: nickname.trim(), countryId: cid, userId }
}

export async function listPersonsHandler(req: Request, res: Response): Promise<void> {
  const countryId =
    req.query.countryId !== undefined ? Number(req.query.countryId) : undefined
  const search = typeof req.query.search === 'string' ? req.query.search : undefined
  res.json(await listPersons(countryId, search))
}

export async function getPersonHandler(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id)
  if (id === null) {
    res.status(400).json({ error: 'Person id must be a positive integer' })
    return
  }
  const person = await getPerson(id)
  if (!person) {
    res.status(404).json({ error: 'Person not found' })
    return
  }
  res.json(person)
}

export async function createPersonHandler(req: Request, res: Response): Promise<void> {
  const input = parseInput(req.body)
  if (!input) {
    res.status(400).json({ error: 'Person nickname and countryId are required' })
    return
  }
  res.status(201).json(await createPerson(input))
}

export async function updatePersonHandler(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id)
  if (id === null) {
    res.status(400).json({ error: 'Person id must be a positive integer' })
    return
  }
  const input = parseInput(req.body)
  if (!input) {
    res.status(400).json({ error: 'Person nickname and countryId are required' })
    return
  }
  const person = await updatePerson(id, input)
  if (!person) {
    res.status(404).json({ error: 'Person not found' })
    return
  }
  res.json(person)
}

export async function deletePersonHandler(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id)
  if (id === null) {
    res.status(400).json({ error: 'Person id must be a positive integer' })
    return
  }
  const deleted = await deletePerson(id)
  if (!deleted) {
    res.status(404).json({ error: 'Person not found' })
    return
  }
  res.status(204).end()
}