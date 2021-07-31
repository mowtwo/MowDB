import DbTable from "./DbTable";
import { CtorOf } from "./typeUtil";

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
    tb.add(new Entity(...entityInitArgs))
  }
}

interface TableRef<T, D extends DbContext> {
  (this: ThisType<D>): DbTable<T>;
  ctx: D;
  tbName: string;
}


type AnyTableRef = TableRef<any, DbContext>