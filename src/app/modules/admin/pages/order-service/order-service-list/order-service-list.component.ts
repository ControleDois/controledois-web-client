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
  ignoreElements,
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

@Component({
  selector: 'app-order-service-list',
  templateUrl: './order-service-list.component.html',
})
export class OrderServiceListComponent implements OnInit, AfterViewInit {
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
}
