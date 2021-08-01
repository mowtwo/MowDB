import DbObject from "./DbObject"
import type { FindFn } from "./FindOpr"
import type { SortList, SortMode } from "./Sortable"


export type BaseType = string | number | symbol
type PartialRecord<U extends BaseType, T> = Partial<Record<U, T>>
export type FindOption<U extends BaseType = BaseType> = PartialRecord<U, FindFn> & Partial<{
  sortBy: PartialRecord<U | 'id', SortMode>;
  groupBy: U[];
  id: number | string;
  take: number;
  skip: number;
}>
type UpdateValues<U extends BaseType, V> = Partial<Record<U, V>>

export default class DbTable<T, U extends keyof T = keyof T> implements SortList {
  private _primaryKey = 1
  private get primaryKey() {
    return this._primaryKey++
  }
  private list: DbObject<T, U>[] = []
  private readonly _topName: string = null
  constructor(
    private readonly _name: string,
    list?: DbObject<T, U>[],
    topName?: string,
    private readonly _getTopTotal?: () => number
  ) {
    if (topName) {
      this._topName = topName
    } else {
      this._topName = _name
    }
    if (Array.isArray(list)) {
      this.list = list
    }
  }
  get name() {
    return this._name
  }
  get topName() {
    return this._topName
  }
  get total() {
    return this.list.length
  }
  get topTotal() {
    if (typeof this._getTopTotal == 'function') {
      return this._getTopTotal()
    } else {
      return this.total
    }
  }
  private findRaw(findOptions: FindOption<U>) {
    const { id, sortBy, groupBy, take = 500, skip = 0, ...where } = findOptions
    const keys = Object.keys(where)
    if (keys.length <= 0 && !sortBy && !groupBy && !id) {
      return [...this.list].slice(skip, take + skip)
    }
    const maybeIdSortModes = sortBy ?? {} as PartialRecord<U | 'id', SortMode>
    const sortModes = {
      id: 'ASC' as SortMode,
      ...maybeIdSortModes
    }
    let sortArray = [...this.list]
    for (const modeKey in sortModes) {
      const mode = sortModes[modeKey] as SortMode
      if (modeKey == 'id') {
        if (mode == 'ASC') {
          sortArray = this.sort((a: DbObject<T, U>, b: DbObject<T, U>) => {
            return parseInt(a.topId) - parseInt(b.topId)
          })
        } else {
          sortArray = this.sort((a: DbObject<T, U>, b: DbObject<T, U>) => {
            return parseInt(b.topId) - parseInt(a.topId)
          })
        }
        continue
      }
      sortArray = this.sort((a: DbObject<T, U>, b: DbObject<T, U>) => {
        if (mode == 'ASC') {
          return b.sort(modeKey, a)
        } else {
          return a.sort(modeKey, b)
        }
      })
    }
    const resultList = sortArray
      // .slice(skip) //先取结果集然后再分片
      .filter(field => keys.every(key => findOptions[key](field.get(key as U))))
      .map((obj: DbObject<T, U>) => {
        if (Array.isArray(groupBy) && groupBy.length > 0) {
          const res = obj.pickPlainObject(...groupBy)
          return new DbObject(obj.id + '__pick-' + groupBy.join('-'), res, obj.id)
        }
        return obj
      })
      .slice(skip, skip + take)
    return resultList
  }
  private findOneRaw(findOptions: FindOption<U>) {
    const findList = this.findRaw(findOptions)
    return findList
  }
  add(obj: T) {
    this.list.push(
      new DbObject(this.primaryKey.toString(), obj)
    )
    return this
  }
  find(findOptions: FindOption<U> = {}) {
    const resultList = this.findRaw(findOptions)
    const that = this
    return new DbTable(this.name + '__find-result', resultList, this.name, () => that.topTotal)
  }

  findOne(findOptions: FindOption<U> = {}) {
    const result = this.findOneRaw(findOptions)
    return result[0]
  }

  delete(findOptions: FindOption<U>) {
    const resultList = this.findRaw(findOptions)
    const delList: DbObject<T, U>[] = []
    for (const item of resultList) {
      const findIndex = this.list.findIndex(rawItem => {
        return rawItem.id == item.id
      })
      if (findIndex >= 0) {
        delList.push(this.list[findIndex])
        this.list.splice(findIndex, 1)
      }
    }
    const that = this
    return new DbTable(this.name + '__delete-result', delList, this.name, () => that.topTotal)
  }
  update<M extends U>(where: FindOption<U>, updateVals: UpdateValues<M, T[M]>) {
    const resultList = this.findRaw(where)
    const updateList: DbObject<T, U>[] = []
    for (const item of resultList) {
      const findIndex = this.list.findIndex(rawItem => {
        return rawItem.id == item.id
      })
      if (findIndex >= 0) {
        const findItem = this.list[findIndex]
        for (const updateKey in updateVals) {
          if (findItem.has(updateKey)) {
            findItem.set(updateKey, updateVals[updateKey])
          }
        }
        updateList.push(findItem)
      }
    }
    const that = this
    return new DbTable(this.name + '__update-result', updateList, this.name, () => that.topTotal)
  }
  toObject() {
    return {
      name: this.topName,
      rows: this.toArray(),
      total: this.topTotal
    }
  }
  toArray() {
    return this.list.map(item => item.plainObjectWithId)
  }
  toRawArray() {
    return this.list.map(item => item.plainObject)
  }

  sort(sortFn) {
    const copyList = [...this.list]
    const res = copyList.sort(sortFn)
    return res
  }
}