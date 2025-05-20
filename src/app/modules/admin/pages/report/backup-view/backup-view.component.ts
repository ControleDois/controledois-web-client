import { AfterViewInit, Component, EventEmitter, OnInit } from '@angular/core';
import { Auth } from 'src/app/shared/interfaces/auth.interface';
import { LibraryService } from 'src/app/shared/services/library.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-backup-view',
  templateUrl: './backup-view.component.html',
  styleUrls: ['./backup-view.component.scss']
})
export class BackupViewComponent implements OnInit, AfterViewInit {
  public auth: Auth;
  data: any;

  emitter: EventEmitter<void> = new EventEmitter();

  constructor(
    private storageService: StorageService,
    public libraryService: LibraryService,
  ) {
    this.auth = this.storageService.getAuth();
  }

  ngOnInit(): void {
    console.log(this.data);
  }

  ngAfterViewInit(): void {
    this.emitter.emit();
  }

  //Pega a data atual
  public getDateNow(): string {
    var data = new Date();
    return data.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  getLastBackupDate(element: any, role: number): string {
    const backup = element.backups.find((backup) => backup.role === role);

    if (!backup || !backup.last_backup) {
      return 'Não configurado';
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

      return dataFormatada;
    }
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
}
