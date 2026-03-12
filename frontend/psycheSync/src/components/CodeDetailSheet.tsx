import { useState } from "react"
import { Copy, Check, AlertCircle, ChevronRight, X, Star } from "lucide-react"
import Loader from "@/components/Loader"
import { Dialog } from "radix-ui"
import { toast } from "sonner"
import { useCodeDetails } from "@/hooks/useCodeDetails"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Props {
  code: string | null
  onClose: () => void
  onSelectCode: (code: string) => void
  isFavorited: boolean
  onToggleFavorite: (code: string, description: string) => void
}

function useCopyCode(code: string | null) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    if (!code) return
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return { copied, copy }
}

function getDSMMock(code: string): string {
  const prefix = code.split(".")[0].toUpperCase()
  const map: Record<string, string> = {
    F32: "Major Depressive Disorder (DSM-5-TR 296.2x)",
    F33: "Major Depressive Disorder, Recurrent (DSM-5-TR 296.3x)",
    F40: "Specific Phobia / Social Anxiety Disorder (DSM-5-TR 300.xx)",
    F41: "Generalized Anxiety Disorder / Panic Disorder (DSM-5-TR 300.xx)",
    F42: "Obsessive-Compulsive Disorder (DSM-5-TR 300.3)",
    F43: "PTSD / Acute Stress Disorder / Adjustment Disorders (DSM-5-TR 309.xx)",
    F20: "Schizophrenia Spectrum (DSM-5-TR 295.xx)",
    F31: "Bipolar I / II Disorder (DSM-5-TR 296.xx)",
    F90: "ADHD (DSM-5-TR 314.0x)",
    F84: "Autism Spectrum Disorder (DSM-5-TR 299.00)",
  }
  return map[prefix] ?? `Mapped to DSM-5-TR criteria for ${code}`
}

