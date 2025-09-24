import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { catchError, finalize, map, throwError } from 'rxjs';
import { Auth } from 'src/app/shared/interfaces/auth.interface';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { DialogMessageService } from 'src/app/shared/services/dialog-message.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { PurchaseNoteService } from 'src/app/shared/services/purchase-note.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-purchase-note',
  templateUrl: './purchase-note.component.html',
  styleUrls: ['./purchase-note.component.scss']
})
export class PurchaseNoteComponent implements OnInit {
  private auth: Auth;
  public scannerEnabled: boolean = true;

  availableDevices: MediaDeviceInfo[] = [];
  currentDevice!: MediaDeviceInfo;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public qrCodeResult: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<PurchaseNoteComponent>,
    private purchaseNoteService: PurchaseNoteService,
    private notificationService: NotificationService,
    private storageService: StorageService,
    private dialogMessageService: DialogMessageService,
  ) {
    this.auth = this.storageService.getAuth();
  }

  ngOnInit(): void {
  }

  onCamerasFound(devices: MediaDeviceInfo[]) {
    const backCam = devices.find(d => /back|rear|environment/gi.test(d.label));
    this.currentDevice = backCam || devices[0];
  }

  onCodeResult(result: string) {
    this.scannerEnabled = false;

    this.loadingFull.active = true;
    this.loadingFull.message = 'Aguarde, realizando consulta...';

    this.purchaseNoteService.search({
      companyId: this.auth.company.id,
      url: result
    }).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((res) => {
        let title = 'Atenção';
        let message = 'Ocorreu um erro ao realizar a consulta, tente novamente mais tarde.';
        let message_next = 'Algumas notas são emitidas em contingência e não podem ser consultadas.';

        this.dialogMessageService.openDialog({
          icon: 'pan_tool',
          iconColor: '#ff5959',
          title: title,
          message: message,
          message_next: message_next,
        });
        this.dialogRef.close();
        return throwError(res);
      }),
      map(() => {
        this.notificationService.success('Nota gravada com sucesso!');
        this.dialogRef.close();
      })
    ).subscribe();
  }
}
