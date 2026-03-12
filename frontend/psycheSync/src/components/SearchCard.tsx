import { Bookmark, BookmarkCheck } from "lucide-react"

interface Props {
  code: string
  description: string
  isFavorited: boolean
  onToggleFavorite: (code: string, description: string) => void
  onSelect: (code: string) => void
}

export default function SearchCard({ code, description, isFavorited, onToggleFavorite, onSelect }: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-start transition-all hover:border-sage-200 dark:hover:border-sage-700 hover:shadow-md active:scale-[0.99]">
      {/* Clickable content area */}
      <button
        onClick={() => onSelect(code)}
        className="flex-1 min-w-0 text-left px-4 py-3.5 outline-none focus-visible:ring-2 focus-visible:ring-sage-300 focus-visible:rounded-l-2xl [-webkit-tap-highlight-color:transparent]"
      >
        <span className="inline-block font-mono text-xs font-semibold tracking-wide text-sage-600 dark:text-sage-400 bg-sage-50 dark:bg-sage-900/40 border border-sage-200 dark:border-sage-700 rounded-md px-2 py-0.5 mb-1.5">
          {code}
        </span>
        <p className="text-slate-700 dark:text-slate-200 text-sm leading-snug line-clamp-3">
          {description}
        </p>
      </button>

      {/* Bookmark — separate button, stops propagation implicitly via siblings */}
      <button
        onClick={() => onToggleFavorite(code, description)}
        className="shrink-0 px-3 py-3.5 text-slate-300 dark:text-slate-600 hover:text-sage-500 dark:hover:text-sage-400 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sage-300 focus-visible:rounded-r-2xl [-webkit-tap-highlight-color:transparent]"
        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      >
        {isFavorited
          ? <BookmarkCheck size={18} className="text-sage-500" />
          : <Bookmark size={18} />}
      </button>
    </div>
  )
}
