import {
  communityPage,
  myBenefits,
  type ActionItem,
  type CommunityPost,
  type CompareScope,
} from '../../data/mock'
import { sampleOffer } from '../../data/offer'
import type { OfferState } from '../../lib/offer'
import type { PacketSectionId } from '../../data/offer'

export type OfferCorrection = {
  id: string
  sectionId: PacketSectionId
  proposed: string
  source: string
  status: 'pending' | 'accepted' | 'rejected'
  submittedAt: string
}

/**
 * Mutable state behind the mock API: what a backend database would hold.
 * Persisted to localStorage so a demo survives reloads; `resetMockDb` restores the seed.
 */
export type MockDb = {
  posts: CommunityPost[]
  followingIds: string[]
  helpfulPostIds: string[]
  actionPlan: ActionItem[]
  savedComparison: { companyIds: string[]; scope: CompareScope; savedAt: string } | null
  /** Fields the current user has submitted (counts toward "You" on the leaderboard). */
  contributedFields: number
  /** Employer decisions resolved, with what was chosen. */
  resolvedDecisions: Record<string, string>
  /** The single sample offer's progress from review to onboarding. */
  offer: OfferState
  /** Field-level corrections to the offer packet, waiting for review. */
  offerCorrections: OfferCorrection[]
}

const KEY = 'vested.mock.db.v1'

function seed(): MockDb {
  return structuredClone({
    posts: communityPage.posts,
    followingIds: communityPage.followingIds,
    helpfulPostIds: [],
    actionPlan: myBenefits.actionPlan,
    savedComparison: null,
    contributedFields: 12,
    resolvedDecisions: {},
    offer: {
      offerId: sampleOffer.id,
      planVersion: sampleOffer.planVersion,
      status: 'prospective',
      startDate: null,
      savedQuestionIds: [],
      customQuestions: [],
      doneTaskIds: [],
      contributionPercent: null,
    },
    offerCorrections: [],
  })
}

let db: MockDb | null = null

export function getDb(): MockDb {
  if (db) return db
  try {
    const stored = localStorage.getItem(KEY)
    const base = seed()
    const saved = stored ? JSON.parse(stored) : {}
    // Nested merge so state saved by an older build picks up new offer fields.
    db = { ...base, ...saved, offer: { ...base.offer, ...saved.offer } }
  } catch {
    db = seed()
  }
  return db!
}

/** Apply a change and persist it. */
export function updateDb<T>(change: (db: MockDb) => T): T {
  const current = getDb()
  const result = change(current)
  try {
    localStorage.setItem(KEY, JSON.stringify(current))
  } catch {
    // in-memory only
  }
  return result
}

export function resetMockDb() {
  db = seed()
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

let counter = 0
export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`
