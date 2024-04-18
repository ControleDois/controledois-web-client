import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogMessage } from '../../interfaces/dialog-message.interface';

@Component({
  selector: 'app-dialog-message-full',
  templateUrl: './dialog-message-full.component.html',
  styleUrls: ['./dialog-message-full.component.scss']
})
export class DialogMessageFullComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogMessage) {}

  showLink(website: string){
    window.open(website, '_blank');
  }
}
