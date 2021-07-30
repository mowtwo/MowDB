import type DbField from "./DbField"

export interface FindFn {
  (field: DbField<any>): boolean
}
export default interface FindOpr {
  (val: any): FindFn
}

export const Eq: FindOpr = val => field => val == field.getValue()

export const Like: FindOpr = val => field => field.like(val)

export const Not: FindOpr = val => field => val != field.getValue()

export const Lt: FindOpr = val => field => field.getValue() < val
export const Le: FindOpr = val => field => field.getValue() <= val
export const Ge: FindOpr = val => field => field.getValue() >= val
export const Gt: FindOpr = val => field => field.getValue() > val

export const OprPipe: (...opr: FindFn[]) => FindFn = (...opr) => field => opr.every(o => o(field))