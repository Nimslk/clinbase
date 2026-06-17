import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'
const TOOL  = 'medguide-library'
const EMAIL = 'saidxon404@gmail.com'

async function translateToEnglish(text: string): Promise<string> {
  try {
    const res  = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ru|en`,
      { signal: AbortSignal.timeout(4000) }
    )
    const json = await res.json()
    return json?.responseData?.translatedText ?? text
  } catch {
    return text
  }
}

function isCyrillic(s: string) { return /[а-яёА-ЯЁ]/.test(s) }

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const rawQuery = (searchParams.get('q') ?? '').trim()
  const page     = Number(searchParams.get('page') ?? 1)
  const perPage  = Math.min(Number(searchParams.get('perPage') ?? 10), 20)

  if (!rawQuery) return NextResponse.json({ articles: [], total: 0, query: '', translated: null })

  const needsTranslation = isCyrillic(rawQuery)
  const query = needsTranslation ? await translateToEnglish(rawQuery) : rawQuery

  const retstart = (page - 1) * perPage

  // 1. Search for IDs
  const searchUrl =
    `${BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${perPage}&retstart=${retstart}&retmode=json&usehistory=y&tool=${TOOL}&email=${EMAIL}`

  const searchRes  = await fetch(searchUrl, { signal: AbortSignal.timeout(8000) })
  const searchJson = await searchRes.json()
  const ids: string[] = searchJson?.esearchresult?.idlist ?? []
  const total: number  = Number(searchJson?.esearchresult?.count ?? 0)

  if (!ids.length) return NextResponse.json({ articles: [], total, query, translated: needsTranslation ? query : null })

  // 2. Fetch summaries
  const summaryUrl =
    `${BASE}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json&tool=${TOOL}&email=${EMAIL}`
  const summaryRes  = await fetch(summaryUrl, { signal: AbortSignal.timeout(8000) })
  const summaryJson = await summaryRes.json()
  const result      = summaryJson?.result ?? {}

  const articles = ids.map((id) => {
    const r = result[id] ?? {}
    const authors = (r.authors ?? [])
      .slice(0, 3)
      .map((a: { name: string }) => a.name)
      .join(', ') + ((r.authors?.length ?? 0) > 3 ? ' et al.' : '')

    return {
      id,
      title:   r.title ?? 'Без названия',
      authors,
      journal: r.fulljournalname ?? r.source ?? '',
      year:    r.pubdate ? r.pubdate.split(' ')[0] : '',
      doi:     (r.articleids ?? []).find((a: { idtype: string; value: string }) => a.idtype === 'doi')?.value ?? null,
      pmid:    id,
      url:     `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
    }
  })

  return NextResponse.json({ articles, total, query, translated: needsTranslation ? query : null })
}
