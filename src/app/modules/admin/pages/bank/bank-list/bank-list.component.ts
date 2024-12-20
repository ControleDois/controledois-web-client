import {AfterViewInit, Component, OnInit, Output, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {merge, throwError} from "rxjs";
import {catchError, debounceTime, distinctUntilChanged, finalize, map, tap} from "rxjs/operators";
import { BankService } from 'src/app/shared/services/bank.service';
import { WidgetService } from 'src/app/shared/services/widget.service';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-bank-list',
  templateUrl: './bank-list.component.html',
})
export class BankListComponent implements OnInit, AfterViewInit {
  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public displayedColumns: string[] = [
    'name',
    'balance',
    'actions'
  ];
  public dataSource = new MatTableDataSource<any>();
  public tableLength!: number;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  public sort!: MatSort;
  @Output() search = new FormControl('');

  @Output() public pageHeader: PageHeader = {
    title: 'Contas bancárias',
    description: 'Listagem de contas cadastradas no sistema',
    button: {
      text: 'Nova conta',
      routerLink: '/bank/new',
      icon: 'add',
    },
  };

  constructor(
    private bankService: BankService,
    private widGetService: WidgetService,
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
    this.bankService.index(this.search.value ? this.search.value : '',
      'name', 'name', this.paginator?.page ? (this.paginator?.pageIndex + 1).toString() : '1',
      this.paginator?.pageSize ? (this.paginator?.pageSize).toString() : '10').pipe(
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
        this.bankService.destroy(id).pipe(
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
