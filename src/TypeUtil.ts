export interface CtorOf<T> {
  new(...args: any[]): T
}