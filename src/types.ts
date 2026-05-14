export type BriefType =
  | 'app'
  | 'website'
  | 'logo'
  | 'branding'
  | 'packaging'
  | 'copywriting'

export type BusinessType =
  | 'technology'
  | 'fashion'
  | 'health'
  | 'sports'
  | 'education'
  | 'hospitality'
  | 'food'

export interface BriefSection {
  id: string
  title: string
  body: string
}

export interface GeneratedBrief {
  combinationId: string
  briefType: BriefType
  businessType: BusinessType
  projectName: string
  tagline: string
  generatedAt: string
  sections: BriefSection[]
}

export const BRIEF_TYPES: {
  id: BriefType
  label: string
  description: string
  icon: string
}[] = [
  {
    id: 'app',
    label: 'App Design',
    description: 'Mobile flows, UI systems, and product UX.',
    icon: '📱',
  },
  {
    id: 'website',
    label: 'Website Design',
    description: 'Marketing sites, dashboards, and landing pages.',
    icon: '🌐',
  },
  {
    id: 'logo',
    label: 'Logo Design',
    description: 'Marks, monograms, and iconic symbols.',
    icon: '✦',
  },
  {
    id: 'branding',
    label: 'Branding',
    description: 'Identity systems, voice, and visual worlds.',
    icon: '◈',
  },
  {
    id: 'packaging',
    label: 'Packaging',
    description: 'Structural design, shelf story, and tactility.',
    icon: '📦',
  },
  {
    id: 'copywriting',
    label: 'Copywriting',
    description: 'Campaign lines, UX microcopy, and narrative.',
    icon: '✎',
  },
]

export const BUSINESS_TYPES: {
  id: BusinessType
  label: string
  description: string
}[] = [
  {
    id: 'technology',
    label: 'Technology',
    description: 'SaaS, hardware, AI, and developer tools.',
  },
  {
    id: 'fashion',
    label: 'Fashion & Apparel',
    description: 'Streetwear, luxury, accessories, and DTC.',
  },
  {
    id: 'health',
    label: 'Health & Wellness',
    description: 'Clinics, supplements, mental health, longevity.',
  },
  {
    id: 'sports',
    label: 'Sports & Fitness',
    description: 'Athletics, gyms, outdoor, and performance gear.',
  },
  {
    id: 'education',
    label: 'Education',
    description: 'Courses, bootcamps, kids learning, and edtech.',
  },
  {
    id: 'hospitality',
    label: 'Hospitality',
    description: 'Hotels, travel, experiences, and nightlife.',
  },
  {
    id: 'food',
    label: 'Food & Beverage',
    description: 'CPG, restaurants, specialty drinks, and meal kits.',
  },
]
