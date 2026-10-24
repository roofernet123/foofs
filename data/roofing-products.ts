export type RoofingCategory = {
  slug: string;
  name: string;
  emoji: string;
  description: string;
};

export const roofingCategories: RoofingCategory[] = [
  {
    slug: "roofing-tools",
    name: "Roofing Tools",
    emoji: "🔨",
    description:
      "Hand tools and equipment commonly used for roofing maintenance, inspection and repair work.",
  },
  {
    slug: "roof-inspection-tools",
    name: "Roof Inspection Tools",
    emoji: "🔍",
    description:
      "Inspection and measuring tools for identifying potential roof and attic maintenance issues.",
  },
  {
    slug: "roof-repair",
    name: "Roof Repair Supplies",
    emoji: "🛠️",
    description:
      "Products and supplies commonly used for minor roof maintenance and repair projects.",
  },
  {
    slug: "roof-sealants",
    name: "Roof Sealants & Caulk",
    emoji: "🧰",
    description:
      "Roofing sealants, caulks and related products for appropriate maintenance applications.",
  },
  {
    slug: "gutter-tools",
    name: "Gutter Tools",
    emoji: "🏠",
    description:
      "Tools and accessories for gutter maintenance, cleaning and inspection.",
  },
  {
    slug: "roof-cleaning",
    name: "Roof Cleaning",
    emoji: "🧹",
    description:
      "Tools and products for appropriate roof and exterior cleaning tasks.",
  },
  {
    slug: "measuring-tools",
    name: "Measuring Tools",
    emoji: "📏",
    description:
      "Tape measures, levels and other tools useful for roofing and construction measurements.",
  },
  {
    slug: "attic-ventilation",
    name: "Attic & Roof Ventilation",
    emoji: "💨",
    description:
      "Ventilation products and accessories used to improve airflow in suitable attic and roof systems.",
  },
  {
    slug: "roofing-safety",
    name: "Roofing Safety Equipment",
    emoji: "🦺",
    description:
      "Safety equipment and protective gear used by qualified professionals for roofing work.",
  },
];

export type AmazonLinks = {
  US?: string;
  AU?: string;
};

export type RoofingProduct = {
  id: number;
  slug: string;
  title: string;
  category: string;
  image: string;
  description: string;
  amazon: AmazonLinks;
  features: string[];
  searchKeywords?: string[];
};

export const roofingProducts: RoofingProduct[] = [
  {
    id: 1,
    slug: "roofing-tool",
    title: "Professional Roofing Tool",
    category: "roofing-tools",
    image: "https://m.media-amazon.com/images/I/71WYu9al+FL._AC_UL320_.jpg",
    description:
      "A general-purpose roofing tool suitable for appropriate maintenance and repair applications.",
    amazon: {
      US: "https://amzn.to/4qi5QgQ",
    },
    features: [
      "Durable construction",
      "Designed for roofing applications",
      "Suitable for maintenance work",
    ],
    searchKeywords: [
      "roofing tools",
      "roofing hand tools",
      "roofer tools",
    ],
  },

  {
    id: 2,
    slug: "roof-inspection-tool",
    title: "Roof Inspection Tool",
    category: "roof-inspection-tools",
    image: "https://m.media-amazon.com/images/I/716OSMONYAL._AC_UL320_.jpg",
    description:
      "A useful inspection tool for examining accessible areas and identifying potential maintenance concerns.",
    amazon: {
      US: "https://amzn.to/4wxTv9Y",
    },
    features: [
      "Portable design",
      "Useful for inspections",
      "Easy to store",
    ],
    searchKeywords: [
      "roof inspection tools",
      "roof inspection equipment",
    ],
  },

  {
    id: 3,
    slug: "roof-sealant",
    title: "Roof Sealant",
    category: "roof-sealants",
    image: "https://m.media-amazon.com/images/I/71yGQnFE0CL._AC_UY218_.jpg",
    description:
      "A roofing sealant intended for suitable maintenance and sealing applications.",
    amazon: {
      US: "https://amzn.to/4iefMpG",
    },
    features: [
      "Weather-resistant formulation",
      "Suitable for appropriate sealing applications",
      "Easy-to-use container",
    ],
    searchKeywords: [
      "roof sealant",
      "roof caulk",
      "roof repair sealant",
    ],
  },
  {
    id: 4,
    slug: "roof-supply",
    title: "Roof Repair Supply",
    category: "roof-repair-supplies",
    image: "https://m.media-amazon.com/images/I/619f65vJZIL._AC_UY218_.jpg",
    description:
      "Get general roofing supplies.",
    amazon: {
      US: "https://amzn.to/3UiJTCr",
    },
    features: [
      "Weather-resistant formulation",
      "Suitable for appropriate sealing applications",
      "Easy-to-use container",
    ],
    searchKeywords: [
      "roof supplies",
      "roof diy supplies",
      "roof repair sealant",
    ],
  },
  {
    id: 5,
    slug:   "gutter-tools",
    title:  "Gutter Cleaning Tools",
    category:   "gutter-tools",
    image:  "https://m.media-amazon.com/images/I/61LW9CdAtUL._AC_UL320_.jpg",
    description:
        "Gutter cleaning tools from the ground",
    amazon: {
        US: "https://amzn.to/4qlGSgJ",
    },
    features:   [
        "long pole",
        "adjustable handle"
    ],
    searchKeywords: [
        "gutter cleaning tool",
    ],
  },
  {
    id: 6,
    slug:   "roof-cleaning-tools",
    title:  "Roof Cleaning Tools",
    category:   "roof-cleaning",
    image:  "https://m.media-amazon.com/images/I/81+oOIwj9gL._AC_UL320_.jpg",
    description:
        "Roof cleaning tools",
    amazon: {
        US: "https://amzn.to/4wROQA1",
    },
    features:   [
        "long pole",
        "adjustable handle"
    ],
    searchKeywords: [
        "roof cleaning tool",
    ],
  },
    {
    id: 7,
    slug:   "measuring-tools",
    title:  "Measuring Tools",
    category:   "measuring-tools",
    image:  "https://m.media-amazon.com/images/I/61jibW8kmHL._AC_UL320_.jpg",
    description:
        "Measuring tools for roofing applications",
    amazon: {
        US: "https://amzn.to/4gBs5er",
    },
    features:   [
        "",
        ""
    ],
    searchKeywords: [
        "measuring tool",
        "roof measuring tool"
    ],
  },
    {
    id: 8,
    slug:   "attic-ventilation",
    title:  "Attic Ventilation",
    category:   "attic-ventilation",
    image:  "https://m.media-amazon.com/images/I/71SCfCSFhgL._AC_UL320_.jpg",
    description:
        "Attic ventilation solutions",
    amazon: {
        US: "https://amzn.to/4cEWA0D",
    },
    features:   [
        "",
        ""
    ],
    searchKeywords: [
        "attic ventilation",
        "roof ventilation"
    ],
  },
  {
    id: 9,
    slug:   "roofing-safety",
    title:  "Roofing Safety",
    category:   "roofing-safety",
    image:  "https://m.media-amazon.com/images/I/71qP5Heoa6L._AC_UL320_.jpg",
    description:
        "Roofing safety equipment",
    amazon: {
        US: "https://amzn.to/3U1MiS2",
    },
    features:   [
        "",
        ""
    ],
    searchKeywords: [
        "rooftop safety",
        "roofing safety"
    ],
  },
];