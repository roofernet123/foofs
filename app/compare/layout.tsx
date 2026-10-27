// app/compare/layout.tsx

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compare Roofing Contractors',
  description:
    'Compare roofing contractors by ratings, reviews, experience, services, verification details, and available pricing information.',
  alternates: {
    canonical: '/compare',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function CompareLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}