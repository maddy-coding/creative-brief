import type { BriefSection, BriefType, BusinessType, GeneratedBrief } from '../types'
import * as P from './pools'

const STORAGE_KEY = 'briefforge_used_ids'
const MAX_STORED = 8000

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pickMany<T>(arr: readonly T[], rng: () => number, n: number): T[] {
  const copy = [...arr]
  const out: T[] = []
  while (out.length < n && copy.length) {
    const i = Math.floor(rng() * copy.length)
    out.push(copy.splice(i, 1)[0]!)
  }
  return out
}

const BUSINESS_FLAVOR: Record<
  BusinessType,
  { industryLine: string; context: string }
> = {
  technology: {
    industryLine: 'technology product',
    context:
      'competitive SaaS and hardware landscape where differentiation is clarity, speed, and trust.',
  },
  fashion: {
    industryLine: 'fashion and apparel brand',
    context:
      'trend-forward retail and DTC channels where storytelling, fit confidence, and cultural relevance drive conversion.',
  },
  health: {
    industryLine: 'health and wellness company',
    context:
      'regulated-adjacent claims environment where credibility, empathy, and education must balance persuasion.',
  },
  sports: {
    industryLine: 'sports and fitness brand',
    context:
      'performance culture where motivation, metrics, and community belonging are non-negotiable.',
  },
  education: {
    industryLine: 'education organization',
    context:
      'learner motivation curves where clarity, progress visibility, and inclusive language reduce drop-off.',
  },
  hospitality: {
    industryLine: 'hospitality experience brand',
    context:
      'experience economy where anticipation, sensory cues, and service rituals define premium perception.',
  },
  food: {
    industryLine: 'food and beverage brand',
    context:
      'shelf and menu competition where appetite appeal, ingredient transparency, and ritual moments win.',
  },
}

function buildCombinationId(
  briefType: BriefType,
  businessType: BusinessType,
  indices: Record<string, number>,
): string {
  const sorted = Object.keys(indices)
    .sort()
    .map((k) => `${k}:${indices[k]}`)
    .join('|')
  return `${briefType}::${businessType}::${sorted}`
}

function loadUsed(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as string[]
    return new Set(arr)
  } catch {
    return new Set()
  }
}

function saveUsed(set: Set<string>) {
  const arr = [...set]
  const trimmed = arr.slice(-MAX_STORED)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
}

/** Estimated unique signatures from indexed pools (documented for stakeholders). */
export const ESTIMATED_COMBINATIONS =
  P.PREFIXES.length *
  P.SUFFIXES.length *
  P.POSITIONING.length *
  P.AUDIENCES.length *
  P.GOALS.length

