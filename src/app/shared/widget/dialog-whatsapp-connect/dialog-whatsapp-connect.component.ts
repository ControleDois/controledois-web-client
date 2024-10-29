import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-whatsapp-connect',
  templateUrl: './dialog-whatsapp-connect.component.html',
  styleUrls: ['./dialog-whatsapp-connect.component.scss']
})
export class DialogWhatsappConnectComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}


  ngOnInit(): void {
    console.log(this.data);
  }

}
