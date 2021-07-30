export default interface Sortable {
  sort: (target: Sortable) => number
}

export interface SortContainer {
  sort: (sortKey: string, target: SortContainer) => number
}

export interface SortList {
  sort: (sortFn: (last: SortContainer, next: SortContainer) => number) => SortContainer[]
}

export type SortMode =
  | 'ASC' //正序
  | 'DESC' //倒序