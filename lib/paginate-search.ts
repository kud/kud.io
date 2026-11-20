// Reads every page of a GitHub search, as the sync's search does: a single
// per_page=100 call drops every result past the hundredth with no error at all.
// Paging stops at a short page or once total_count is reached. Any page failing
// returns null, so a half-read result set is never served as the whole one.
export const readAllSearchPages = async <T>(
  fetchPage: (page: number) => Promise<Response>,
  perPage: number,
): Promise<T[] | null> => {
  const items: T[] = []
  for (let page = 1; ; page += 1) {
    const res = await fetchPage(page)
    if (!res.ok) return null
    const data = (await res.json()) as { items?: T[]; total_count?: number }
    const pageItems = data.items ?? []
    items.push(...pageItems)
    if (pageItems.length < perPage || items.length >= (data.total_count ?? 0))
      return items
  }
}
