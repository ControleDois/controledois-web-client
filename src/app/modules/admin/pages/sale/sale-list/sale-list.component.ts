import {Component, ComponentFactoryResolver, OnInit, Output, ViewChild, ViewContainerRef} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {throwError} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, finalize, map} from 'rxjs/operators';
import {SelectionModel} from '@angular/cdk/collections';
import {FormControl} from '@angular/forms';
import {DatePipe} from '@angular/common';
import { SaleService } from 'src/app/shared/services/sale.service';
import { WidgetService } from 'src/app/shared/services/widget.service';
import { LibraryService } from 'src/app/shared/services/library.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SaleProofViewComponent } from '../../report/sale-proof-view/sale-proof-view.component';
import html2pdf from 'html2pdf.js'
import { NotificationService } from 'src/app/shared/services/notification.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';

@Component({
  selector: 'app-sale-list',
  templateUrl: './sale-list.component.html',
})
export class SaleListComponent implements OnInit {
  private sales: Array<any> = [];
  public filterStatus = 4;
  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public displayedColumns: string[] = [
    'select',
    'id',
    'date',
    'people',
    'status',
    'net_total',
    'actions'
  ];
  public dataSource = new MatTableDataSource<any>();
  public selection = new SelectionModel<any>(true, []);
  @ViewChild(MatSort)
  public sort!: MatSort;
  public vDateFilter = new Date();
  @Output() search = new FormControl('');
  @ViewChild('priceListPDF', { static: true, read: ViewContainerRef })
  priceListPDF!: ViewContainerRef;

  constructor(
    private saleService: SaleService,
    private widGetService: WidgetService,
    private datePipe: DatePipe,
    public libraryService: LibraryService,
    private dialogReport: MatDialog,
    private readonly resolver: ComponentFactoryResolver,
    private notificationService: NotificationService,
    private storageService: StorageService,
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

  load(): void {
    this.sales = this.storageService.getList(`listSales`);
    this.dataSource.data = this.sales;

    this.saleService.index(this.search.value ? this.search.value : '', this.datePipe.transform(this.vDateFilter, 'yyyy-MM-dd'), 'date_sale', 'date_sale').pipe(
      map(res => {
        this.storageService.setList(`listSales`, res.data);
        this.sales = res.data;
        this.dataSource.data = res.data;
      })
    ).subscribe();
  }

  getStatus(element: any): string {
    switch (element.status) {
      case 0:
        return 'Em orçamento';
      case 1:
        return 'Orçamento aceito';
      case 2:
        return 'Orçamento recusado';
      case 3:
        if (element.isContract) {
          return element.contract_portion;
        } else {
          return 'Venda';
        }
      default:
        return 'Venda'
    }
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 0:
        return '#B98E00';
      case 1:
        return '#4ab858';
      case 2:
        return '#F43E61';
      case 3:
        return '#2687E9';
      default:
        return '#2687E9'
    }
  }

  getStatusColorBack(status: number): string {
    switch (status) {
      case 0:
        return '#FFF4CE';
      case 1:
        return '#ddf1de';
      case 2:
        return '#FCD9E0';
      case 3:
        return '#DBE6FE';
      default:
        return '#DBE6FE'
    }
  }

