import { useQuery } from "@tanstack/react-query"
import { API_BASE } from "@/lib/constants"
import type { ICDCodeDetail } from "@/types/icd"

async function fetchCodeDetails(code: string): Promise<ICDCodeDetail> {
  const res = await fetch(`${API_BASE}/details/${encodeURIComponent(code)}`)
  if (!res.ok) throw new Error(`Code not found: ${code}`)
  return res.json()
}

export function useCodeDetails(code: string | null) {
  return useQuery<ICDCodeDetail, Error>({
    queryKey: ["code-details", code],
    queryFn: () => fetchCodeDetails(code!),
    enabled: !!code,
    staleTime: 1000 * 60 * 5, // cache for 5 min — ICD data doesn't change at runtime
  })
}