export function generateUniqueBrief(
  briefType: BriefType,
  businessType: BusinessType,
): GeneratedBrief {
  const used = loadUsed()
  let attempt = 0
  let result: GeneratedBrief | null = null

  while (attempt < 200 && !result) {
    attempt++
    const seed =
      (Date.now() % 100000) * 9973 +
      attempt * 104729 +
      briefType.length * 131 +
      businessType.length * 17
    const rng = mulberry32(seed)

    const pi = Math.floor(rng() * P.PREFIXES.length)
    const si = Math.floor(rng() * P.SUFFIXES.length)
    const posi = Math.floor(rng() * P.POSITIONING.length)
    const audi = Math.floor(rng() * P.AUDIENCES.length)
    const goi = Math.floor(rng() * P.GOALS.length)
    const peri = Math.floor(rng() * P.PERSONALITIES.length)
    const styi = Math.floor(rng() * P.STYLES.length)
    const pali = Math.floor(rng() * P.PALETTES.length)
    const typi = Math.floor(rng() * P.TYPO.length)
    const compi = Math.floor(rng() * P.COMPETITORS.length)
    const tonei = Math.floor(rng() * P.TONES.length)
    const paini = Math.floor(rng() * P.PAINS.length)
    const conti = Math.floor(rng() * P.CONTENT_REQS.length)
    const dedi = Math.floor(rng() * P.DEADLINES.length)
    const chali = Math.floor(rng() * P.CHALLENGES.length)
    const coni = Math.floor(rng() * P.CONSTRAINTS.length)

    const indices: Record<string, number> = {
      pi,
      si,
      posi,
      audi,
      goi,
      peri,
      styi,
      pali,
      typi,
      compi,
      tonei,
      paini,
      conti,
      dedi,
      chali,
      coni,
    }

    const flavor = BUSINESS_FLAVOR[businessType]
    const name = `${P.PREFIXES[pi]} ${P.SUFFIXES[si]}`
    const tagline = `${P.POSITIONING[posi]} ${flavor.industryLine}`

    const deliverPool =
      briefType === 'app'
        ? P.DELIVERABLES_APP
        : briefType === 'website'
          ? P.DELIVERABLES_WEB
          : briefType === 'logo'
            ? P.DELIVERABLES_LOGO
            : briefType === 'branding'
              ? P.DELIVERABLES_BRAND
              : briefType === 'packaging'
                ? P.DELIVERABLES_PACK
                : P.DELIVERABLES_COPY

    const deliv = pickMany(deliverPool, rng, 3).join(' • ')

    let featuresTitle = 'Required features & product hooks'
    let featuresBlock = ''
    if (briefType === 'app') {
      const fi = Math.floor(rng() * P.FEATURES_APP.length)
      const f2 = Math.floor(rng() * P.FEATURES_APP.length)
      indices.fi = fi
      indices.f2 = f2
      featuresBlock = `${P.FEATURES_APP[fi]}; ${P.FEATURES_APP[f2]}`
    } else if (briefType === 'website') {
      const wi = Math.floor(rng() * P.FEATURES_WEB.length)
      const w2 = Math.floor(rng() * P.FEATURES_WEB.length)
      indices.wi = wi
      indices.w2 = w2
      featuresBlock = `${P.FEATURES_WEB[wi]}; ${P.FEATURES_WEB[w2]}`
    } else if (briefType === 'logo') {
      featuresTitle = 'Logo applications & proof cases'
      const li = Math.floor(rng() * P.LOGO_APPLICATIONS.length)
      indices.li = li
      featuresBlock = P.LOGO_APPLICATIONS[li]
    } else if (briefType === 'branding') {
      featuresTitle = 'Brand system touchpoints'
      const bi = Math.floor(rng() * P.BRAND_APPLICATIONS.length)
      indices.bi = bi
      featuresBlock = P.BRAND_APPLICATIONS[bi]
    } else if (briefType === 'packaging') {
      featuresTitle = 'Production, compliance, and craft hooks'
      const pi2 = Math.floor(rng() * P.PACK_PRODUCTION.length)
      indices.pi2 = pi2
      featuresBlock = P.PACK_PRODUCTION[pi2]
    } else {
      featuresTitle = 'Omnichannel copy surfaces'
      const ci2 = Math.floor(rng() * P.COPY_CHANNELS.length)
      indices.ci2 = ci2
      featuresBlock = P.COPY_CHANNELS[ci2]
    }

    const sections: BriefSection[] = [
      {
        id: 'overview',
        title: 'Business overview',
        body: `${name} is a ${flavor.industryLine} operating in a ${flavor.context} The brand is positioned as a ${P.POSITIONING[posi]} and needs a ${briefType === 'copywriting' ? 'campaign and messaging system' : 'design system and narrative'} that feels inevitable for its category.`,
      },
      {
        id: 'audience',
        title: 'Target audience',
        body: `Primary audience: ${P.AUDIENCES[audi]}. They compare alternatives quickly, skim first, and reward brands that reduce cognitive load while still feeling emotionally resonant.`,
      },
      {
        id: 'goals',
        title: 'Project goals',
        body: `North-star outcome: ${P.GOALS[goi]}. Success looks like measurable lift in comprehension, conversion, or retention — plus a portfolio-worthy craft story.`,
      },
      {
        id: 'personality',
        title: 'Brand personality',
        body: `Voice and vibe skew ${P.PERSONALITIES[peri]}, expressed consistently across touchpoints so the brand feels like a person, not a committee.`,
      },
      {
        id: 'style',
        title: 'Design style direction',
        body: `Explore ${P.STYLES[styi]} while staying anchored to the business realities of ${BUSINESS_FLAVOR[businessType].industryLine}.`,
      },
      {
        id: 'color',
        title: 'Color inspiration',
        body: `Start from ${P.PALETTES[pali]}. Provide rationale for contrast, accessibility, and cultural associations in your primary markets.`,
      },
      {
        id: 'type',
        title: 'Typography suggestions',
        body: `${P.TYPO[typi]}. Specify pairing rules, tracking defaults for headlines, and numeric alignment for pricing or stats.`,
      },
      {
        id: 'competitors',
        title: 'Competitor references (inspiration, not imitation)',
        body: `Benchmark against qualities like: ${P.COMPETITORS[compi]}. Your job is differentiated parity: match baseline expectations, then exceed with one signature move.`,
      },
      {
        id: 'deliverables',
        title: 'Deliverables',
        body: deliv,
      },
      {
        id: 'tone',
        title: 'Tone of voice',
        body: `${P.TONES[tonei]} Keep messaging aligned with the brand personality and channel norms.`,
      },
      {
        id: 'pains',
        title: 'User pain points',
        body: `Key friction: ${P.PAINS[paini]} Design should directly confront this with layout, hierarchy, and narrative sequencing.`,
      },
      {
        id: 'features',
        title: featuresTitle,
        body: featuresBlock,
      },
      {
        id: 'content',
        title: 'Content requirements',
        body: `${P.CONTENT_REQS[conti]} Ensure all copy placeholders map to a realistic production plan.`,
      },
      {
        id: 'deadline',
        title: 'Timeline',
        body: `${P.DEADLINES[dedi]} Client expects weekly async check-ins and a single consolidated feedback doc per round.`,
      },
      {
        id: 'challenge',
        title: 'Optional creative challenge',
        body: `${P.CHALLENGES[chali]} Treat this as a stretch layer — only pursue if it strengthens the core idea.`,
      },
      {
        id: 'constraints',
        title: 'Creative constraints',
        body: `${P.CONSTRAINTS[coni]} Document tradeoffs explicitly in your presentation.`,
      },
    ]

    if (briefType === 'app' || briefType === 'website') {
      const uxi = Math.floor(rng() * P.UX_GOALS.length)
      const sci = Math.floor(rng() * P.SCREENS.length)
      const fli = Math.floor(rng() * P.FLOWS.length)
      indices.uxi = uxi
      indices.sci = sci
      indices.fli = fli
      sections.splice(11, 0, {
        id: 'ux',
        title: 'UX goals',
        body: `${P.UX_GOALS[uxi]} Prioritize clarity over novelty in primary paths.`,
      })
      sections.splice(12, 0, {
        id: 'screens',
        title: 'Screen requirements',
        body: `Cover at minimum: ${P.SCREENS[sci]} Include annotated states for empty, loading, and recoverable errors.`,
      })
      sections.splice(13, 0, {
        id: 'flows',
        title: 'User flows',
        body: `Map end-to-end narratives: ${P.FLOWS[fli]} Add a simple decision tree for edge cases.`,
      })
    }

    if (briefType === 'logo' || briefType === 'branding') {
      const bvi = Math.floor(rng() * P.BRAND_VALUES.length)
      const vii = Math.floor(rng() * P.VISUAL_IDENTITY.length)
      const emi = Math.floor(rng() * P.EMOTIONAL_TONE.length)
      indices.bvi = bvi
      indices.vii = vii
      indices.emi = emi
      sections.splice(5, 0, {
        id: 'values',
        title: 'Brand values',
        body: `Anchor decisions to: ${P.BRAND_VALUES[bvi]} Show how values translate into visual and verbal choices.`,
      })
      sections.splice(6, 0, {
        id: 'visual-id',
        title: 'Visual identity direction',
        body: `${P.VISUAL_IDENTITY[vii]} Provide examples of “on-brand” vs “off-brand” decisions.`,
      })
      sections.splice(7, 0, {
        id: 'emotion',
        title: 'Emotional tone',
        body: `The brand should ${P.EMOTIONAL_TONE[emi]}`,
      })
    }

    if (briefType === 'packaging') {
      const pti = Math.floor(rng() * P.PACKAGING_TYPES.length)
      const shi = Math.floor(rng() * P.SHELF_GOALS.length)
      const mai = Math.floor(rng() * P.MATERIALS.length)
      const sui = Math.floor(rng() * P.SUSTAINABILITY.length)
      indices.pti = pti
      indices.shi = shi
      indices.mai = mai
      indices.sui = sui
      sections.splice(5, 0, {
        id: 'pack-type',
        title: 'Packaging type',
        body: `Primary structure: ${P.PACKAGING_TYPES[pti]} Consider unboxing sequence and first 3 seconds of tactile impression.`,
      })
      sections.splice(6, 0, {
        id: 'shelf',
        title: 'Shelf presence goals',
        body: `${P.SHELF_GOALS[shi]} Include aisle simulation renders if possible.`,
      })
      sections.splice(7, 0, {
        id: 'materials',
        title: 'Material inspiration',
        body: `${P.MATERIALS[mai]} Tie finishes to perceived quality and manufacturing feasibility.`,
      })
      sections.splice(8, 0, {
        id: 'sustainability',
        title: 'Sustainability notes',
        body: `${P.SUSTAINABILITY[sui]} Avoid greenwashing: prefer honest constraints over vague claims.`,
      })
    }

    if (briefType === 'copywriting') {
      const mi = Math.floor(rng() * P.MESSAGING.length)
      const ci = Math.floor(rng() * P.CAMPAIGN_OBJ.length)
      const cti = Math.floor(rng() * P.CTA_TONES.length)
      const api = Math.floor(rng() * P.AUDIENCE_PSYCH.length)
      indices.mi = mi
      indices.ci = ci
      indices.cti = cti
      indices.api = api
      sections.splice(4, 0, {
        id: 'messaging',
        title: 'Brand messaging architecture',
        body: `${P.MESSAGING[mi]} Provide a headline ladder: hook, proof, promise, and CTA.`,
      })
      sections.splice(5, 0, {
        id: 'campaign',
        title: 'Campaign objectives',
        body: `${P.CAMPAIGN_OBJ[ci]} Align channel executions while keeping one central narrative spine.`,
      })
      sections.splice(6, 0, {
        id: 'cta',
        title: 'CTA tone',
        body: `${P.CTA_TONES[cti]} Write 5 CTA variants with rationale for testing.`,
      })
      sections.splice(7, 0, {
        id: 'psychology',
        title: 'Audience psychology',
        body: `${P.AUDIENCE_PSYCH[api]} Translate psychology into concrete copy patterns (not manipulative dark patterns).`,
      })
    }

    const combinationId = buildCombinationId(briefType, businessType, indices)
    if (used.has(combinationId)) continue

    used.add(combinationId)
    saveUsed(used)

    result = {
      combinationId,
      briefType,
      businessType,
      projectName: name,
      tagline,
      generatedAt: new Date().toISOString(),
      sections,
    }
  }

  if (!result) {
    localStorage.removeItem(STORAGE_KEY)
    return generateUniqueBrief(briefType, businessType)
  }

  return result
}