  delete(id: string): void {
    this.widGetService.modalQuestion({
      deleted: true
    }).afterClosed().subscribe(res => {
      if (res === true) {
        this.loadingFull.active = true;
        this.saleService.destroy(id).pipe(
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

  filterAmountRefused(): void {
    this.filterStatus = 2;
    this.dataSource.data = this.sales.filter(t => t.status === 2);
  }

  getTotalAmountRefusedQtd(): number {
    return this.sales ? this.sales.filter(t => t.status === 2).reduce((acc) => acc + 1, 0) : 0;
  }

  getTotalAmountRefused(): string {
    const total = this.sales.length > 0 ? this.sales.filter(t => t.status === 2)
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.net_total) || 0), 0) : 0;
    return total > 0 ? parseFloat(total).toFixed(2) : '0.00';
  }

  filterAmountBudget(): void {
    this.filterStatus = 0;
    this.dataSource.data = this.sales.length > 0 ? this.sales.filter(t => t.status === 0) : [];
  }

  getTotalAmountBudgetQtd(): number {
    return this.sales.length > 0 ? this.sales.filter(t => t.status === 0).reduce((acc) => acc + 1, 0) : 0;
  }

  getTotalAmountBudget(): string {
    const total = this.sales.length > 0 ? this.sales.filter(t => t.status === 0)
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.net_total) || 0), 0) : 0;
    return total > 0 ? parseFloat(total).toFixed(2) : '0.00';
  }

  filterAmountAccepted(): void {
    this.filterStatus = 1;
    this.dataSource.data = this.sales.length > 0 ? this.sales.filter(t => t.status === 1): [];
  }

  getTotalAmountAcceptedQtd(): number {
    return this.sales.length > 0 ? this.sales.filter(t => t.status === 1).reduce((acc) => acc + 1, 0) : 0;
  }

  getTotalAmountAccepted(): string {
    const total = this.sales.length > 0 ? this.sales.filter(t => t.status === 1)
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.net_total) || 0), 0) : 0;
    return total > 0 ? parseFloat(total).toFixed(2) : '0.00';
  }

  filterAmountSale(): void {
    this.filterStatus = 3;
    this.dataSource.data = this.sales.length > 0 ? this.sales.filter(t => t.status === 3) : [];
  }

  getTotalAmountSaleQtd(): number {
    return this.sales.length > 0 ? this.sales.filter(t => t.status === 3).reduce((acc) => acc + 1, 0) : 0;
  }

  getTotalAmountSale(): string {
    const total = this.sales.length > 0 ? this.sales.filter(t => t.status === 3)
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.net_total) || 0), 0) : 0;
    return total > 0 ? parseFloat(total).toFixed(2) : '0.00';
  }

  filterAmountTotal(): void {
    this.filterStatus = 4;
    this.dataSource.data = this.sales;
  }

  getTotalAmountTotalQtd(): number {
    return this.sales.length > 0 ? this.sales.filter(t => t.status !== 2).reduce((acc) => acc + 1, 0): 0;
  }

  getTotal(): string {
    const total = this.sales.length > 0 ? this.sales.filter(t => t.status !== 2)
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.net_total) || 0), 0) : 0;
    return total > 0 ? parseFloat(total).toFixed(2) : '0.00';
  }

  getTotalSale(): string {
    return this.sales.length > 0 ? this.sales.filter(t => t)
      .reduce((acc, t) => acc + 1, 0) : 0;
  }

  getTotalSaleSelected(): number {
    return this.selection.selected.length;
  }

  getSumTotalSaleSelected(): string {
    const total = this.dataSource.data.filter(t => this.selection.isSelected(t))
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.net_total) || 0), 0);
    return total > 0 ? parseFloat(total).toFixed(2) : '0.00';
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  createPDFNow(id: string, products: any, plots: any): void {
    const factory = this.resolver.resolveComponentFactory(SaleProofViewComponent);
    const componentRef = this.priceListPDF.createComponent(factory);

    componentRef.instance.data = this.dataSource.data.find(sale => sale.id === id);
    componentRef.instance.products = products;
    componentRef.instance.plots = plots;

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

  createPDF(id: string): void {
    this.loadingFull.active = true;
    this.saleService.show(id).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
      this.notificationService.warn('Dados não encontrados...');
        return throwError(error);
      }),
      map((res) => {
        this.createPDFNow(id, res.products, res.bills);
      })
    ).subscribe();
  }

  private print(content: any, config: any): void {
    html2pdf()
      .set(config)
      .from(content)
      .toPdf()
      .outputPdf('dataurlnewwindow');
  }
}
