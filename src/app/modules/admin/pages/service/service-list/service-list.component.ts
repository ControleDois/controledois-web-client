import {AfterViewInit, Component, OnInit, Output, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {merge, throwError} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, finalize, map, tap} from 'rxjs/operators';
import { ServiceService } from 'src/app/shared/services/service.service';
import {WidgetService} from 'src/app/shared/services/widget.service';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { FormControl } from '@angular/forms';
import { PageHeader } from '../../../interfaces/page-header.interface';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
})
export class ServiceListComponent implements OnInit, AfterViewInit {
  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public displayedColumns: string[] = [
    'name',
    'sale_value',
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
    title: 'Serviços',
    description: 'Lista de serviços cadastrados no sistema',
    button: {
      text: 'Novo Serviço',
      routerLink: '/service/new',
      icon: 'add',
    },
  };

  constructor(
    private serviceService: ServiceService,
    private widGetService: WidgetService
  ) {
  }

  ngOnInit(): void {
    this.search.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        map(() => {
          this.paginator.pageIndex = 0;
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
    this.serviceService.index(this.search.value ? this.search.value : '',
    'name',
    'name',
    (this.paginator && this.paginator.pageIndex + 1) || 1,
    (this.paginator && this.paginator.pageSize) || 10).pipe(
      map(res => {
        this.dataSource.data = res.data;
        this.tableLength = res.meta.total;
      })
    ).subscribe();
  }

  getKind(kind: number): string {
    switch (kind) {
      case 0:
        return 'Prestado';
      case 1:
        return 'Tomado';
      case 2:
        return 'Prestado e Tomado';
      default:
        return 'Prestado'
    }
  }

  delete(id: string): void {
    this.widGetService.modalQuestion({
      deleted: true
    }).afterClosed().subscribe(res => {
      if (res === true) {
        this.loadingFull.active = true;
        this.serviceService.destroy(id).pipe(
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
        this.serviceService.destroy(id).pipe(
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
