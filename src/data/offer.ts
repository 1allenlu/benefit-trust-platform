/**
 * Bundled fictional offer and its versioned benefits packet. Everything here is demo data.
 * Cards, scripted answers and generated tasks all read from this one fixture so they can't drift apart.
 */

export type PacketSectionId = 'health-enrollment' | 'paid-time-off' | 'employer-match'

export type PacketSection = {
  id: PacketSectionId
  number: string
  title: string
  text: string
}

export type BenefitCard = {
  category: 'Health' | 'Paid time off' | '401(k)'
  term: string
  sectionId: PacketSectionId
  /** What the packet does not say, shown as an unknown. */
  unknowns: string[]
}

export type OfferQuestion = {
  id: 'health_deadline' | 'provider_network' | 'pto_days' | 'retirement_match'
  label: string
  answer: string
  /** Supported questions jump to their clause; unsupported ones offer to save for HR. */
  sectionId?: PacketSectionId
}

export const sampleOffer = {
  id: 'harbor-2026-offer',
  companyId: 'harbor',
  employer: 'Harbor Systems',
  role: 'Associate Product Manager',
  planYear: 2026,
  planVersion: '2026.1',
  packetTitle: 'Harbor Systems 2026 New Hire Benefits Packet',
  label: 'Fictional demo data',
}

export const packetSections: PacketSection[] = [
  {
    id: 'health-enrollment',
    number: '2.1',
    title: 'Health Enrollment',
    text: 'New hires must elect health coverage within 30 calendar days after their start date.',
  },
  {
    id: 'paid-time-off',
    number: '3.1',
    title: 'Paid Time Off',
    text: 'Full-time new hires receive 15 paid days off annually.',
  },
  {
    id: 'employer-match',
    number: '4.2',
    title: 'Employer Match',
    text: 'The employer matches 100% of employee contributions up to 3% of eligible pay.',
  },
]

export const benefitCards: BenefitCard[] = [
  {
    category: 'Health',
    term: 'Elect coverage within 30 calendar days after you start.',
    sectionId: 'health-enrollment',
    unknowns: ['Provider network', 'Premium amounts'],
  },
  {
    category: 'Paid time off',
    term: '15 paid days off a year for full-time new hires.',
    sectionId: 'paid-time-off',
    unknowns: ['Accrual schedule', 'Carryover'],
  },
  {
    category: '401(k)',
    term: 'Harbor matches 100% of what you put in, up to 3% of eligible pay.',
    sectionId: 'employer-match',
    unknowns: ['Vesting schedule'],
  },
]

/** Chip order is the recording order. */
export const offerQuestions: OfferQuestion[] = [
  {
    id: 'health_deadline',
    label: 'When do I need to enroll in health coverage?',
    answer: 'You have 30 calendar days after your start date to elect health coverage.',
    sectionId: 'health-enrollment',
  },
  {
    id: 'provider_network',
    label: 'Is my doctor in network?',
    answer: "This offer packet doesn't include provider network details. You can save this question to ask HR.",
  },
  {
    id: 'pto_days',
    label: 'How much PTO do I get?',
    answer: 'Full-time new hires receive 15 paid days off annually.',
    sectionId: 'paid-time-off',
  },
  {
    id: 'retirement_match',
    label: 'How does the 401(k) match work?',
    answer: 'The employer matches 100% of employee contributions up to 3% of eligible pay.',
    sectionId: 'employer-match',
  },
]

/** Plan rules that become dated tasks once a start date is known. */
export const planRules = [
  {
    taskId: 'elect-health-coverage',
    title: 'Elect health coverage',
    daysAfterStart: 30,
    sectionId: 'health-enrollment' as PacketSectionId,
    why: 'The plan gives new hires 30 calendar days after their start date.',
  },
]

export const sectionById = (id: PacketSectionId) => packetSections.find((s) => s.id === id)!