export default function CodeDetailSheet({
  code,
  onClose,
  onSelectCode,
  isFavorited,
  onToggleFavorite,
}: Props) {
  const { data, isLoading, isError } = useCodeDetails(code)
  const { copied, copy } = useCopyCode(code)

  const handleChildClick = (childCode: string) => {
    if (childCode === code) return
    onSelectCode(childCode)
  }

  const handleToggleFavorite = () => {
    if (!data) return
    onToggleFavorite(data.code, data.description)
    toast(isFavorited ? `Removed ${data.code}` : `${data.code} added to Favorites`, {
      description: isFavorited ? undefined : data.description,
      duration: 3000,
    })
  }

  return (
    <Dialog.Root open={!!code} onOpenChange={(open) => { if (!open) onClose() }}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Centered panel */}
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md max-h-[85dvh] bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex flex-col overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">

          {/* Close button */}
          <Dialog.Close asChild>
            <button className="absolute top-3 right-3 z-10 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 [-webkit-tap-highlight-color:transparent]">
              <X size={16} />
              <span className="sr-only">Close</span>
            </button>
          </Dialog.Close>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 py-16">
              <Loader size={48} />
              <p className="text-sm text-slate-400 dark:text-slate-500">Loading details…</p>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 py-16 text-red-400">
              <AlertCircle size={28} />
              <p className="text-sm text-center px-4">
                Could not load details for{" "}
                <span className="font-mono font-semibold">{code}</span>
              </p>
            </div>
          )}

          {/* Content */}
          {data && (
            <div className="flex flex-col overflow-hidden">

              {/* Header */}
              <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 pr-7">
                  <span className="font-mono text-base font-bold text-sage-700 dark:text-sage-300 bg-sage-50 dark:bg-sage-900/40 border border-sage-200 dark:border-sage-700 rounded-lg px-3 py-1">
                    {data.code}
                  </span>

                  {/* Copy button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copy}
                    className="text-slate-400 hover:text-sage-600 gap-1.5 [-webkit-tap-highlight-color:transparent]"
                  >
                    {copied
                      ? <><Check size={14} className="text-sage-500" /> Copied</>
                      : <><Copy size={14} /> Copy</>
                    }
                  </Button>

                  {/* Star / Favorite button */}
                  <button
                    onClick={handleToggleFavorite}
                    aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                    className="ml-auto shrink-0 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors [-webkit-tap-highlight-color:transparent]"
                  >
                    <Star
                      size={16}
                      className={isFavorited ? "fill-sage-500 text-sage-500" : "text-slate-300 dark:text-slate-600"}
                    />
                  </button>
                </div>

                <Dialog.Title className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug mt-2">
                  {data.description}
                </Dialog.Title>

                {data.parent && (
                  <Dialog.Description asChild>
                    <button
                      onClick={() => handleChildClick(data.parent!)}
                      className="mt-1.5 inline-flex items-center gap-1 text-xs text-sage-600 dark:text-sage-400 hover:text-sage-800 dark:hover:text-sage-300 transition-colors cursor-pointer [-webkit-tap-highlight-color:transparent]"
                    >
                      <ChevronRight size={12} className="rotate-180" />
                      {data.parent}
                    </button>
                  </Dialog.Description>
                )}
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto px-4 py-3 space-y-4">

                {/* DSM-5-TR Reference */}
                <section className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] font-bold text-blue-400 dark:text-blue-500 uppercase tracking-widest mb-1">
                    DSM-5-TR Reference <span className="font-normal normal-case">(Illustrative)</span>
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-snug">
                    {getDSMMock(data.code)}
                  </p>
                </section>

                {/* Sub-diagnoses */}
                {data.children.length > 0 && (
                  <section>
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                      Sub-diagnoses ({data.children.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {data.children.map((child) => (
                        <button
                          key={child}
                          onClick={() => handleChildClick(child)}
                          className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-sage-700 dark:text-sage-300 bg-sage-50 dark:bg-sage-900/40 border border-sage-200 dark:border-sage-700 rounded-md px-2 py-1 hover:bg-sage-100 dark:hover:bg-sage-800/50 hover:border-sage-400 dark:hover:border-sage-600 transition-colors active:scale-95 cursor-pointer [-webkit-tap-highlight-color:transparent]"
                        >
                          {child}
                          <ChevronRight size={11} />
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Clinical notes */}
                {(data.excludes1.length > 0 || data.excludes2.length > 0) && (
                  <section>
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                      Clinical Notes
                    </p>
                    <Accordion type="multiple" className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden">
                      {data.excludes1.length > 0 && (
                        <AccordionItem value="excludes1">
                          <AccordionTrigger className="px-3 text-slate-700 dark:text-slate-200 font-medium">
                            Excludes 1
                            <Badge variant="secondary" className="ml-auto mr-2 shrink-0">
                              {data.excludes1.length}
                            </Badge>
                          </AccordionTrigger>
                          <AccordionContent className="px-3">
                            <ul className="space-y-1.5">
                              {data.excludes1.map((note, i) => (
                                <li key={i} className="text-slate-600 dark:text-slate-300 text-xs leading-snug flex gap-2">
                                  <span className="text-slate-300 dark:text-slate-600 shrink-0 mt-0.5">–</span>
                                  {note}
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                      {data.excludes2.length > 0 && (
                        <AccordionItem value="excludes2">
                          <AccordionTrigger className="px-3 text-slate-700 dark:text-slate-200 font-medium">
                            Excludes 2
                            <Badge variant="secondary" className="ml-auto mr-2 shrink-0">
                              {data.excludes2.length}
                            </Badge>
                          </AccordionTrigger>
                          <AccordionContent className="px-3">
                            <ul className="space-y-1.5">
                              {data.excludes2.map((note, i) => (
                                <li key={i} className="text-slate-600 dark:text-slate-300 text-xs leading-snug flex gap-2">
                                  <span className="text-slate-300 dark:text-slate-600 shrink-0 mt-0.5">–</span>
                                  {note}
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    </Accordion>
                  </section>
                )}

                {data.excludes1.length === 0 && data.excludes2.length === 0 && data.children.length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">
                    No additional clinical notes for this code.
                  </p>
                )}
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
