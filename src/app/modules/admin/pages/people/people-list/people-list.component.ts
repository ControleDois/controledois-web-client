import { AfterViewInit, Component, OnInit, Output, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, tap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, throwError } from 'rxjs';
import { FormControl } from "@angular/forms";
import { PeopleService } from 'src/app/shared/services/people.service';
import { WidgetService } from 'src/app/shared/services/widget.service';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { LibraryService } from 'src/app/shared/services/library.service';

@Component({
  selector: 'app-client-list',
  templateUrl: './people-list.component.html',
})
export class PeopleListComponent implements OnInit, AfterViewInit {
  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public displayedColumns: string[] = ['name', 'document', 'actions'];
  public dataSource = new MatTableDataSource<any>();
  public tableLength!: number;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  public sort!: MatSort;
  @Output() search = new FormControl('');

  @Output() public pageHeader: PageHeader = {
    title: 'Pessoas',
    description: 'Listagem de pessoas cadastrados no sistema',
    button: {
      text: 'Nova pessoa',
      routerLink: '/people/new',
      icon: 'add',
    },
  };

  @Output() optionfilterPeopleSelect = new FormControl(-1);

  public optionsfilterPeople = [
    { name: '⦿ Todos', type: -1 },
    { name: '⦿ Usuários', type: 0 },
    { name: '⦿ Empresa', type: 1 },
    { name: '⦿ Cliente', type: 2 },
    { name: '⦿ Fornecedor', type: 3 },
    { name: '⦿ Transportadora', type: 4 },
  ];

  constructor(
    private peopleService: PeopleService,
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

    this.optionfilterPeopleSelect.valueChanges
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
    let paramRoles = {};
    if (this.optionfilterPeopleSelect.value !== -1) {
      paramRoles = {param: 'roles', value: `{${this.optionfilterPeopleSelect.value}}`};
    }

    this.peopleService.index(this.search.value ? this.search.value : '',
    'name', 'name', this.paginator?.page ? (this.paginator?.pageIndex + 1).toString() : '1',
    this.paginator?.pageSize ? (this.paginator?.pageSize).toString() : '10', [
      paramRoles
    ]).pipe(
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
        this.peopleService.destroy(id).pipe(
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
        this.peopleService.destroy(id).pipe(
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
