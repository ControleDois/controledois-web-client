import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { BrandService } from 'src/app/shared/services/brand.service';
import { WidgetService } from 'src/app/shared/services/widget.service';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, merge, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-brand-list',
  templateUrl: './brand-list.component.html',
})
export class BrandListComponent implements OnInit {
  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public displayedColumns: string[] = [
    'name',
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
    title: 'Marcas',
    description: 'Listagem de marcas cadastradas no sistema',
    button: {
      text: 'Nova marca',
      routerLink: '/brand/new',
      icon: 'add',
    },
  };

  constructor(
    private brandService: BrandService,
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
    this.brandService.index(this.search.value ? this.search.value : '',
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
        this.brandService.destroy(id).pipe(
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
