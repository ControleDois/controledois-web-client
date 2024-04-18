import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {SelectionModel} from "@angular/cdk/collections";
import {MatSort} from "@angular/material/sort";
import {catchError, finalize, map} from "rxjs/operators";
import {throwError} from "rxjs";
import { BankService } from 'src/app/shared/services/bank.service';
import { WidgetService } from 'src/app/shared/services/widget.service';
import { LibraryService } from 'src/app/shared/services/library.service';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';

@Component({
  selector: 'app-bank-extract',
  templateUrl: './bank-extract.component.html',
})
export class BankExtractComponent implements OnInit {

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public displayedColumns: string[] = [
    'select',
    'date',
    'category',
    'name',
    'people',
    'value',
    'status',
    'actions'
  ];
  public dataSource = new MatTableDataSource<any>();
  public selection = new SelectionModel<any>(true, []);
  @ViewChild(MatSort)
  public sort!: MatSort;

  constructor(
    private bankService: BankService,
    private widGetService: WidgetService,
    public libraryService: LibraryService
  ) {
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.bankService.extract('').pipe(
      map(res => {
        this.dataSource.data = res;
      })
    ).subscribe();
  }

  delete(id: string): void {
    this.widGetService.modalQuestion({
      deleted: true
    }).afterClosed().subscribe(res => {
      if (res === true) {
        this.loadingFull.active = true;
        this.bankService.destroy(id).pipe(
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

  getTotalBillValueReceveiment(): string {
    const total = this.dataSource.data.filter(t => t.status === 1 && t.role === 1)
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.bill_value) || 0), 0);
    return total > 0 ? parseFloat(total).toFixed(2) : '0.00';
  }

  getTotalBillValuePayment(): string {
    const total = this.dataSource.data.filter(t => t.status === 1 && t.role === 0)
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.bill_value) || 0), 0);
    return total > 0 ? parseFloat(total).toFixed(2) : '0.00';
  }

  getTotalLoss(): string {
    const total = this.dataSource.data.filter(t => t.status === 2 && t.role === 1)
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.bill_value) || 0), 0);
    return total > 0 ? parseFloat(total).toFixed(2) : '0.00';
  }

  getTotal(): string {
    const totalReceveiment = this.dataSource.data.filter(t => t.status === 1 && t.role === 1)
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.bill_value) || 0), 0);
    const totalPayment = this.dataSource.data.filter(t => t.status === 1 && t.role === 0)
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.bill_value) || 0), 0);

    return parseFloat((totalReceveiment - totalPayment).toString()).toFixed(2);
  }

  getTotalBill(): string {
    return this.dataSource.data.filter(t => t)
      .reduce((acc, t) => acc + 1, 0);
  }

  getTotalBillSelected(): number {
    return this.selection.selected.length;
  }

  getSumTotalBillSelected(): string {
    const total = this.dataSource.data.filter(t => this.selection.isSelected(t))
      .reduce((acc, t) => (parseFloat(acc) || 0) + (t.status === 0 ? parseFloat(t.amount) : parseFloat(t.bill_value) || 0), 0);
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
}
