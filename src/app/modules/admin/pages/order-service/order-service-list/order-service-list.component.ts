import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  tap,
} from 'rxjs/operators';
import { merge, throwError } from 'rxjs';
import { DatePipe } from '@angular/common';
import { OsService } from 'src/app/shared/services/os.service';
import { WidgetService } from 'src/app/shared/services/widget.service';
import { LibraryService } from 'src/app/shared/services/library.service';
import { OrderServiceViewComponent } from '../../report/order-service-view/order-service-view.component';
import { MatDialog } from '@angular/material/dialog';
import html2pdf from 'html2pdf.js'
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';

@Component({
  selector: 'app-order-service-list',
  templateUrl: './order-service-list.component.html',
})
export class OrderServiceListComponent implements OnInit, AfterViewInit {
  private orderServices: Array<any> = [];
  public filterStatus = 4;
  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public displayedColumns: string[] = [
    'id',
    'date_start',
    'client',
    'status',
    'responsible',
    'actions',
  ];
  public dataSource = new MatTableDataSource<any>();
  public tableLength!: number;
  public vDateFilter = new Date();
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  public sort!: MatSort;
  @Output() search = new FormControl('');
  @ViewChild('priceListPDF', { static: true, read: ViewContainerRef })
  priceListPDF!: ViewContainerRef;

  @Output() public pageHeader: PageHeader = {
    title: 'Ordens de Serviço',
    description: 'Listagem de ordens de serviço',
    button: {
      text: 'Nova Ordem de Serviço',
      routerLink: '/os/new',
      icon: 'add',
    },
  };

  constructor(
    private osService: OsService,
    private widGetService: WidgetService,
    private datePipe: DatePipe,
    private readonly resolver: ComponentFactoryResolver,
    private dialogReport: MatDialog,
    public libraryService: LibraryService
  ) {}

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
    this.sort = this.sort;
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.load()))
      .subscribe();
  }

  load(): void {
    this.osService
      .index(
        this.search.value ? this.search.value : '',
        this.datePipe.transform(this.vDateFilter, 'yyyy-MM-dd'),
        'desc',
        'id',
        (this.paginator && this.paginator.pageIndex) + 1 || 0,
        (this.paginator && this.paginator.pageSize) || 10
      )
      .pipe(
        map((res) => {
          this.orderServices = res.data;
          this.dataSource.data = res.data;
          this.tableLength = res.total;
        })
      )
      .subscribe();
  }

  delete(id: string): void {
    this.widGetService
      .modalQuestion({
        deleted: true,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res === true) {
          this.loadingFull.active = true;
          this.osService
            .destroy(id)
            .pipe(
              finalize(() => (this.loadingFull.active = false)),
              catchError((error) => {
                return throwError(error);
              }),
              map(() => {
                this.load();
              })
            )
            .subscribe();
        }
      });
  }

  getStatus(element: any): string {
    switch (element.status) {
      case 0:
        return 'Orçamento pendente';
      case 1:
        return 'Serviço pendente';
      case 2:
        return 'Em Andamento';
      case 3:
        if (element.isContract) {
          return element.contract_portion;
        } else {
          return 'Concluido';
        }
      default:
        return 'Concluido';
    }
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 0:
        return '#B98E00';
      case 1:
        return '#F43E61';
      case 2:
        return '#2687E9';
      case 3:
        return '#4ab858';
      default:
        return '#4ab858';
    }
  }

  getStatusColorBack(status: number): string {
    switch (status) {
      case 0:
        return '#FFF4CE';
      case 1:
        return '#FCD9E0';
      case 2:
        return '#DBE6FE';
      case 3:
        return '#ddf1de';
      default:
        return '#ddf1de';
    }
  }


  createPDF(id: string): void {
    const factory = this.resolver.resolveComponentFactory(OrderServiceViewComponent);
    const componentRef = this.priceListPDF.createComponent(factory);

    componentRef.instance.os = this.dataSource.data.find(os => os.id === id);

    componentRef.instance.emitter.subscribe(() => {
      const config = {
        html2canvas: {
          scale: 1,
          scrollX: 0,
          scrollY: 0,
        },
      };

      this.print(componentRef.location.nativeElement, config);
      componentRef.destroy();
    });
  }

  private print(content: any, config: any): void {
    html2pdf()
      .set(config)
      .from(content)
      .toPdf()
      .outputPdf('dataurlnewwindow');
  }

  filterPendingBudget(): void {
    this.filterStatus = 0;
    this.dataSource.data = this.orderServices.filter(t => t.status === 0);
  }

  getTotalPendingBudgetQtd(): number {
    return this.orderServices ? this.orderServices.filter(t => t.status === 0).reduce((acc) => acc + 1, 0) : 0;
  }

  filterPendingService(): void {
    this.filterStatus = 1;
    this.dataSource.data = this.orderServices.filter(t => t.status === 1);
  }

  getTotalPendingServiceQtd(): number {
    return this.orderServices ? this.orderServices.filter(t => t.status === 1).reduce((acc) => acc + 1, 0) : 0;
  }

  filterRate(): void {
    this.filterStatus = 2;
    this.dataSource.data = this.orderServices.filter(t => t.status === 2);
  }

  getTotalRateQtd(): number {
    return this.orderServices ? this.orderServices.filter(t => t.status === 2).reduce((acc) => acc + 1, 0) : 0;
  }

  filterCompleted(): void {
    this.filterStatus = 3;
    this.dataSource.data = this.orderServices.filter(t => t.status === 3);
  }

  getTotalCompletedQtd(): number {
    return this.orderServices ? this.orderServices.filter(t => t.status === 3).reduce((acc) => acc + 1, 0) : 0;
  }

  filterTotal(): void {
    this.filterStatus = 4;
    this.dataSource.data = this.orderServices;
  }

  getTotalTotalQtd(): number {
    return this.orderServices.length > 0 ? this.orderServices.filter(t => t)
      .reduce((acc, t) => acc + 1, 0) : 0;
  }

}
