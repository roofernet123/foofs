// components/directory/CompareButton.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, GitCompareArrows } from 'lucide-react'

const STORAGE_KEY = 'roofernet-compare-ids'
const MAX_COMPARE = 3

function readIds(): number[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = stored ? JSON.parse(stored) : []

    if (!Array.isArray(parsed)) return []

    return [
      ...new Set(
        parsed.filter(
          (value): value is number =>
            typeof value === 'number' &&
            Number.isSafeInteger(value) &&
            value > 0
        )
      ),
    ].slice(0, MAX_COMPARE)
  } catch {
    return []
  }
}

interface CompareButtonProps {
  contractorId: number
  contractorName: string
  className?: string
}

export function CompareButton({
  contractorId,
  contractorName,
  className = '',
}: CompareButtonProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [ready, setReady] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setSelectedIds(readIds())
    setReady(true)
  }, [])

  function handleClick() {
    if (!ready) return

    const currentIds = readIds()
    const alreadySelected = currentIds.includes(contractorId)

    let nextIds: number[]

    if (alreadySelected) {
      nextIds = currentIds.filter((id) => id !== contractorId)
      setMessage(`${contractorName} removed from comparison.`)
    } else {
      if (currentIds.length >= MAX_COMPARE) {
        setMessage('You can compare up to three contractors.')
        return
      }

      nextIds = [...currentIds, contractorId]
      setMessage(`${contractorName} added to comparison.`)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds))
    setSelectedIds(nextIds)

    const query = nextIds.length
      ? `?ids=${nextIds.join(',')}`
      : ''

    router.push(`/compare${query}`)
  }

  const selected = selectedIds.includes(contractorId)

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={!ready}
        aria-pressed={selected}
        className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${
          selected
            ? 'border-blue-700 bg-blue-50 text-blue-800 hover:bg-blue-100'
            : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-800'
        }`}
      >
        {selected ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <GitCompareArrows className="h-4 w-4" aria-hidden="true" />
        )}
        {selected ? 'Selected' : 'Compare'}
      </button>

      <span className="sr-only" aria-live="polite">
        {message}
      </span>
    </div>
  )
}