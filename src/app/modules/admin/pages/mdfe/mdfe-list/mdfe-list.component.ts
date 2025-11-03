import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, merge, Observable, Subscription, tap, throwError } from 'rxjs';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { LibraryService } from 'src/app/shared/services/library.service';
import { MdfeService } from 'src/app/shared/services/mdfe.service';
import { WidgetService } from 'src/app/shared/services/widget.service';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { WebsocketService } from 'src/app/shared/services/websocket.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConsoleMessageModalComponent } from '../../modals/console-message-modal/console-message-modal.component';
import { DropboxService } from 'src/app/shared/services/dropbox.service';
import { DanfeViewerModalComponent } from '../../modals/danfe-viewer-modal/danfe-viewer-modal.component';

@Component({
  selector: 'app-mdfe-list',
  templateUrl: './mdfe-list.component.html',
})
export class MdfeListComponent implements OnInit {

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public displayedColumns: string[] = ['number', 'vehicle','uf_origin', 'uf_destination', 'amount', 'value', 'status', 'actions'];
  public dataSource = new MatTableDataSource<any>();
  public tableLength!: number;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  public sort!: MatSort;
  @Output() search = new FormControl('');
  public vDateFilter = new Date();

  @Output() public pageHeader: PageHeader = {
    title: 'MDF-e',
    description: 'Listagem de MDF-e',
    button: {
      text: 'Nova MDF-e',
      routerLink: '/mdfe/new',
      icon: 'add',
    },
  };

  private messageSubscription!: Subscription;

  public filterStatus = 6;
  private mdfes: Array<any> = [];

  constructor(
    private mdfeService: MdfeService,
    private widGetService: WidgetService,
    private notificationService: NotificationService,
    private ws: WebsocketService,
    private dropboxService: DropboxService,
    public libraryService: LibraryService,
    public dialog: MatDialog,
  ) {}

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

    // Inscreve-se para receber mensagens
    this.messageSubscription = this.ws.getMessage().subscribe((response) => {
      if (response && response.type === 'mdfe-status') {
        this.updateMDFeList(response.data)
      }
    });
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.load()))
      .subscribe();
  }

  load(): void {
    this.mdfeService.index(this.search.value ? this.search.value : '', 'name', 'name', this.paginator?.page ? (this.paginator?.pageIndex + 1).toString() : '1').pipe(
      map(res => {
        this.dataSource.data = res.data;
        this.mdfes = res.data;
        this.tableLength = res.meta.total;
      })
    ).subscribe();
  }

  getStatus(element: any): string {
    switch (element.status) {
      case 0:
        return 'Com Erro';
      case 1:
        return 'Aguardando';
      case 2:
        return 'Processando';
      case 3:
        return 'Autorizado';
      case 4:
        return 'Cancelado';
      case 5:
        return 'Encerrado';
      default:
        return 'Não enviado'
    }
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 0:
        return '#F43E61';
      case 1:
        return '#2687E9';
      case 2:
        return '#B98E00';
      case 3:
        return '#4ab858';
      case 4:
        return '#F43E61';
      case 5:
        return '#6a6a6a';
      default:
        return '#2687E9'
    }
  }

  getStatusColorBack(status: number): string {
    switch (status) {
      case 0:
        return '#FCD9E0';
      case 1:
        return '#DBE6FE';
      case 2:
        return '#FFF4CE';
      case 3:
        return '#ddf1de';
      case 4:
        return '#FCD9E0';
      case 5:
        return '#f3f3f3';
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
        this.mdfeService.destroy(id).pipe(
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

  openXML(element: any): void {
    window.open(element.url_xml, '_blank');
  }

  openPDF(element: any): void {
    //abrir link
    window.open(element.url_damdfe, '_blank');
  }

  send(id: string): void {
    this.loadingFull.active = true;
    this.mdfeService.send(id).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        this.notificationService.warn('Dados não encontrados...');
        return throwError(error);
      }),
      map((res) => {
        this.notificationService.warn(res.mensagem);
        this.updateStatus(id, 2);
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

  updateMDFeList(mdfe: any): void {
    // Obtém os dados atuais da tabela
    const data = this.dataSource.data;

    // Encontra o índice do item pelo ID
    const index = data.findIndex(item => item.id === mdfe.id);

    // Se o item for encontrado, atualiza o status
    if (index !== -1) {
      data[index].document_number = mdfe.document_number;
      data[index].path_damdfe = mdfe.path_damdfe;
      data[index].path_xml = mdfe.path_xml;
      data[index].status = mdfe.status;
      data[index].status_sefaz = mdfe.status_sefaz;
      data[index].message_sefaz = mdfe.message_sefaz;

      // Atualiza os dados da tabela para refletir a mudança
      this.dataSource.data = [...data];
    }
  }

  showLog(mdfe: any): void {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = false;
      dialogConfig.autoFocus = false;
      dialogConfig.width = '920px';
      dialogConfig.maxHeight = '550px';
      dialogConfig.data = {
        status: mdfe?.status_sefaz,
        message: mdfe?.message_sefaz,
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

  closing(id: string): void {
    this.loadingFull.active = true;
    this.mdfeService.closing(id).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        this.notificationService.warn('Dados não encontrados...');
        return throwError(error);
      }),
      map((res) => {
        this.notificationService.warn(res.mensagem);
        this.updateStatus(id, 2);
      })
    ).subscribe();
  }

  openDanfeViewer(path: string): void {
    this.loadingFull.active = true;
    this.dropboxService.getTemporaryLink(path.replace(/\\/g, "/")).subscribe((res) => {
      this.loadingFull.active = false;

      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = false;
      dialogConfig.autoFocus = false;
      dialogConfig.width = '1020px';
      dialogConfig.maxHeight = '740px';
      dialogConfig.data = {
        pdfUrl: res.link,
      };

      this.dialog.open(DanfeViewerModalComponent, dialogConfig);
    }, (error) => {
      this.notificationService.warn('Erro ao abrir o Danfe Viewer');
      this.loadingFull.active = false;
    });
  }

  filterNfeFromStatus(status: number): void {
    this.filterStatus = status;
    this.dataSource.data = this.mdfes.filter(t => t.status === status);
  }

  getTotalAmountFromStatus(status: number): string {
    const total = this.mdfes ? this.mdfes.filter(t => t.status === status)
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.total_load_value) || 0), 0) : 0;
    return total > 0 ? parseFloat(total).toFixed(2) : '0.00';
  }

  filterAmountTotal(): void {
    this.filterStatus = 6;
    this.dataSource.data = this.mdfes;
  }

  getTotalAmountTotalQtd(): number {
    return this.mdfes.length > 0 ? this.mdfes.filter(t => t.status !== 4).reduce((acc) => acc + 1, 0): 0;
  }

  getTotalNfeFromStatusQtd(status: number): number {
    return this.mdfes ? this.mdfes.filter(t => t.status === status).reduce((acc) => acc + 1, 0) : 0;
  }

  getTotal(): string {
    const total = this.mdfes.length > 0 ? this.mdfes.filter(t => t.status !== 4)
      .reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.total_load_value) || 0), 0) : 0;
    return total > 0 ? parseFloat(total).toFixed(2) : '0.00';
  }
}
