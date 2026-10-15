/** Where to go after signing in: the ?next= path if it's local, otherwise My benefits. */
export function nextPath(search: URLSearchParams) {
  const next = search.get('next')
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/my-benefits'
}
