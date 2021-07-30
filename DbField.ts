import type DbFieldType from "./DbFieldType";
import type Sortable from "./Sortable";
import { fieldLikeRegValdate } from "./utils";

export default interface DbField<T> extends Sortable {
  readonly type: DbFieldType;
  readonly name: string;
  originValue: T;
  getValue: () => unknown;
  toString: () => string;
  like: (reg: string) => boolean;
  setValue: (value: unknown) => void
}

export class DbStringField implements DbField<string> {
  private _type: DbFieldType = 'string'
  constructor(
    private _name: string,
    private _value: string,
  ) { }
  get type() { return this._type }
  get name() { return this._name }
  get originValue() { return this._value }
  getValue() { return this._value }
  toString() { return this._value }
  like(reg: string) {
    const validator = fieldLikeRegValdate(reg)
    if (typeof validator == 'function') {
      return validator(this.toString())
    }
    return false
  }
  setValue(value) {
    this._value = String(value)
  }
  sort(target) {
    const sortTarget = target as DbStringField
    return sortTarget.getValue().charCodeAt(0) - this.getValue().charCodeAt(0)
  }
}

export class DbNumberField implements DbField<number> {
  private _type: DbFieldType = 'number'
  constructor(
    private _name: string,
    private _value: number,
  ) { }
  get type() { return this._type }
  get name() { return this._name }
  get originValue() { return this._value }
  getValue() { return this._value }
  toString() { return this._value.toFixed(32) }
  like(reg: string) {
    const validator = fieldLikeRegValdate(reg)
    if (typeof validator == 'function') {
      return validator(this.toString())
    }
    return false
  }
  setValue(value) {
    if (typeof value == 'number' && !Number.isNaN(value)) {
      this._value = value
    } else {
      throw new Error('must be set float')
    }
  }
  sort(target) {
    const sortTarget = target as DbNumberField
    return sortTarget.getValue() - this.getValue()
  }
}

export class DbDateField implements DbField<Date> {
  private _type: DbFieldType = 'date'
  constructor(
    private _name: string,
    private _value: Date,
  ) { }
  get type() { return this._type }
  get name() { return this._name }
  get originValue() { return this._value }
  getValue() { return this._value }
  toString() { return this._value.toString() }
  like(reg: string) {
    const validator = fieldLikeRegValdate(reg)
    if (typeof validator == 'function') {
      return validator(this.toString())
    }
    return false
  }
  setValue(value) {
    this._value = new Date(value)
  }
  sort(target) {
    const sortTarget = target as DbDateField
    return Number(sortTarget.getValue()) - Number(this.getValue())
  }
}

export class DbBoolField implements DbField<Boolean> {
  private _type: DbFieldType = 'bool'
  constructor(
    private _name: string,
    private _value: Boolean,
  ) { }
  get type() { return this._type }
  get name() { return this._name }
  get originValue() { return this._value }
  getValue() { return this._value }
  toString() { return this._value.toString() }
  like(reg: string) {
    const validator = fieldLikeRegValdate(reg)
    if (typeof validator == 'function') {
      return validator(this.toString())
    }
    return false
  }
  setValue(value) {
    this._value = Boolean(value)
  }
  sort(target) {
    const sortTarget = target as DbBoolField
    return Number(sortTarget.getValue()) - Number(this.getValue())
  }
}

export function createField(name: string, val: unknown): DbField<unknown> {
  if (typeof val == 'string') {
    return new DbStringField(name, val)
  }
  if (typeof val == 'number') {
    return new DbNumberField(name, val)
  }
  if (typeof val == 'boolean') {
    return new DbBoolField(name, val)
  }
  if (val instanceof Date) {
    return new DbDateField(name, val)
  }
  return new DbStringField(name, String(val))
}