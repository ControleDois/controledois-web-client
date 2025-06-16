import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, merge, tap, throwError } from 'rxjs';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { TransportRouteService } from 'src/app/shared/services/transport-route.service';
import { WidgetService } from 'src/app/shared/services/widget.service';
import { PageHeader } from '../../../interfaces/page-header.interface';

@Component({
  selector: 'app-transport-route-list',
  templateUrl: './transport-route-list.component.html',
})
export class TransportRouteListComponent implements OnInit {
  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public displayedColumns: string[] = ['uf_origin', 'uf_destination', 'actions'];
  public dataSource = new MatTableDataSource<any>();
  public tableLength!: number;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  public sort!: MatSort;
  @Output() search = new FormControl('');

  public stateList = [
    { name: 'Acre', type: 'AC' },
    { name: 'Alagoas', type: 'AL' },
    { name: 'Amapá', type: 'AP' },
    { name: 'Amazonas', type: 'AM' },
    { name: 'Bahia', type: 'BA' },
    { name: 'Ceará', type: 'CE' },
    { name: 'Distrito Federal', type: 'DF' },
    { name: 'Espírito Santo', type: 'ES' },
    { name: 'Goiás', type: 'GO' },
    { name: 'Maranhão', type: 'MA' },
    { name: 'Mato Grosso', type: 'MT' },
    { name: 'Mato Grosso do Sul', type: 'MS' },
    { name: 'Minas Gerais', type: 'MG' },
    { name: 'Pará', type: 'PA' },
    { name: 'Paraíba', type: 'PB' },
    { name: 'Paraná', type: 'PR' },
    { name: 'Pernambuco', type: 'PE' },
    { name: 'Piauí', type: 'PI' },
    { name: 'Rio de Janeiro', type: 'RJ' },
    { name: 'Rio Grande do Norte', type: 'RN' },
    { name: 'Rio Grande do Sul', type: 'RS' },
    { name: 'Rondônia', type: 'RO' },
    { name: 'Roraima', type: 'RR' },
    { name: 'Santa Catarina', type: 'SC' },
    { name: 'São Paulo', type: 'SP' },
    { name: 'Sergipe', type: 'SE' },
    { name: 'Tocantins', type: 'TO' }
  ];

  @Output() public pageHeader: PageHeader = {
    title: 'Rotas de transporte',
    description: 'Gerencie as rotas de transporte',
    button: {
      text: 'Nova rota',
      routerLink: '/transport-route/new',
      icon: 'add',
    },
  };

  constructor(
    private transportRouteService: TransportRouteService,
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
    this.transportRouteService.index(this.search.value ? this.search.value : '', 'name', 'name', this.paginator?.page ? (this.paginator?.pageIndex + 1).toString() : '1').pipe(
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
        this.transportRouteService.destroy(id).pipe(
          finalize(() => this.loadingFull.active  = false),
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
        this.transportRouteService.destroy(id).pipe(
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

  //Busca Estado pela uf
  getState(uf: string): string {
    const state = this.stateList.find((state) => state.type === uf);
    return state ? state.name : '';
  }
}
