import type { Request, Response } from 'express'
import { resolveOwners, searchOwners } from '../services/owners.service.js'

/**
 * Owner-picker candidates: searches users and persons by substring, or
 * resolves a specific set of ids ("?ids=user:1,person:2") for the edit form.
 */
export async function ownerCandidatesHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const ids = typeof req.query.ids === 'string' ? req.query.ids : undefined
  if (ids) {
    res.json(await resolveOwners(ids))
    return
  }
  const search = typeof req.query.search === 'string' ? req.query.search : ''
  res.json(await searchOwners(search))
}