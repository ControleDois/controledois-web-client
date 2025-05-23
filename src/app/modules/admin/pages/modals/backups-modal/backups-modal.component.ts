import { Component, ComponentFactoryResolver, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { WidgetService } from 'src/app/shared/services/widget.service';
import { debounceTime, distinctUntilChanged, finalize, map, merge, tap } from 'rxjs';
import { PeopleService } from 'src/app/shared/services/people.service';
import { LibraryService } from 'src/app/shared/services/library.service';
import { DropboxService } from 'src/app/shared/services/dropbox.service';
import html2pdf from 'html2pdf.js'
import { BackupViewComponent } from '../../report/backup-view/backup-view.component';

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
    'nfce',
    'actions'
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

  public backupTooltip = new FormControl('Sem Backup');

  @ViewChild('priceListPDF', { static: true, read: ViewContainerRef })
  priceListPDF!: ViewContainerRef;

  constructor(
    private peopleService: PeopleService,
    private widGetService: WidgetService,
    private dropboxService: DropboxService,
    private readonly resolver: ComponentFactoryResolver,
    public libraryService: LibraryService,
  ) {
  }

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

    this.optionSelect.valueChanges
    .pipe(
      debounceTime(400),
      distinctUntilChanged(),
      map(() => {
        this.paginator.pageIndex = 0;
        this.load();
      })
    )
    .subscribe();

    this.optionSelectBackup.valueChanges
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

  getLastBackupDate(element: any, role: number): void {
    const backup = element.backups.find((backup) => backup.role === role);

    if (!backup || !backup.last_backup) {
      this.backupTooltip.setValue('Não configurado');
    } else {
      // Converte `last_backup` para Date e formata com data e hora
      const dataFormatada = new Date(backup.last_backup).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false, // Usa formato 24h
      });

      this.backupTooltip.setValue(dataFormatada);
    }
  }

  download(document: string, type: number): void {
    switch (type) {
      case 0:
        this.dropboxService.listFolder(document).subscribe({
          next: (response) => {
            const file = this.getLatestFile(response);
            if (file) {
              this.downloadFile(file.path_display);
            }
          },
          error: (error) => {
            console.error(error);
          },
        });
        break;
      case 1:
        this.dropboxService.listNfe(document).subscribe({
          next: (response) => {
            const file = this.getLatestFile(response);
            if (file) {
              this.downloadFile(file.path_display);
            }
          },
          error: (error) => {
            console.error(error);
          },
        });
        break;
      case 2:
        this.dropboxService.listNfce(document).subscribe({
          next: (response) => {
            const file = this.getLatestFile(response);
            if (file) {
              this.downloadFile(file.path_display);
            }
          },
          error: (error) => {
            console.error(error);
          },
        });
        break;
    }
  }

  getLatestFile(files: any[]): any | null {
    if (!files.length) return null;

    return files.reduce((latest, file) =>
      new Date(file.server_modified) > new Date(latest.server_modified) ? file : latest
    );
  }

  downloadFile(path: string): void {
    this.loadingFull.active = true;
    this.loadingFull.message = 'Fazendo Download'
    this.dropboxService.downloadFile(path).subscribe(
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

  createPDF(): void {
    this.loadingFull.active = true;
    this.loadingFull.message = 'Gerando Relatório...';

    this.peopleService.index('',
    'name', 'name', '1', '150', [
      { param: 'backups', value: 'true' },
      { param: 'backupStatus', value: this.optionSelect.value },
      { param: 'backupRole', value: this.optionSelectBackup.value }
    ]).pipe(
      finalize(() => this.loadingFull.active = false),
      map(res => {
        this.showPDF(res.data);
      })
    ).subscribe();
  }

  showPDF(data: any): void {
    const factory = this.resolver.resolveComponentFactory(BackupViewComponent);
    const componentRef = this.priceListPDF.createComponent(factory);
    componentRef.instance.data = data;
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
