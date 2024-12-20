import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, merge, tap, throwError } from 'rxjs';
import { UserService } from 'src/app/shared/services/user.service';
import { WidgetService } from 'src/app/shared/services/widget.service';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public displayedColumns: string[] = ['name', 'email', 'actions'];
  public dataSource = new MatTableDataSource<any>();
  public tableLength!: number;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  public sort!: MatSort;
  @Output() search = new FormControl('');

  @Output() public pageHeader: PageHeader = {
    title: 'Usuários',
    description: 'Listagem de usuários cadastrados no sistema',
    button: {
      text: 'Novo usuário',
      routerLink: '/user/new',
      icon: 'add',
    },
  };

  constructor(
    private userService: UserService,
    private widGetService: WidgetService
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

    this.load();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.load()))
      .subscribe();
  }

  load(): void {
    this.userService.index(this.search.value ? this.search.value : '',
      'name', 'name', this.paginator?.page ? (this.paginator?.pageIndex + 1).toString() : '1',
      this.paginator?.pageSize ? (this.paginator?.pageSize).toString() : '10').pipe(
      map(res => {
        this.dataSource.data = res.data;
        this.tableLength = res.meta.total;
      })
    ).subscribe();
  }

  deactivate(id: string): void {
    this.widGetService.modalQuestion({
      deleted: false
    }).afterClosed().subscribe(res => {
      if (res === true) {
        this.loadingFull.active = true;
        this.userService.destroy(id).pipe(
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
}
