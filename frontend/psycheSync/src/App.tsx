import { useState, useCallback, useRef } from "react"
import { Search, BookmarkCheck, X, Sun, Moon, Info } from "lucide-react"
import Loader from "./components/Loader"
import { Toaster } from "sonner"
import { useTheme } from "./components/theme-provider"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import SearchCard from "./components/SearchCard"
import CodeDetailSheet from "./components/CodeDetailSheet"
import AboutPage from "./components/AboutPage"
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
  const { theme, setTheme } = useTheme()

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      <Toaster position="top-center" richColors />

      <Tabs defaultValue="search" className="flex flex-col flex-1">

        {/* ── Sticky Header ── */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 pt-10 pb-3">
          <div className="relative flex items-center justify-center mb-3">
            <p className="text-xs font-semibold tracking-widest text-sage-500 uppercase">
              PsycheSync
            </p>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="absolute right-0 p-1.5 rounded-lg text-slate-400 hover:text-sage-600 dark:text-slate-500 dark:hover:text-sage-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors [-webkit-tap-highlight-color:transparent]"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

          {/* shadcn Tabs trigger row */}
          <TabsList className="w-full max-w-lg mx-auto grid grid-cols-3 bg-slate-100 dark:bg-slate-800 rounded-xl h-9 mb-3">
            <TabsTrigger value="search" className="rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:!text-sage-600 dark:hover:!text-sage-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:!text-sage-700 dark:data-[state=active]:!text-sage-300 data-[state=active]:shadow-sm">
              <Search size={13} className="mr-1.5" />
              Search
            </TabsTrigger>
            <TabsTrigger value="favorites" className="rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:!text-sage-600 dark:hover:!text-sage-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:!text-sage-700 dark:data-[state=active]:!text-sage-300 data-[state=active]:shadow-sm relative" >
              <BookmarkCheck size={13} className="mr-1.5" />
              Favorites
              {favorites.length > 0 && (
                <span className="ml-1.5 bg-sage-500 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {favorites.length > 99 ? "99+" : favorites.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="about" className="rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:!text-sage-600 dark:hover:!text-sage-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:!text-sage-700 dark:data-[state=active]:!text-sage-300 data-[state=active]:shadow-sm">
              <Info size={13} className="mr-1.5" />
              About
            </TabsTrigger>
          </TabsList>

          {/* Search input — only visible on search tab */}
          <TabsContent value="search" className="mt-0">
            <div className="relative max-w-lg mx-auto">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder="Search ICD-10 codes or descriptions…"
                className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-sage-300 dark:focus:ring-sage-600 transition"
                autoFocus
              />
              {query && (
                <button onClick={clearQuery} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors [-webkit-tap-highlight-color:transparent]">
                  <X size={14} />
                </button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="mt-0">
            <p className="text-center text-slate-500 dark:text-slate-400 text-xs">Your saved diagnostic codes</p>
          </TabsContent>

          <TabsContent value="about" className="mt-0">
            <p className="text-center text-slate-500 dark:text-slate-400 text-xs">About PsycheSync</p>
          </TabsContent>
        </header>

        {/* ── Main Content ── */}
        <main className="flex-1 px-4 py-4 pb-6 max-w-lg mx-auto w-full">

          {/* Search tab content */}
          <TabsContent value="search">
            {loading && (
              <div className="flex justify-center py-16">
                <Loader size={48} />
              </div>
            )}
            {!loading && searched && results.length === 0 && (
              <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                <Search size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No results for <span className="font-medium text-slate-600 dark:text-slate-300">"{query}"</span></p>
              </div>
            )}
            {!loading && !searched && (
              <div className="text-center py-20 text-slate-300 dark:text-slate-600">
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

          {/* About tab content */}
          <TabsContent value="about">
            <AboutPage />
          </TabsContent>

          {/* Favorites tab content */}
          <TabsContent value="favorites">
            {favorites.length === 0 ? (
              <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                <BookmarkCheck size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No saved codes yet.</p>
                <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Star a code in the detail view to save it.</p>
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
