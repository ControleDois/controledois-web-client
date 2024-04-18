import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogMessageFullComponent } from '../widget/dialog-message-full/dialog-message-full.component';
import { DialogMessage } from '../interfaces/dialog-message.interface';

@Injectable({
  providedIn: 'root'
})
export class DialogMessageService {

  constructor(public dialog: MatDialog) { }

  openDialog(data: DialogMessage) {
    this.dialog.open(DialogMessageFullComponent, {
      data,
    });
  }
}
