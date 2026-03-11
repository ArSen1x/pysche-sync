export interface CodeResult {
  code: string
  description: string
}

export interface ICDCodeDetail {
  code: string
  description: string
  parent: string | null
  children: string[]
  excludes1: string[]
  excludes2: string[]
}
