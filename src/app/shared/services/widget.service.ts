import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { QuestionModalComponent } from '../widget/question-modal/question-modal.component';

@Injectable({
  providedIn: 'root'
})
export class WidgetService {

  constructor(
    private dialog: MatDialog,
  ) { }

  modalQuestion(data: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = false;
    dialogConfig.width = '700px';
    dialogConfig.data = data;
    return this.dialog.open(QuestionModalComponent, dialogConfig);
  }
}
