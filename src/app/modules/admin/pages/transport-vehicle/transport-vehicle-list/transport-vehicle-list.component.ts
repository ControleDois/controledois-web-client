import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, merge, tap, throwError } from 'rxjs';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { LibraryService } from 'src/app/shared/services/library.service';
import { TransportVehicleService } from 'src/app/shared/services/transport-vehicle.service';
import { WidgetService } from 'src/app/shared/services/widget.service';
import { PageHeader } from '../../../interfaces/page-header.interface';

@Component({
  selector: 'app-transport-vehicle-list',
  templateUrl: './transport-vehicle-list.component.html',
})
export class TransportVehicleListComponent implements OnInit {
  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public displayedColumns: string[] = ['plate', 'renavam', 'transport_type', 'vehicle_type', 'wheeled_type', 'body_type', 'actions'];
  public dataSource = new MatTableDataSource<any>();
  public tableLength!: number;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  public sort!: MatSort;
  @Output() search = new FormControl('');

  @Output() public pageHeader: PageHeader = {
    title: 'Veículos de Transporte',
    description: 'Listagem de veículos de transporte',
    button: {
      text: 'Novo Veículo',
      routerLink: '/transport-vehicle/new',
      icon: 'add',
    },
  };

  constructor(
    private transportVehicleService: TransportVehicleService,
    private widGetService: WidgetService,
    public libraryService: LibraryService
  ) {}

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
    this.transportVehicleService.index(this.search.value ? this.search.value : '', 'name', 'name', this.paginator?.page ? (this.paginator?.pageIndex + 1).toString() : '1').pipe(
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
        this.transportVehicleService.destroy(id).pipe(
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
        this.transportVehicleService.destroy(id).pipe(
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

  //Buca tipo de transporte
  getTransportType(type: number): string {
    switch (type) {
      case 0:
        return 'Transporte Próprio';
      case 1:
        return 'Transporte Terceirizado';
      default:
        return '';
    }
  }

  //Busca tipo de veículo
  getVehicleType(type: number): string {
    switch (type) {
      case 0:
        return 'Tração/Cavalo';
      case 1:
        return 'Reboque/Carreta';;
      default:
        return '';
    }
  }

  //Busca tipo de rodado
  getWheeledType(type: string): string {
    switch (type) {
      case '01':
        return 'Truck';
      case '02':
        return 'Toco';
      case '03':
        return 'Cavalo Mecânico';
      case '04':
        return 'Van';
      case '05':
        return 'Utilitário';
      case '06':
        return 'Outros';
      default:
        return '';
    }
  }

  //Busca tipo de carroceria
  getBodyType(type: string): string {
    switch (type) {
      case '00':
        return 'Não Aplicável';
      case '01':
        return 'Aberto';
      case '02':
        return 'Fechado/Baú';
      case '03':
        return 'Graneleiro';
      case '04':
        return 'Porta Container';
      case '05':
        return 'Side';
      default:
        return '';
    }
  }
}
