import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, merge, tap, throwError } from 'rxjs';
import { CompanyService } from 'src/app/shared/services/company.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
})
export class CompanyListComponent implements OnInit {
  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public displayedColumns: string[] = ['name', 'document', 'actions'];
  public dataSource = new MatTableDataSource<any>();
  public tableLength!: number;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  public sort!: MatSort;
  @Output() search = new FormControl('');

  constructor(
    private companyService: CompanyService,
    private storageService: StorageService,
    private router: Router,
    private notificationService: NotificationService
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
    this.companyService.index(this.search.value ? this.search.value : '').pipe(
      map(res => {
        this.dataSource.data = res.data;
        this.tableLength = res.total;
      })
    ).subscribe();
  }

  selectCompany(id: string): void {
    this.loadingFull.active = true;
      this.companyService.select(id).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Empresa não encontrada.');
          return throwError(error);
        }),
        map((res) => {
          const auth = this.storageService.getAuth();
          auth.company = res;
          this.storageService.setAuth(auth);
          this.notificationService.success('Empresa selecionada com sucesso');
          this.router.navigate(['dash']);
        })
      ).subscribe();
  }
}
