import { TableRef } from "./DbContext";
import { BaseType, FindOption } from "./DbTable";

export interface CtorOf<T> {
  new(...args: any[]): T
}

export interface Relation<T, MU, U = keyof T> {
  sub: TableRef<T> | [TableRef<T>],
  subKey: U,
  masterKey: MU | 'id'
}

export interface ContextFindOptions<MT, ST, MU extends BaseType = keyof MT> {
  where?: FindOption<MU>,
  relation?: Relation<ST, MU>
}
