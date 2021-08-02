import DbTable from "../src/DbTable";
import { Eq, Ge, Le, Like, Lt, OprPipe } from "../src/FindOpr";
import * as dayjs from "dayjs"

class Entity {
  constructor(
    public name: string,
    public age: number,
    public birth: Date
  ) { }
}

const table = new DbTable<Entity>('user')

table.add(new Entity('mowtwo', 10, new Date('1998/06/01')))
  .add(new Entity('mowtwo', 20, new Date('1998/06/02')))
  .add(new Entity('mow', 30, new Date('1998/06/03')))
  .add(new Entity('mowOne', 40, new Date('1998/06/04')))
  .add(new Entity('thismow', 50, new Date('1998/06/05')))
  .add(new Entity('thismow', 50, new Date('1998/06/06')))
  .add(new Entity('thismow', 50, new Date('1998/06/07')))
  .add(new Entity('thismow', 50, new Date('1998/06/08')))
  .add(new Entity('thismow', 50, new Date('1998/06/09')))
  .add(new Entity('thismow', 50, new Date('1998/06/10')))
  .add(new Entity('thismow', 50, new Date('1998/06/11')))
console.log(table.find({
  birth: OprPipe(
    Ge(new Date('1998/06/03')),
    Lt(new Date('1998/06/09'))
  ),
  groupBy: ['birth', 'age']
}).toArray().map(item => {
  return {
    ...item,
    birth: dayjs(item.birth).format('YYYY-MM-DD')
  }
}))