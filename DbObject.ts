import DbField, { createField } from "./DbField"
import type { SortContainer } from "./Sortable"

export default class DbObject<T, U extends keyof T> implements SortContainer {
  private sourceMap: Map<U, DbField<unknown>> = null
  private readonly _topId: string = null
  constructor(
    private readonly _id: string,
    source: T, topId?: string) {
    if (topId) {
      this._topId = topId
    } else {
      this._topId = _id
    }
    this.sourceMap = new Map(
      Object.keys(source)
        .map(key => {
          return [key as U, createField(key, source[key])]
        })
    )
  }
  get id() { return this._id }
  get topId() {
    return this._topId
  }
  get plainObject() {
    const obj: unknown = {}
    const keys = this.sourceMap.keys()
    for (const key of keys) {
      obj[key] = this.sourceMap.get(key).getValue()
    }
    return obj as T
  }
  get plainObjectWithId() {
    const res = this.plainObject
    return {
      ...res,
      id: this.topId
    }
  }
  get(key: U) {
    return this.sourceMap.get(key)
  }

  set(key: U, val: any) {
    if (this.sourceMap.has(key)) {
      this.get(key).setValue(val)
      return true
    }
    return false
  }

  has(key: U) {
    return this.sourceMap.has(key)
  }

  pick<M extends U>(...keys: M[]) {
    const keysSet = new Set(keys)
    const obj: Record<string, DbField<unknown>> = {}
    for (const key of keysSet) {
      obj[key as string] = this.get(key)
    }
    return obj
  }

  pickPlainObject<M extends U>(...keys: M[]) {
    const pick = this.pick(...keys)
    const res: Partial<Pick<T, M>> = {}
    for (const key in pick) {
      res[key] = pick[key].getValue() as M
    }
    return res
  }

  like(key: U, reg: string) {
    return this.get(key).like(reg)
  }
  sort(key, target) {
    const sortTarget = target as DbObject<T, U>
    return this.get(key).sort(sortTarget.get(key))
  }
}