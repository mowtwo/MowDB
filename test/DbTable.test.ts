import DbTable from "../src/DbTable";
import { Eq, Ge, Le, Like, Lt, OprPipe } from "../src/FindOpr";

class Entity {
  constructor(
    public name: string,
    public age: number,
    public birth: Date
  ) { }
}

const table = new DbTable<Entity>('user')

table.add(new Entity('mowtwo', 10, new Date('1998/06/09')))
  .add(new Entity('mowtwo', 20, new Date('1998/06/09')))
  .add(new Entity('mow', 30, new Date('1998/06/09')))
  .add(new Entity('mowOne', 40, new Date('1998/06/09')))
  .add(new Entity('thismow', 50, new Date('1998/06/09')))
  .add(new Entity('thismow', 50, new Date('1998/06/09')))
  .add(new Entity('thismow', 50, new Date('1998/06/09')))
  .add(new Entity('thismow', 50, new Date('1998/06/09')))
  .add(new Entity('thismow', 50, new Date('1998/06/09')))
  .add(new Entity('thismow', 50, new Date('1998/06/09')))
  .add(new Entity('thismow', 50, new Date('1998/06/09')))
console.log(table.find({
  take: 3,
  skip: 2
}).toObject())