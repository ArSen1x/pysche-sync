import { useState, useCallback, useRef } from "react"
import { Search, BookmarkCheck, X, Loader2 } from "lucide-react"
import { Toaster } from "sonner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import SearchCard from "./components/SearchCard"
import CodeDetailSheet from "./components/CodeDetailSheet"
import { API_BASE } from "./lib/constants"
import { useFavorites } from "./hooks/useFavorites"
import type { CodeResult } from "./types/icd"

const DEBOUNCE_MS = 300

export default function App() {
  const [query, setQuery]       = useState("")
  const [results, setResults]   = useState<CodeResult[]>([])
  const [loading, setLoading]   = useState(false)
  const [searched, setSearched] = useState(false)
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { favorites, toggleFavorite, isFavorited } = useFavorites()

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return }
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`${API_BASE}/search/${encodeURIComponent(q.trim())}`)
      const data: CodeResult[] = await res.json()
      setResults(Array.isArray(data) ? data : [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchResults(val), DEBOUNCE_MS)
  }

  const clearQuery = () => { setQuery(""); setResults([]); setSearched(false) }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Toaster position="top-center" richColors />

      <Tabs defaultValue="search" className="flex flex-col flex-1">

        {/* ── Sticky Header ── */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 pt-10 pb-3">
          <p className="text-xs font-semibold tracking-widest text-sage-500 uppercase mb-3 text-center">
            PsycheSync
          </p>

          {/* shadcn Tabs trigger row */}
          <TabsList className="w-full max-w-lg mx-auto grid grid-cols-2 bg-slate-100 rounded-xl h-9 mb-3">
            <TabsTrigger value="search" className="rounded-lg text-xs font-medium text-slate-500 hover:!text-sage-600 data-[state=active]:bg-white data-[state=active]:!text-sage-700 data-[state=active]:shadow-sm">
              <Search size={13} className="mr-1.5" />
              Search
            </TabsTrigger>
            <TabsTrigger value="favorites" className="rounded-lg text-xs font-medium text-slate-500 hover:!text-sage-600 data-[state=active]:bg-white data-[state=active]:!text-sage-700 data-[state=active]:shadow-sm relative">
              <BookmarkCheck size={13} className="mr-1.5" />
              Favorites
              {favorites.length > 0 && (
                <span className="ml-1.5 bg-sage-500 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {favorites.length > 99 ? "99+" : favorites.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Search input — only visible on search tab */}
          <TabsContent value="search" className="mt-0">
            <div className="relative max-w-lg mx-auto">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder="Search ICD-10 codes or descriptions…"
                className="w-full bg-slate-100 rounded-xl pl-9 pr-10 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sage-300 transition"
                autoFocus
              />
              {query && (
                <button onClick={clearQuery} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors [-webkit-tap-highlight-color:transparent]">
                  <X size={14} />
                </button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="mt-0">
            <p className="text-center text-slate-500 text-xs">Your saved diagnostic codes</p>
          </TabsContent>
        </header>

        {/* ── Main Content ── */}
        <main className="flex-1 px-4 py-4 pb-6 max-w-lg mx-auto w-full">

          {/* Search tab content */}
          <TabsContent value="search">
            {loading && (
              <div className="flex justify-center py-16 text-sage-400">
                <Loader2 size={24} className="animate-spin" />
              </div>
            )}
            {!loading && searched && results.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <Search size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No results for <span className="font-medium text-slate-600">"{query}"</span></p>
              </div>
            )}
            {!loading && !searched && (
              <div className="text-center py-20 text-slate-300">
                <Search size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Start typing to search</p>
              </div>
            )}
            {!loading && results.length > 0 && (
              <ul className="space-y-2.5">
                {results.map((item) => (
                  <li key={item.code}>
                    <SearchCard
                      code={item.code}
                      description={item.description}
                      isFavorited={isFavorited(item.code)}
                      onToggleFavorite={toggleFavorite}
                      onSelect={setSelectedCode}
                    />
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          {/* Favorites tab content */}
          <TabsContent value="favorites">
            {favorites.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <BookmarkCheck size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No saved codes yet.</p>
                <p className="text-xs text-slate-300 mt-1">Star a code in the detail view to save it.</p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {favorites.map((item) => (
                  <li key={item.code}>
                    <SearchCard
                      code={item.code}
                      description={item.description}
                      isFavorited={true}
                      onToggleFavorite={toggleFavorite}
                      onSelect={setSelectedCode}
                    />
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </main>
      </Tabs>

      <CodeDetailSheet
        code={selectedCode}
        onClose={() => setSelectedCode(null)}
        onSelectCode={setSelectedCode}
        isFavorited={selectedCode ? isFavorited(selectedCode) : false}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  )
}
