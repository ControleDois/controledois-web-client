import { AfterViewInit, Component, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, merge, tap, throwError } from 'rxjs';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { LibraryService } from 'src/app/shared/services/library.service';
import { TaskService } from 'src/app/shared/services/task.service';
import { WidgetService } from 'src/app/shared/services/widget.service';
import { PageHeader } from '../../../interfaces/page-header.interface';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit, AfterViewInit {

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public displayedColumns: string[] = ['user', 'title', 'status', 'actions'];
  public dataSource = new MatTableDataSource<any>();
  public tableLength!: number;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  public sort!: MatSort;
  @Output() search = new FormControl('');
  @Output() optionSelect = new FormControl(0);

  public statusType = [
    { name: '⦿ A Fazer', type: 0 },
    { name: '⦿ Em progresso', type: 1 },
    { name: '⦿ Em Avaliação', type: 2 },
    { name: '⦿ Finalizado', type: 3 },
    { name: '⦿ Cancelado', type: 4 },
  ];

  @Output() public pageHeader: PageHeader = {
    title: 'Tarefas',
    description: 'Listagem de tarefas',
    button: {
      text: 'Nova tarefa',
      routerLink: '/task/new',
      icon: 'add',
    },
  };

  constructor(
    private taskService: TaskService,
    private widGetService: WidgetService,
    public libraryService: LibraryService
  ) {
   }

  ngOnInit(): void {
    this.search.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        map(() => {
          this.load();
        })
      )
      .subscribe();

    this.optionSelect.valueChanges
    .pipe(
      debounceTime(400),
      distinctUntilChanged(),
      map(() => {
        this.load();
      })
    )
    .subscribe();

    this.load();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.load()))
      .subscribe();
  }

  load(): void {
    const search = this.search.value ? this.search.value : ''
    const status = this.optionSelect.value ? this.optionSelect.value : 0

    this.taskService.index(search, status, 'title', 'title', this.paginator?.page ? (this.paginator?.pageIndex + 1).toString() : '1').pipe(
      map(res => {
        this.dataSource.data = res.data;
        this.tableLength = res.meta.total;
      })
    ).subscribe();
  }

  delete(id: string): void {
    this.widGetService.modalQuestion({
      deleted: true
    }).afterClosed().subscribe(res => {
      if (res === true) {
        this.loadingFull.active = true;
        this.taskService.destroy(id).pipe(
          finalize(() => this.loadingFull.active = false),
          catchError((error) => {
            return throwError(error);
          }),
          map(() => {
            this.load();
          })
        ).subscribe();
      }
    });
  }

  deactivate(id: string): void {
    this.widGetService.modalQuestion({
      deleted: false
    }).afterClosed().subscribe(res => {
      if (res === true) {
        this.loadingFull.active = true;
        this.taskService.destroy(id).pipe(
          finalize(() => this.loadingFull.active = false),
          catchError((error) => {
            return throwError(error);
          }),
          map(() => {
            this.load();
          })
        ).subscribe();
      }
    });
  }

  getStatus(element: any): string {
    switch (element.status) {
      case 0:
        return 'A Fazer';
      case 1:
        return 'Em progresso';
      case 2:
        return 'Em Avaliação';
      case 3:
        return 'Finalizado';
      case 4:
        return 'Cancelado';
      default:
        return 'A Fazer';
    }
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 0:
        return '#2687E9';
      case 1:
        return '#B98E00';
      case 2:
        return '#B43118';
      case 3:
        return '#4ab858';
      case 4:
        return '#F43E61';
      default:
        return '#4ab858';
    }
  }

  getStatusColorBack(status: number): string {
    switch (status) {
      case 0:
        return '#DBE6FE';
      case 1:
        return '#FFF4CE';
      case 2:
        return '#FCD9E0';
      case 3:
        return '#ddf1de';
      case 4:
        return '#FCD9E0';
      default:
        return '#ddf1de';
    }
  }

  getUserCreate(users: any): string {
    const user = users.find((user) => user.roles = [0]);

    return user ? user.name : '';
  }
}
