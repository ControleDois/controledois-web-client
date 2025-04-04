import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, merge, tap, throwError } from 'rxjs';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { NFeService } from 'src/app/shared/services/nfe.service';
import { WidgetService } from 'src/app/shared/services/widget.service';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { DatePipe } from '@angular/common';
import { LibraryService } from 'src/app/shared/services/library.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ConsoleMessageModalComponent } from '../../modals/console-message-modal/console-message-modal.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DropboxService } from 'src/app/shared/services/dropbox.service';

@Component({
  selector: 'app-nfe-list',
  templateUrl: './nfe-list.component.html',
})
export class NfeListComponent implements OnInit {
  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public displayedColumns: string[] = [
    'number',
    'social_name',
    'value',
    'data',
    'status',
    'actions'
  ];
  public dataSource = new MatTableDataSource<any>();
  public tableLength!: number;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  public sort!: MatSort;
  @Output() search = new FormControl('');
  public vDateFilter = new Date();

  @Output() public pageHeader: PageHeader = {
    title: 'NFes',
    description: 'Listagem de Nfe cadastrados no sistema.',
    button: {
      text: 'Novo NFe',
      routerLink: '/nfe/new',
      icon: 'add',
    },
  };

  constructor(
    private nfeService: NFeService,
    private widGetService: WidgetService,
    private datePipe: DatePipe,
    private notificationService: NotificationService,
    private dropboxService: DropboxService,
    public dialog: MatDialog,
    public libraryService: LibraryService
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
    this.nfeService.index(this.search.value ? this.search.value : '',
      this.datePipe.transform(this.vDateFilter, 'yyyy-MM-dd'), 'data_emissao', 'data_emissao',
      this.paginator?.page ? (this.paginator?.pageIndex + 1).toString() : '1',
      this.paginator?.pageSize ? (this.paginator?.pageSize).toString() : '10').pipe(
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
        this.nfeService.destroy(id).pipe(
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

  getStatus(status: number): string {
    switch (status) {
      case 0:
        return 'Aguardando envio';
      case 1:
        return 'Em processo';
      case 2:
        return 'Emitida';
      case 3:
        return 'Error';
      default:
        return 'Error'
    }
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 0:
        return '#2687E9';
      case 1:
        return '#B98E00';
      case 2:
        return '#4ab858';
      case 3:
        return '#F43E61';
      default:
        return '#2687E9'
    }
  }

  getStatusColorBack(status: number): string {
    switch (status) {
      case 0:
        return '#DBE6FE';
      case 1:
        return '#FFF4CE';
      case 2:
        return '#ddf1de';
      case 3:
        return '#FCD9E0';
      default:
        return '#DBE6FE'
    }
  }

  send(id: string): void {
    this.loadingFull.active = true;
    this.nfeService.send(id).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        this.notificationService.warn('Dados não encontrados...');
        return throwError(error);
      }),
      map((res) => {
        this.notificationService.warn(res.mensagem);
        this.updateStatus(id, 1);
      })
    ).subscribe();
  }

  updateStatus(id: string, newStatus: number) {
    // Obtém os dados atuais da tabela
    const data = this.dataSource.data;

    // Encontra o índice do item pelo ID
    const index = data.findIndex(item => item.id === id);

    // Se o item for encontrado, atualiza o status
    if (index !== -1) {
      data[index].status = newStatus;

      // Atualiza os dados da tabela para refletir a mudança
      this.dataSource.data = [...data];
    }
  }

  showLog(nfe: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = false;
    dialogConfig.width = '920px';
    dialogConfig.maxHeight = '550px';
    dialogConfig.data = {
      status: nfe?.status_sefaz,
      message: nfe?.mensagem_sefaz,
    };
    this.dialog.open(ConsoleMessageModalComponent, dialogConfig);
  }

  downloadFile(path: string): void {
    this.loadingFull.active = true;
    this.loadingFull.message = 'Fazendo Download'
    this.dropboxService.downloadFile(path.replace(/\\/g, "/")).subscribe(
      (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = path.split('/').pop() ?? 'default_filename';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.loadingFull.active = false;
      },
      (error) => {
        console.error('Download error:', error);
        this.loadingFull.active = false;
      }
    );
  }
}
