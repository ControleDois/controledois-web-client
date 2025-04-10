import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BoardDataService } from './services/board-data/board-data.service';
import { BoardModalComponent } from './components/modals/board-modal/board-modal.component';
import { Board } from './models/board.model';
import { DeleteModalComponent } from './components/modals/delete-modal/delete-modal.component';
import { TaskModalComponent } from './components/modals/task-modal/task-modal.component';
import { Task } from './models/task.model';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit {
  darkMode = false;

  isSidebarOpen = true;

  boards = this.boardDataService.boards;

  activeBoard = this.boardDataService.activeBoard;

  currentIdx = this.boardDataService.currentIdx;

  constructor(
    private dialog: MatDialog,
    private boardDataService: BoardDataService,
  ) {}

  ngOnInit(): void {
    this.boardDataService.getBoards();
  }

  selectBoard(boardIdx: number) {
    this.boardDataService.selectBoard(boardIdx);
  }

  toggleDarkMode(enableDarkMode: boolean) {
    this.darkMode = enableDarkMode;
  }

  openSideBar(): void {
    this.isSidebarOpen = true;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  addBoard(): void {
    const dialogRef = this.dialog.open(BoardModalComponent, {
      data: { board: { name: '', columns: [] }, darkMode: this.darkMode },
    });

    dialogRef.afterClosed().subscribe((res: Board) => {
      if (!res) {
        return;
      }

      this.boardDataService.addBoard(res);
    });
  }

  editBoard(): void {
    const dialogRef = this.dialog.open(BoardModalComponent, {
      data: {
        board: this.activeBoard() ? this.activeBoard() : { name: '', columns: [] },
        darkMode: this.darkMode,
      },
    });

    dialogRef.afterClosed().subscribe((res: Board) => {
      if (!res) {
        return;
      }

      this.boardDataService.editBoard(res);
    });
  }

  updateBoardAfterTaskReorder(updateBoard: Board) {
    this.boardDataService.editBoard(updateBoard);
  }

  deleteBoard(): void {
    const dialogRef = this.dialog.open(DeleteModalComponent, {
      data: {
        name: this.activeBoard()?.name,
        isBoard: true,
        darkMode: this.darkMode,
      },
    });

    dialogRef.afterClosed().subscribe((success: boolean) => {
      if (!success) {
        return;
      }

      this.boardDataService.deleteBoard();
    });
  }

  addTask(): void {
    const dialogRef = this.dialog.open(TaskModalComponent, {
      data: {
        editMode: false,
        darkMode: this.darkMode,
        columns: this.activeBoard()?.columns,
      },
    });

    dialogRef.afterClosed().subscribe((res: Task) => {
      if (!res) {
        return;
      }

      this.boardDataService.addTask(res);
    });
  }

  editTask(editTask: Task): void {
    const dialogRef = this.dialog.open(TaskModalComponent, {
      data: {
        task: editTask,
        editMode: true,
        darkMode: this.darkMode,
        columns: this.activeBoard()?.columns,
      },
    });

    dialogRef.afterClosed().subscribe((res: Task) => {
      if (!res) {
        return;
      }

      this.updateTask({ task: res, columnName: res.status });
    });
  }

  updateTask(updateTask: { task: Task; columnName: string }) {
    this.boardDataService.updateTask(updateTask);
  }

  deleteTask(deleteTask: Task): void {
    const dialogRef = this.dialog.open(DeleteModalComponent, {
      data: {
        name: deleteTask.title,
        isBoard: false,
        darkMode: this.darkMode,
      },
    });

    dialogRef.afterClosed().subscribe((success: boolean) => {
      if (!success) {
        return;
      }

      this.boardDataService.deleteTask(deleteTask);
    });
  }
}
