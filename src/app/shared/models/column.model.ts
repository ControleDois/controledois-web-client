import { TaskBoard } from "src/app/modules/admin/interfaces/task.board.interface";

export class Column {
  constructor(public name: string, public id: string, public tasks: TaskBoard[]) {}
}
