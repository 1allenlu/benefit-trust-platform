export type CompareColumn = {
  id: string
  name: string
  isYours: boolean
  totalValue: string
  /** Value stack segment widths in px, in legend order. */
  stack: number[]
}
