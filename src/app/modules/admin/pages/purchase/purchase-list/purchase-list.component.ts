import {Component, OnInit, Output, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {SelectionModel} from "@angular/cdk/collections";
import {MatSort} from "@angular/material/sort";
import {FormControl} from "@angular/forms";
import {DatePipe} from "@angular/common";
import {catchError, debounceTime, distinctUntilChanged, finalize, map} from "rxjs/operators";
import {throwError} from "rxjs";
import { PurchaseService } from 'src/app/shared/services/purchase.service';
import { WidgetService } from 'src/app/shared/services/widget.service';
import { LibraryService } from 'src/app/shared/services/library.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SaleProofViewComponent } from '../../report/sale-proof-view/sale-proof-view.component';
import { StorageService } from 'src/app/shared/services/storage.service';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-purchase-list',
  templateUrl: './purchase-list.component.html',
})
export class PurchaseListComponent implements OnInit {
  private purchases: Array<any> = [];
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

  public tableLength!: number;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  public sort!: MatSort;
  public vDateFilter = new Date();
  @Output() search = new FormControl('');

  @Output() public pageHeader: PageHeader = {
    title: 'Compras e Orçamentos',
    description: 'Listagem de compras e orçamentos realizados.',
    button: {
      text: 'Nova compra',
      routerLink: '/purchase/new',
      icon: 'add',
    },
  };

  constructor(
    private purchaseService: PurchaseService,
    private widGetService: WidgetService,
    private datePipe: DatePipe,
    public libraryService: LibraryService,
    private dialogReport: MatDialog,
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
    this.purchases = this.storageService.getList(`listPurchases`);
    this.dataSource.data = this.purchases;

    this.purchaseService.index(this.search.value ? this.search.value : '',
      this.datePipe.transform(this.vDateFilter, 'yyyy-MM-dd'), 'date_sale', 'date_sale',
      this.paginator?.page ? (this.paginator?.pageIndex + 1).toString() : '1',
      this.paginator?.pageSize ? (this.paginator?.pageSize).toString() : '10').pipe(
      map(res => {
        this.storageService.setList(`listPurchases`, res.data);
        this.purchases = res.data;
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
        if (element.isContract) {
          return element.contract_portion;
        } else {
          return 'Compra';
        }
      default: return 'Em orçamento'
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
        return '#B98E00';
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
        return '#DBE6FE';
    }
  }

  delete(id: string): void {
    this.widGetService.modalQuestion({
      deleted: true
    }).afterClosed().subscribe(res => {
      if (res === true) {
        this.loadingFull.active = true;
        this.purchaseService.destroy(id).pipe(
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
    this.dataSource.data = this.purchases?.length > 0 ? this.purchases.filter(t => t.status === 2) : [];
  }

  getTotalAmountRefusedQtd(): number {
    return this.purchases?.length > 0 ? this.purchases.filter(t => t.status === 2).reduce((acc) => acc + 1, 0) : 0;
  }

  getTotalAmountRefused(): string {
    const total = this.purchases?.length > 0 ? this.purchases.filter(t => t.status === 2)
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.net_total) || 0), 0) : 0;
    return total > 0 ? parseFloat(total).toFixed(2) : '0.00';
  }

  filterAmountBudget(): void {
    this.filterStatus = 0;
    this.dataSource.data = this.purchases?.length > 0 ? this.purchases.filter(t => t.status === 0) : [];
  }

  getTotalAmountBudgetQtd(): number {
    return this.purchases?.length > 0 ? this.purchases.filter(t => t.status === 0).reduce((acc) => acc + 1, 0) : 0;
  }

  getTotalAmountBudget(): string {
    const total = this.purchases?.length > 0 ? this.purchases.filter(t => t.status === 0)
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.net_total) || 0), 0) : 0;
    return total > 0 ? parseFloat(total).toFixed(2) : '0.00';
  }

  filterAmountAccepted(): void {
    this.filterStatus = 1;
    this.dataSource.data = this.purchases?.length > 0 ? this.purchases.filter(t => t.status === 1) : [];
  }

  getTotalAmountAcceptedQtd(): number {
    return this.purchases?.length > 0 ? this.purchases.filter(t => t.status === 1).reduce((acc) => acc + 1, 0) : 0;
  }

  getTotalAmountAccepted(): string {
    const total = this.purchases?.length > 0 ? this.purchases.filter(t => t.status === 1)
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.net_total) || 0), 0) : 0;
    return total > 0 ? parseFloat(total).toFixed(2) : '0.00';
  }

  filterAmountSale(): void {
    this.filterStatus = 3;
    this.dataSource.data = this.purchases?.length > 0 ? this.purchases.filter(t => t.status === 3) : [];
  }

  getTotalAmountSaleQtd(): number {
    return this.purchases?.length > 0 ? this.purchases.filter(t => t.status === 3).reduce((acc) => acc + 1, 0) : 0;
  }

  getTotalAmountSale(): string {
    const total = this.purchases?.length > 0 ? this.purchases.filter(t => t.status === 3)
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.net_total) || 0), 0) : 0;
    return total > 0 ? parseFloat(total).toFixed(2) : '0.00';
  }

  filterAmountTotal(): void {
    this.filterStatus = 4;
    this.dataSource.data = this.purchases;
  }

  getTotalAmountTotalQtd(): number {
    return this.purchases?.length > 0 ? this.purchases.filter(t => t.status !== 2).reduce((acc) => acc + 1, 0) : 0;
  }

  getTotal(): string {
    const total = this.purchases?.length > 0 ? this.purchases.filter(t => t.status !== 2)
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.net_total) || 0), 0) : 0;
    return total > 0 ? parseFloat(total).toFixed(2) : '0.00';
  }

  getTotalSale(): string {
    return this.purchases?.length > 0 ? this.purchases.filter(t => t)
      .reduce((acc, t) => acc + 1, 0) : 0;
  }

  getTotalSaleSelected(): number {
    return this.selection.selected?.length;
  }

  getSumTotalSaleSelected(): string {
    const total = this.purchases?.length > 0 ? this.dataSource.data.filter(t => this.selection.isSelected(t))
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.net_total) || 0), 0) : 0;
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

  createPDF(id: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = false;
    dialogConfig.width = '700px';
    dialogConfig.data = this.dataSource.data.find(sale => sale.id === id);
    this.dialogReport.open(SaleProofViewComponent, dialogConfig);
  }
}
