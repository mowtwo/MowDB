import { DbTable } from "../src";
import DbContext from "../src/DbContext";
import { Eq } from "../src/FindOpr";

enum Gender {
  Male,
  Female,
  Unkown
}

class User {
  constructor(
    public account: string,
    public password: string
  ) { }
}
class UserInfo {
  constructor(
    public uid: number | string,
    public name: string,
    public age: number,
    public gender: Gender
  ) { }
}

const ctx = new DbContext('demo')
const user = ctx.createTable('User', User)
const info = ctx.createTable('Info', UserInfo)

ctx.insert(user, 'admin', 'admin')
ctx.insert(info, 1, 'mowtwo', 22, Gender.Male)
const res = ctx.find(user, {
  relation: {
    sub: info,
    masterKey: 'id',
    subKey: 'uid'
  }
})

console.log(JSON.stringify(res))