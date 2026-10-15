import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import searchIcon from '../assets/icons/search-sm.svg'
import { contentApi } from '../api'

type Suggestion = { kind: 'company' | 'benefit' | 'all'; label: string; detail?: string; to: string }

/** Global search with suggestions. ⌘K / Ctrl+K focuses it; Enter searches Explore. */
export function NavSearch() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const urlQuery = params.get('q') ?? ''
  const [query, setQuery] = useState(urlQuery)
  const [syncedQuery, setSyncedQuery] = useState(urlQuery)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLFormElement>(null)

  // Follow the URL when another control (e.g. the hero search) changes it.
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery)
    setQuery(urlQuery)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [])

  useEffect(() => {
    const q = query.trim()
    if (!q) return
    let cancelled = false
    const timer = setTimeout(() => {
      contentApi.suggest(q).then((result) => {
        if (cancelled) return
        setSuggestions([
          ...result.companies.map((c) => ({ kind: 'company' as const, label: c.name, detail: c.detail, to: `/companies/${c.id}` })),
          ...result.benefits.map((b) => ({ kind: 'benefit' as const, label: `Rank companies by ${b}`, to: `/?q=${encodeURIComponent(b)}` })),
          { kind: 'all' as const, label: `Search all for “${q}”`, to: `/?q=${encodeURIComponent(q)}` },
        ])
        setHighlight(-1)
      })
    }, 120)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  const go = (to: string) => {
    setOpen(false)
    inputRef.current?.blur()
    navigate(to)
  }

  const showList = open && query.trim() !== '' && suggestions.length > 0

  return (
    <form
      ref={rootRef}
      role="search"
      className="relative flex min-w-0 flex-1 items-center gap-[9px] rounded-[8px] border border-line bg-soft py-[9px] pr-[12px] pl-[14px] focus-within:border-line-strong"
      onSubmit={(e) => {
        e.preventDefault()
        if (showList && highlight >= 0) return go(suggestions[highlight].to)
        const q = query.trim()
        go(q ? `/?q=${encodeURIComponent(q)}` : '/')
      }}
    >
      <img src={searchIcon} alt="" width={15} height={15} className="shrink-0" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!showList) return
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setHighlight((h) => (h + 1) % suggestions.length)
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setHighlight((h) => (h <= 0 ? suggestions.length - 1 : h - 1))
          } else if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
        role="combobox"
        aria-expanded={showList}
        aria-controls="nav-search-suggestions"
        aria-activedescendant={highlight >= 0 ? `nav-suggestion-${highlight}` : undefined}
        aria-label="Search companies"
        placeholder="Search a company, benefit, or city"
        className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-light"
      />
      <kbd className="shrink-0 rounded-[4px] border border-line bg-surface px-[6px] py-[2px] font-sans text-small font-medium text-light">
        ⌘K
      </kbd>

      {showList && (
        <ul
          id="nav-search-suggestions"
          role="listbox"
          className="absolute top-[calc(100%+6px)] right-0 left-0 z-20 flex flex-col rounded-[10px] border border-line bg-surface p-[6px] shadow-[0_8px_24px_rgba(14,26,23,0.08)]"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.to + s.label}
              id={`nav-suggestion-${i}`}
              role="option"
              aria-selected={i === highlight}
              onMouseEnter={() => setHighlight(i)}
              onMouseDown={(e) => {
                e.preventDefault()
                go(s.to)
              }}
              className={`flex cursor-pointer items-center gap-[10px] rounded-[6px] px-[10px] py-[8px] ${i === highlight ? 'bg-soft' : ''}`}
            >
              {s.kind === 'company' ? (
                <span className="size-[20px] shrink-0 rounded-[5px] bg-shade" />
              ) : (
                <img src={searchIcon} alt="" width={15} height={15} className="mx-[2.5px] shrink-0" />
              )}
              <span className={`text-body ${s.kind === 'company' ? 'font-medium text-ink' : 'text-mid'}`}>{s.label}</span>
              {s.detail && <span className="text-small text-light">{s.detail}</span>}
            </li>
          ))}
        </ul>
      )}
    </form>
  )
}
