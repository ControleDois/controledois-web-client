import {AfterViewInit, Component, OnInit, Output, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {merge, throwError} from "rxjs";
import {catchError, debounceTime, distinctUntilChanged, finalize, map, tap} from "rxjs/operators";
import {SelectionModel} from "@angular/cdk/collections";
import {FormControl} from "@angular/forms";
import {DatePipe} from "@angular/common";
import { BillPaymentService } from 'src/app/shared/services/bill-payment.service';
import { WidgetService } from 'src/app/shared/services/widget.service';
import { LibraryService } from 'src/app/shared/services/library.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-bill-payment-list',
  templateUrl: './bill-payment-list.component.html',
})
export class BillPaymentListComponent implements OnInit, AfterViewInit {
  private bills: Array<any> = [];
  public filterStatus = 0;
  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public displayedColumns: string[] = [
    'select',
    'date',
    'form_payment',
    'name',
    'people',
    'value',
    'status',
    'actions'
  ];
  public dataSource = new MatTableDataSource<any>();
  public selection = new SelectionModel<any>(true, []);
  public tableLength!: number;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  public sort!: MatSort;

  public vDateFilter: Date = new Date();
  @Output() search = new FormControl('');

  public formPaymentList = [
    { name: '⦿ Boleto Bancário', type: 0 },
    { name: '⦿ Cartão de Crédito', type: 1 },
    { name: '⦿ Cartão de Débito', type: 2 },
    { name: '⦿ Carteira Digital', type: 3 },
    { name: '⦿ Cashback', type: 4 },
    { name: '⦿ Cheque', type: 5 },
    { name: '⦿ Credito da Loja', type: 6 },
    { name: '⦿ Crédito Virtual', type: 7 },
    { name: '⦿ Depósito Bancário', type: 8 },
    { name: '⦿ Dinheiro', type: 9 },
    { name: '⦿ PIX', type: 10 },
    { name: '⦿ Programa de Fidelidade', type: 11 },
    { name: '⦿ Transferência Bancária', type: 12 },
    { name: '⦿ Vale Alimentação', type: 13 },
    { name: '⦿ Vale Combustível', type: 14 },
    { name: '⦿ Vale Presente', type: 15 },
    { name: '⦿ Vale Refeição', type: 16 },
  ];

  @Output() public pageHeader: PageHeader = {
    title: 'Contas a Pagar',
    description: 'Listagem de contas a pagar',
    button: {
      text: 'Nova conta',
      routerLink: '/bill-payment/new',
      icon: 'add',
    },
  };

