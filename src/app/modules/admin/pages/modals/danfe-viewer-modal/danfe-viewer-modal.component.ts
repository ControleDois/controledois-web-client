import { Component, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PageHeader } from '../../../interfaces/page-header.interface';

@Component({
  selector: 'app-danfe-viewer-modal',
  templateUrl: './danfe-viewer-modal.component.html',
  styleUrls: ['./danfe-viewer-modal.component.scss'],
})
export class DanfeViewerModalComponent implements OnInit {

  pdfUrl: SafeResourceUrl;

  @Output() public pageHeader: PageHeader = {
    title: `Visualizar Danfe`,
    description: 'Visualizar a danfe da nota fiscal eletrônica.',
    button: {
      text: 'Voltar',
      icon: 'arrow_back',
      action: () => this.closeModal()
    },
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { pdfUrl: string },
    private sanitizer: DomSanitizer,
    private dialogRef: MatDialogRef<DanfeViewerModalComponent>,
  ) {
    // IMPORTANTE: Sanitize a URL para o iframe
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data.pdfUrl);
  }

  ngOnInit(): void {
  }

  closeModal() {
    this.dialogRef.close();
  }
}
