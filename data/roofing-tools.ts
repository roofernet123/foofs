// data/roofing-tools.ts

import {
  Calculator,
  ChartNoAxesColumnIncreasing,
  House,
  Layers3,
  type LucideIcon,
} from 'lucide-react'

export type RoofingTool = {
  slug: string
  title: string
  shortTitle: string
  description: string
  icon: LucideIcon
  featured: boolean
}

export const roofingTools: RoofingTool[] = [
  {
    slug:
      'roof-replacement-cost-calculator',

    title:
      'Roof Replacement Cost Calculator',

    shortTitle:
      'Roof Cost Calculator',

    description:
      'Estimate roof area, roofing squares and a likely roof replacement cost range based on home size, roof pitch and roofing material.',

    icon: Calculator,

    featured: true,
  },

  {
    slug:
      'roof-area-calculator',

    title:
      'Roof Area Calculator',

    shortTitle:
      'Roof Area Calculator',

    description:
      'Estimate roof surface area from the building footprint, roof pitch and eave overhang.',

    icon: House,

    featured: false,
  },

  {
    slug:
      'roof-shingle-calculator',

    title:
      'Roof Shingle Calculator',

    shortTitle:
      'Shingle Calculator',

    description:
      'Estimate roofing squares and the number of shingle bundles needed for a roofing project.',

    icon: Layers3,

    featured: false,
  },

  {
    slug:
      'roof-pitch-calculator',

    title:
      'Roof Pitch Calculator',

    shortTitle:
      'Pitch Calculator',

    description:
      'Convert roof rise and run into pitch, angle and roof-area correction factor.',

    icon:
      ChartNoAxesColumnIncreasing,

    featured: false,
  },
]