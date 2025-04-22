import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-purchase-note',
  templateUrl: './purchase-note.component.html',
  styleUrls: ['./purchase-note.component.scss']
})
export class PurchaseNoteComponent implements OnInit {
  public scannerEnabled = false;
  public qrCodeResult: string | null = null;
  constructor() { }

  ngOnInit(): void {
  }

  onCodeResult(result: string) {
    this.qrCodeResult = result;
    this.scannerEnabled = false;
    console.log('QR Code lido:', result);
  }
}
