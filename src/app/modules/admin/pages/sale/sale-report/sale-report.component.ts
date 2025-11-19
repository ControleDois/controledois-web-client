import { SelectionModel } from '@angular/cdk/collections';
import { Component, ComponentFactoryResolver, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { Auth } from 'src/app/shared/interfaces/auth.interface';
import { SaleService } from 'src/app/shared/services/sale.service';
import { WidgetService } from 'src/app/shared/services/widget.service';
import { DatePipe } from '@angular/common';
import { LibraryService } from 'src/app/shared/services/library.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { InternetService } from 'src/app/shared/services/internet.service';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, merge, tap, throwError } from 'rxjs';
import { SaleProofViewComponent } from '../../report/sale-proof-view/sale-proof-view.component';
import html2pdf from 'html2pdf.js';
import { ReceivedBoxCentralComponent } from '../../modals/received-box-central/received-box-central.component';
import { SaleReportViewComponent } from '../../report/sale-report-view/sale-report-view.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-sale-report',
  templateUrl: './sale-report.component.html',
  styleUrls: ['./sale-report.component.scss']
})
export class SaleReportComponent implements OnInit {

  private sales: Array<any> = [];
  public filterStatus = 5;
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
    'buttons',
  ];
  public dataSource = new MatTableDataSource<any>();
  public selection = new SelectionModel<any>(true, []);
  public tableLength!: number;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  public sort!: MatSort;
  public vDateFilter = new Date();
  @Output() search = new FormControl('');
  @ViewChild('priceListPDF', { static: true, read: ViewContainerRef })
  priceListPDF!: ViewContainerRef;

  @Output() public pageHeader: PageHeader = {
    title: 'Relatório de Vendas e Orçamentos',
    description: 'Relatório de vendas e Orçamentos por período.',
  };

  //Preciso cadastrar a data inicial e a final para colocar no input data como form control
  public dtInit = new FormControl('');
  public dtEnd = new FormControl('');

  public auth!: Auth;

  constructor(
    private saleService: SaleService,
    private widGetService: WidgetService,
    private datePipe: DatePipe,
    public libraryService: LibraryService,
    private readonly resolver: ComponentFactoryResolver,
    private notificationService: NotificationService,
    private storageService: StorageService,
    private dialog: MatDialog,
    private internetService: InternetService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.auth = storageService.getAuth();
  }

  ngOnInit(): void {
    this.definirDatas();

    this.search.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        map(() => {
          this.load();
        })
      )
      .subscribe();

    this.dtInit.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        map(() => {
          this.load();
        })
      )
      .subscribe();

    this.dtEnd.valueChanges
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

  definirDatas() {
    const currentDate = new Date();

    // Cria uma cópia da data para não alterar a currentDate original ao subtrair
    const priorDate = new Date();
    priorDate.setDate(currentDate.getDate() - 30);

    // Passa o valor formatado YYYY-MM-DD
    this.dtInit.setValue(this.formatDate(priorDate));
    this.dtEnd.setValue(this.formatDate(currentDate));
  }

  // Função auxiliar para formatar YYYY-MM-DD
  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  load(): void {
    this.saleService.report(this.search.value ? this.search.value : '',
      this.datePipe.transform(this.dtInit.value, 'yyyy-MM-dd'), this.datePipe.transform(this.dtEnd.value, 'yyyy-MM-dd'), 'date_sale', 'date_sale',
      this.paginator?.page ? (this.paginator?.pageIndex + 1).toString() : '1',
      '10000').pipe(
      map(res => {
        this.sales = res.data;
        this.dataSource.data = res.data;
        this.tableLength = res.meta.total;
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
        if (element.is_contract) {
          return element.contract_portion;
        } else {
          if (element.nfe) {
            return `Venda com ${element.modelo === 65 ? 'NFCe' : 'NFe'} (${element.serie}-${element.numero})`;
          } else {
            return 'Venda';
          }
        }
      case 4:
        if (element.is_contract) {
          return element.contract_portion;
        } else {
          if (element.nfe) {
            return `Venda com ${element.nfe.modelo === 65 ? 'NFCe' : 'NFe'} (${element.nfe.serie}-${element.nfe.numero})`;
          } else {
            return 'Venda';
          }
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
    //Buscar status 3 ou 4
    this.dataSource.data = this.sales.length > 0 ? this.sales.filter(t => t.status === 3 || t.status === 4) : [];
  }

  filterAmountSaleBoxCentral(): void {
    this.filterStatus = 4;
    this.dataSource.data = this.sales.length > 0 ? this.sales.filter(t => t.status === 4) : [];
  }

  getTotalAmountSaleQtd(): number {
    return this.sales.length > 0 ? this.sales.filter(t => t.status === 3 || t.status === 4).reduce((acc) => acc + 1, 0) : 0;
  }

  getTotalAmountSaleBoxCentralQtd(): number {
    return this.sales.length > 0 ? this.sales.filter(t => t.status === 4).reduce((acc) => acc + 1, 0) : 0;
  }

  getTotalAmountSale(): string {
    const total = this.sales.length > 0 ? this.sales.filter(t => t.status === 3 || t.status === 4)
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.net_total) || 0), 0) : 0;
    return total > 0 ? parseFloat(total).toFixed(2) : '0.00';
  }

  getTotalAmountSaleBoxCentral(): string {
    const total = this.sales.length > 0 ? this.sales.filter(t => t.status === 4)
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.net_total) || 0), 0) : 0;
    return total > 0 ? parseFloat(total).toFixed(2) : '0.00';
  }

  filterAmountTotal(): void {
    this.filterStatus = 5;
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

  receiveSaleBoxCentral(id: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = false;
    dialogConfig.width = '1020px';
    dialogConfig.data = id;
    dialogConfig.minHeight = '480px';
    dialogConfig.maxHeight = '720px';

    //Se fechar o modal, atualizar a lista
    const dialogRef = this.dialog.open(ReceivedBoxCentralComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => {
      this.load();
    });
  }

  showReportSale(id: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = false;
    dialogConfig.data = { id: id };

    // Verifica se é Mobile (Celular)
    const isMobile = this.breakpointObserver.isMatched(Breakpoints.Handset);

    if (isMobile) {
      // Configuração para Tela Inteira
      dialogConfig.width = '100vw'; // Largura total da viewport
      dialogConfig.height = '100vh'; // Altura total da viewport
      dialogConfig.maxWidth = '100vw'; // Importante: sobrescreve o limite padrão do Material
      dialogConfig.maxHeight = '100vh';
    } else {
      // Configuração Original (Desktop)
      dialogConfig.width = '920px';
      dialogConfig.maxHeight = '550px';
    }

    this.dialog.open(SaleReportViewComponent, dialogConfig);
  }
}
