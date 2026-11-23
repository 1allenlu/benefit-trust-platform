/**
 * Bundled fictional offer and its versioned benefits packet. Everything here is demo data.
 * Cards, scripted answers and generated tasks all read from this one fixture so they can't drift apart.
 */

export type PacketSectionId =
  | 'health-enrollment'
  | 'health-effective'
  | 'paid-time-off'
  | 'pto-eligibility'
  | 'retirement-enrollment'
  | 'employer-match'

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
  /** A second clause for the same category. */
  more: { text: string; sectionId: PacketSectionId }
  /** What the packet does not say, shown as an unknown. */
  unknowns: string[]
}

export type OfferQuestion = {
  id: string
  label: string
  /** Shown as a chip. Others are reachable by typing. */
  chip: boolean
  /** Free-text match: every group needs one of its words. Order in the list decides ties. */
  match: string[][]
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
  /** Starting value for the 401(k) calculator; the user edits it. */
  baseSalary: 85000,
}

/** §4.2 as data: 100% of contributions up to 3% of eligible pay. Checked against the clause text in offer.check.ts. */
export const offerMatchTiers = [{ upTo: 3, rate: 1 }]

export const packetSections: PacketSection[] = [
  {
    id: 'health-enrollment',
    number: '2.1',
    title: 'Health Enrollment',
    text: 'New hires must elect health coverage within 30 calendar days after their start date.',
  },
  {
    id: 'health-effective',
    number: '2.2',
    title: 'Coverage Effective Date',
    text: 'Health coverage begins on the first day of the month following the start date.',
  },
  {
    id: 'paid-time-off',
    number: '3.1',
    title: 'Paid Time Off',
    text: 'Full-time new hires receive 15 paid days off annually.',
  },
  {
    id: 'pto-eligibility',
    number: '3.2',
    title: 'Using Paid Time Off',
    text: 'New hires may begin using paid time off after 90 calendar days of employment.',
  },
  {
    id: 'retirement-enrollment',
    number: '4.1',
    title: '401(k) Enrollment',
    text: 'Employees may enroll in the 401(k) plan at any time. Contributions begin with the first paycheck after enrollment.',
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
    more: { text: 'Coverage starts the 1st of the month after you start.', sectionId: 'health-effective' },
    unknowns: ['Provider network', 'Premium amounts'],
  },
  {
    category: 'Paid time off',
    term: '15 paid days off a year for full-time new hires.',
    sectionId: 'paid-time-off',
    more: { text: 'Usable after 90 calendar days.', sectionId: 'pto-eligibility' },
    unknowns: ['Accrual schedule', 'Carryover'],
  },
  {
    category: '401(k)',
    term: 'Harbor matches 100% of what you put in, up to 3% of eligible pay.',
    sectionId: 'employer-match',
    more: { text: 'Enroll any time; contributions start the next paycheck.', sectionId: 'retirement-enrollment' },
    unknowns: ['Vesting schedule'],
  },
]

/** Chip order is the recording order. Specific questions sit before broader ones in the same category. */
export const offerQuestions: OfferQuestion[] = [
  {
    id: 'health_deadline',
    label: 'When do I need to enroll in health coverage?',
    chip: true,
    match: [['enroll', 'elect', 'sign up', 'deadline'], ['health', 'medical', 'coverage', 'insurance']],
    answer: 'You have 30 calendar days after your start date to elect health coverage.',
    sectionId: 'health-enrollment',
  },
  {
    id: 'provider_network',
    label: 'Is my doctor in network?',
    chip: true,
    match: [['doctor', 'network', 'provider', 'physician', 'dentist']],
    answer: "This offer packet doesn't include provider network details. You can save this question to ask HR.",
  },
  {
    id: 'coverage_start',
    label: 'When does my health coverage start?',
    chip: false,
    match: [['health', 'medical', 'coverage', 'insurance'], ['start', 'begin', 'effective', 'kick in']],
    answer: 'Health coverage begins on the first day of the month after your start date.',
    sectionId: 'health-effective',
  },
  {
    id: 'pto_usable',
    label: 'When can I start using PTO?',
    chip: false,
    match: [['pto', 'vacation', 'time off', 'days off'], ['when', 'start', 'begin', 'use', 'eligible']],
    answer: 'You can begin using paid time off after 90 calendar days of employment.',
    sectionId: 'pto-eligibility',
  },
  {
    id: 'pto_days',
    label: 'How much PTO do I get?',
    chip: true,
    match: [['pto', 'vacation', 'time off', 'days off']],
    answer: 'Full-time new hires receive 15 paid days off annually.',
    sectionId: 'paid-time-off',
  },
  {
    id: 'retirement_enroll',
    label: 'When can I join the 401(k)?',
    chip: false,
    match: [['401', 'retirement'], ['enroll', 'join', 'sign up', 'eligible', 'when']],
    answer: 'You can enroll in the 401(k) at any time. Contributions begin with the first paycheck after you enroll.',
    sectionId: 'retirement-enrollment',
  },
  {
    id: 'retirement_match',
    label: 'How does the 401(k) match work?',
    chip: true,
    match: [['401', 'match', 'retirement']],
    answer: 'The employer matches 100% of employee contributions up to 3% of eligible pay.',
    sectionId: 'employer-match',
  },
]

export type PlanRule = {
  id: string
  /** A task you act on, or a date a benefit becomes usable. */
  kind: 'task' | 'available'
  title: string
  why: string
  sectionId: PacketSectionId
  /** How the date follows from the start date; null when the plan sets no date. */
  when: { daysAfterStart: number } | { firstOfMonthAfterStart: true } | null
  /** Shown instead of a date when `when` is null. */
  undatedLabel?: string
}

/** Plan rules that become dated tasks and milestones once a start date is known. */
export const planRules: PlanRule[] = [
  {
    id: 'elect-health-coverage',
    kind: 'task',
    title: 'Elect health coverage',
    why: 'The plan gives new hires 30 calendar days after their start date.',
    sectionId: 'health-enrollment',
    when: { daysAfterStart: 30 },
  },
  {
    id: 'enroll-401k',
    kind: 'task',
    title: 'Enroll in the 401(k)',
    why: 'No deadline, but the match only applies to paychecks after you enroll.',
    sectionId: 'retirement-enrollment',
    when: null,
    undatedLabel: 'Any time',
  },
  {
    id: 'health-coverage-starts',
    kind: 'available',
    title: 'Health coverage starts',
    why: 'Coverage begins the first day of the month after you start.',
    sectionId: 'health-effective',
    when: { firstOfMonthAfterStart: true },
  },
  {
    id: 'pto-usable',
    kind: 'available',
    title: 'PTO becomes usable',
    why: 'New hires can use paid time off after 90 calendar days.',
    sectionId: 'pto-eligibility',
    when: { daysAfterStart: 90 },
  },
]

export const sectionById = (id: PacketSectionId) => packetSections.find((s) => s.id === id)!
