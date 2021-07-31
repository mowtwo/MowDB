import { DbTable } from "../src";
import DbContext from "../src/DbContext";
import { Eq } from "../src/FindOpr";

enum Gender {
  Male,
  Female,
  Unkown
}

class Entity {
  constructor(
    public name: string,
    public age: number,
    public gender: Gender
  ) { }
}

const ctx = new DbContext('demo')
const tb = ctx.createTable('test', Entity)

ctx.insert(tb, 'mowtwo', 23, Gender.Male)
const getTb = tb.call(ctx) as DbTable<Entity>

console.log(getTb.find().toArray())
getTb.update({
  name: Eq('mowtwo')
}, {
  age: 2
})
console.log(getTb.find().toArray())