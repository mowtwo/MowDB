import DbTable from "./DbTable";
import { Eq } from "./FindOpr";
import { ContextFindOptions, CtorOf } from "./typeUtil";

export default class DbContext {
  private tableEntityMap: Map<DbTable<any>, CtorOf<any>> = new Map()
  constructor(
    private readonly _name: string
  ) { }
  get name() { return this._name }
  createTable<T>(tbName: string, entityDefine: CtorOf<T>): TableRef<T, DbContext> {
    const tb = new DbTable<T>(tbName)
    this.tableEntityMap.set(tb, entityDefine)
    const ref = function () {
      if (!(this instanceof DbContext)) {
        throw new Error('ref must be bind DbContext type this')
      }
      return tb
    } as TableRef<T, DbContext>
    ref.ctx = this
    ref.tbName = tbName
    return ref
  }
  private checkCtx(ref: AnyTableRef): void {
    if (ref.ctx != this) {
      throw new Error(`table[${ref.name}] context is not ${this.name}`)
    }
  }
  private fromRefGetTable(ref: AnyTableRef) {
    return ref.call(this) as DbTable<any>
  }
  private getTableEntity(ref: DbTable<any>) {
    const ctor = this.tableEntityMap.get(ref)
    if (ctor) {
      return ctor
    } else {
      throw new Error(`table[${ref.name}] invaild entity`)
    }
  }
  insert(ref: AnyTableRef, ...entityInitArgs: any[]) {
    this.checkCtx(ref)
    const tb = this.fromRefGetTable(ref)
    const Entity = this.getTableEntity(tb)
    if (entityInitArgs.length >= Entity.length) {
      return tb.add(new Entity(...entityInitArgs))
    }
    throw new Error(`entity init arguments length must be greate ${Entity.length}`)
  }
  find<MT, ST = {}>(main: TableRef<MT>, options?: ContextFindOptions<MT, ST>) {
    this.checkCtx(main)
    const tb = this.fromRefGetTable(main)
    const mainList = tb.find(options?.where ?? {})
    if (!options || !options.relation) {
      return mainList.toObject()
    } else {
      const res = mainList.toObject()
      return {
        ...res,
        rows: res.rows.map(item => {
          let subName = ''
          let subRef: TableRef<ST> = null
          let subFindType: 'find' | 'findOne' = null
          let { sub, subKey, masterKey } = options.relation
          if (Array.isArray(sub)) {
            subName = sub[0].tbName
            subRef = sub[0]
            subFindType = 'find'
          } else {
            subName = sub.tbName
            subRef = sub
            subFindType = 'findOne'
          }
          this.checkCtx(subRef)
          const subTb = this.fromRefGetTable(subRef)
          if (subFindType == 'find') {
            return {
              ...item,
              [subName + 'List']: subTb.find({
                [subKey]: Eq(item[masterKey])
              }).toArray()
            }
          } else {
            return {
              ...item,
              [subName]: subTb.findOne({
                [subKey]: Eq(item[masterKey])
              }).plainObjectWithId
            }
          }
        })
      }
    }
  }
}

export interface TableRef<T, D extends DbContext = DbContext> {
  (this: ThisType<D>): DbTable<T>;
  ctx: D;
  tbName: string;
}


type AnyTableRef = TableRef<any, DbContext>