  constructor(
    private billPaymentService: BillPaymentService,
    private widGetService: WidgetService,
    private datePipe: DatePipe,
    private notificationService: NotificationService,
    public libraryService: LibraryService,
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
    this.dataSource.filterPredicate = (data, filter: string) => {
      return data.date_due.toLowerCase().includes(filter) ||
        data.date_received.toLowerCase().includes(filter) ||
        data.bill_value.toLowerCase().includes(filter) ||
        data.amount.toLowerCase().includes(filter) ||
        data.category.name.toLowerCase().includes(filter) ||
        data?.people?.name.toLowerCase().includes(filter) ||
        data.name.toLowerCase().includes(filter);
    };
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.load()))
      .subscribe();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  load(): void {
    this.bills = this.storageService.getList(`listPaymentBills`);
    this.dataSource.data = this.bills;

    this.billPaymentService.index(this.search.value ? this.search.value : '',
      this.datePipe.transform(this.vDateFilter, 'yyyy-MM-dd'), 'date_sale', 'date_sale',
      this.paginator?.page ? (this.paginator?.pageIndex + 1).toString() : '1',
      this.paginator?.pageSize ? (this.paginator?.pageSize).toString() : '10').pipe(
      map(res => {
        this.storageService.setList(`listPaymentBills`, res.data);
        this.bills = res.data;
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
        this.billPaymentService.destroy(id).pipe(
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

  getTotalBillValue(): string {
    const total = this.bills.length > 0 ? this.bills.filter(t => t.status === 1)
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.bill_value) || 0), 0) : 0;
    return total > 0 ? `-` + parseFloat(total).toFixed(2) : '0.00';
  }

  filterBillValue(): void {
    this.filterStatus = 1;
    this.dataSource.data = this.bills.length > 0 ? this.bills.filter(t => t.status === 1) : [];
  }

  getTotalBillValueQtd(): number {
    return this.bills.length > 0 ? this.bills.filter(t => t.status === 1)
      .reduce((acc, t) => acc + 1, 0) : 0;
  }

  getTotalAmountQtd(): number {
    return this.bills.length > 0 ? this.bills.filter(t => t.status === 0 && new Date(t.date_due) > new Date())
      .reduce((acc, t) => acc + 1, 0) : 0;
  }

  getTotalAmount(): string {
    const total = this.bills.length > 0 ? this.bills.filter(t => t.status === 0 && new Date(t.date_due) > new Date())
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.amount) || 0), 0) : 0;
    return total > 0 ? `-` + parseFloat(total).toFixed(2) : '0.00';
  }

  filterAmount(): void {
    this.filterStatus = 2;
    this.dataSource.data = this.bills.length > 0 ? this.bills.filter(t => t.status === 0 && new Date(t.date_due) > new Date()) : [];
  }

  getTotalAmountDateDueQtd(): number {
    return this.bills.length > 0 ? this.bills.filter(t => t.status === 0 && new Date(t.date_due) < new Date())
      .reduce((acc, t) => acc + 1, 0): 0;
  }

  getTotalAmountDateDue(): string {
    const total = this.bills.length > 0 ? this.bills.filter(t => t.status === 0 && new Date(t.date_due) < new Date())
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.amount) || 0), 0) : 0;
    return total > 0 ? `-` + parseFloat(total).toFixed(2) : '0.00';
  }

  filterAmountDateDue(): void {
    this.filterStatus = 3;
    this.dataSource.data = this.bills.length > 0 ? this.bills.filter(t => t.status === 0 && new Date(t.date_due) < new Date()) : [];
  }

  getTotal(): string {
    const total = this.bills.length > 0 ? this.bills.filter(t => t)
      .reduce((acc, t) => (parseFloat(acc) || 0) + (t.status === 0 ? parseFloat(t.amount) : parseFloat(t.bill_value) || 0), 0) : 0;
    return total > 0 ? `-` + parseFloat(total).toFixed(2) : '0.00';
  }

  filterTotal(): void {
    this.filterStatus = 0;
    this.dataSource.data = this.bills;
  }

  getTotalBill(): string {
    return this.bills.length > 0 ? this.bills.filter(t => t)
      .reduce((acc, t) => acc + 1, 0) : 0;
  }

  getTotalBillSelected(): number {
    return this.selection.selected.length;
  }

  getSumTotalBillSelected(): string {
    const total = this.dataSource.data.filter(t => this.selection.isSelected(t))
      .reduce((acc, t) => (parseFloat(acc) || 0) + (t.status === 0 ? parseFloat(t.amount) : parseFloat(t.bill_value) || 0), 0);
    return total > 0 ? `-` + parseFloat(total).toFixed(2) : '0.00';
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

  receiveBill(bill: any) {
    let data = {
      ...bill,
      status: 1,
      date_received: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
      discount: 0,
      fees: 0,
      bill_value: bill.amount
    }

    this.billPaymentService.save(bill.id, data).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        this.notificationService.warn(error.error);
        return throwError(error);
      }),
      map(() => {
        this.load();
        this.notificationService.success('Pago com sucesso!');
      })
    ).subscribe();
  }

  receiveBillBack(bill: any) {
    let data = {
      ...bill,
      status: 0,
      date_received: null,
      discount: 0,
      fees: 0,
      bill_value: null
    }

    this.billPaymentService.save(bill.id, data).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        this.notificationService.warn(error.error);
        return throwError(error);
      }),
      map(() => {
        this.load();
        this.notificationService.success('Pagamento cancelado com sucesso!');
      })
    ).subscribe();
  }
}
