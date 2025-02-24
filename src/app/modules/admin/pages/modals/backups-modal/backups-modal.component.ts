import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { CostCenterService } from 'src/app/shared/services/cost-center.service';
import { WidgetService } from 'src/app/shared/services/widget.service';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, merge, tap, throwError } from 'rxjs';
import { PeopleService } from 'src/app/shared/services/people.service';
import { N } from 'chart.js/dist/chunks/helpers.core';
import { LibraryService } from 'src/app/shared/services/library.service';

@Component({
  selector: 'app-backups-modal',
  templateUrl: './backups-modal.component.html',
  styleUrls: ['./backups-modal.component.scss']
})
export class BackupsModalComponent implements OnInit {

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public displayedColumns: string[] = [
    'name',
    'document',
    'db',
    'nfe',
    'nfce'
  ];
  public dataSource = new MatTableDataSource<any>();
  public tableLength!: number;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  public sort!: MatSort;
  @Output() search = new FormControl('');

  @Output() public pageHeader: PageHeader = {
    title: 'Gerenciamento de backups',
    description: 'Aqui você pode gerenciar os backups do sistema.',
  };

  @Output() optionSelectBackup = new FormControl(0);
  @Output() optionSelect = new FormControl(0);

  public statusType = [
    { name: 'Todos', type: 0 },
    { name: 'Sucesso', type: 1 },
    { name: 'Alerta', type: 2 },
    { name: 'Erro', type: 3 },
    { name: 'Não configurado', type: 4 },
  ];

  public statusTypeBackup = [
    { name: 'Todos', type: 0 },
    { name: 'Banco', type: 1 },
    { name: 'NFe', type: 2 },
    { name: 'NFCe', type: 3 },
  ];

  constructor(
    private peopleService: PeopleService,
    private widGetService: WidgetService,
    public libraryService: LibraryService,
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

    this.optionSelect.valueChanges
    .pipe(
      debounceTime(400),
      distinctUntilChanged(),
      map(() => {
        this.load();
      })
    )
    .subscribe();

    this.optionSelectBackup.valueChanges
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
    this.peopleService.index(this.search.value ? this.search.value : '',
    'name', 'name', this.paginator?.page ? (this.paginator?.pageIndex + 1).toString() : '1',
    this.paginator?.pageSize ? (this.paginator?.pageSize).toString() : '5', [
      { param: 'backups', value: 'true' },
      { param: 'backupStatus', value: this.optionSelect.value },
      { param: 'backupRole', value: this.optionSelectBackup.value }
    ]).pipe(
      map(res => {
        this.dataSource.data = res.data;
        this.tableLength = res.meta.total;
      })
    ).subscribe();
  }

  getStatusBackup(element: any, role: number): string {
    const backup = element.backups.find((backup) => backup.role === role);

    if (!backup) {
      return 'layers_clear'
    }

    switch (backup.status) {
      case 0:
        return 'verified_user';
      case 1:
        return 'warning';
      case 2:
        return 'gpp_bad';
      case 3:
        return 'report_off';
      default:
        return 'report_off';
    }
  }

  getStatusColor(element: any, role: number): string {
    const backup = element.backups.find((backup) => backup.role === role);

    if (!backup) {
      return '#F43E61';
    }

    switch (backup.status) {
      case 0:
        return '#4ab858';
      case 1:
        return '#B98E00';
      case 2:
        return '#F43E61';
      case 3:
        return '#2687E9';
      default:
        return '#2687E9'
    }
  }

  getStatusColorBack(element: any, role: number): string {
    const backup = element.backups.find((backup) => backup.role === role);

    if (!backup) {
      return '#FCD9E0';
    }

    switch (backup.status) {
      case 0:
        return '#ddf1de';
      case 1:
        return '#FFF4CE';
      case 2:
        return '#FCD9E0';
      case 3:
        return '#DBE6FE';
      default:
        return '#DBE6FE'
    }
  }

  getLastBackupDate(element: any, role: number): string {
    const backup = element.backups.find((backup) => backup.role === role);

    if (!backup) {
      return 'Sem valor'
    }

    return backup.last_backup_date;
  }
}
