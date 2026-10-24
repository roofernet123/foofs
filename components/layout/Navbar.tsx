'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, Search, MapPin, ChevronDown } from 'lucide-react'
import { AuthButton } from '../auth/AuthButton'
import { BusinessActions } from '../business/BusinessActions'

interface NavbarProps {
  states?: { name: string; slug: string; count: number }[]
}

export default function Navbar({ states = [] }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isStatesOpen, setIsStatesOpen] = useState(false)
  const [topStates, setTopStates] = useState<{ name: string; slug: string; count: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
    setIsStatesOpen(false)
  }, [pathname])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStatesOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Check if route is active
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/')
  }

  // Handle mouse enter with clear timeout
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setIsStatesOpen(true)
  }

  // Handle mouse leave with delay
  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsStatesOpen(false)
    }, 200)
  }

  // ✅ Fetch states from API
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch('/api/states')
        const data = await response.json()
        // /api/states can legitimately fail (DB connection issues, etc.) and
        // return { error: '...' } instead of an array -- guard against that
        // rather than crashing on .slice() when it happens.
        if (response.ok && Array.isArray(data)) {
          setTopStates(data.slice(0, 8))
        } else {
          console.error('Error fetching states:', data?.error || 'Unexpected response shape')
          setTopStates([])
        }
      } catch (error) {
        console.error('Error fetching states:', error)
        setTopStates([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchStates()
  }, [])

  return (
    <nav
      className={`relative z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-lg'
          : 'bg-white/95 backdrop-blur-sm shadow-sm'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="Home">
            <div className="w-100 h-100  rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:bg-blue-700 transition">
              <Image
                src='/roofer-logo.webp'
                alt="Logo"
                width={100}
                height={100}
                priority
              />
            </div>
           
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition ${
                isActive('/') && pathname === '/'
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Home
            </Link>

            {/* States Dropdown - ✅ FIXED */}
            <div 
              className="relative"
              ref={dropdownRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`flex items-center gap-1 text-sm font-medium transition ${
                  isActive('/states')
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
                aria-expanded={isStatesOpen}
                aria-haspopup="true"
              >
                States
                <ChevronDown className={`w-4 h-4 transition-transform ${isStatesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isStatesOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-2"
                  role="menu"
                >
                  <div className="max-h-96 overflow-y-auto">
                    {isLoading ? (
                      <div className="px-4 py-2 text-sm text-gray-400">Loading...</div>
                    ) : (
                      <>
                        {topStates.map((state) => (
                          <Link
                            key={state.slug}
                            href={`/${state.slug}`}
                            className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                            role="menuitem"
                            onClick={() => setIsStatesOpen(false)}
                          >
                            <span>{state.name}</span>
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                              {state.count}
                            </span>
                          </Link>
                        ))}
                        {topStates.length > 0 && (
                          <Link
                            href="/states"
                            className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium border-t border-gray-100 mt-1 pt-2"
                            role="menuitem"
                            onClick={() => setIsStatesOpen(false)}
                          >
                            View All States →
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/services"
              className={`text-sm font-medium transition ${
                isActive('/services')
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Services
            </Link>

            <Link
                href="/tools"
                className={`text-sm font-medium transition ${
                  isActive('/tools')
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Tools
              </Link>

            <Link
              href="/blog"
              className={`text-sm font-medium transition ${
                isActive('/blog')
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Blog
            </Link>

            <Link
              href="/about"
              className={`text-sm font-medium transition ${
                isActive('/about')
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              About
            </Link>
             <BusinessActions variant="navbar" />
          </div>
             
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/search"
              className="p-2 text-gray-600 hover:text-blue-600 transition rounded-lg hover:bg-blue-50"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>  
             
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="container mx-auto px-4 py-4 space-y-3 max-h-[80vh] overflow-y-auto">
            <Link
              href="/"
              className={`block py-2 text-sm font-medium transition ${
                isActive('/') && pathname === '/'
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>

            {/* ✅ Mobile States - FIXED */}
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-700 py-1">States</div>
              {isLoading ? (
                <div className="py-2 px-2 text-sm text-gray-400">Loading...</div>
              ) : (
                <div className="grid grid-cols-2 gap-1 pl-2">
                  {topStates.slice(0, 8).map((state) => (
                    <Link
                      key={state.slug}
                      href={`/${state.slug}`}
                      className="flex items-center justify-between py-1.5 text-sm text-gray-600 hover:text-blue-600 transition"
                      onClick={() => setIsOpen(false)}
                    >
                      <span>{state.name}</span>
                      <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                        {state.count}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              {topStates.length > 0 && (
                <Link
                  href="/states"
                  className="block py-1.5 text-sm text-blue-600 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  View All States →
                </Link>
              )}
            </div>

            <Link
              href="/services"
              className={`block py-2 text-sm font-medium transition ${
                isActive('/services')
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Services
            </Link>
            <BusinessActions variant="navbar" />

            <Link
              href="/blog"
              className={`block py-2 text-sm font-medium transition ${
                isActive('/blog')
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Blog
            </Link>

            <Link
              href="/about"
              className={`block py-2 text-sm font-medium transition ${
                isActive('/about')
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>

            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 justify-center">
                <MapPin className="w-4 h-4" />
                <span>Serving all 50 states</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}