import { Component, Inject, OnInit } from '@angular/core';
import { Auth } from 'src/app/shared/interfaces/auth.interface';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { DialogMessageService } from 'src/app/shared/services/dialog-message.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import html2pdf from 'html2pdf.js';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SaleService } from 'src/app/shared/services/sale.service';
import { catchError, finalize, map, throwError } from 'rxjs';

@Component({
  selector: 'app-sale-report-view',
  templateUrl: './sale-report-view.component.html',
  styleUrls: ['./sale-report-view.component.scss']
})
export class SaleReportViewComponent implements OnInit {
  public sale: any;
  public auth: Auth;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: string },
    private dialogMessageService: DialogMessageService,
    private storageService: StorageService,
    private saleService: SaleService,
    private dialogRef: MatDialogRef<SaleReportViewComponent>,
  ) {
    this.auth = this.storageService.getAuth();
   }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loadingFull.active = true;
    this.saleService
      .show(this.data.id)
      .pipe(
        finalize(() => (this.loadingFull.active = false)),
        catchError((error) => {
          this.dialogMessageService.openDialog({
            icon: 'priority_high',
            iconColor: '#ff5959',
            title: 'Pedido não encontrado',
            message: 'O pedido não foi encontrado, por favor, tente novamente.',
            message_next: 'O pedido pode ter sido excluído ou não existe mais.',
          });
          return throwError(error);
        }),
        map((res) => {
          this.sale = res;
        })
      )
      .subscribe();
  }

  getDateNow(): string {
    var data = new Date();
    var dia = String(data.getDate()).padStart(2, '0')
    var mes = String(data.getMonth() + 1).padStart(2, '0');
    var ano = data.getFullYear();

    return dia + '/' + mes + '/' + ano;
  }

  closeModal() {
    this.dialogRef.close();
  }

  async downloadPDF() {
    this.loadingFull.active = true;
    this.loadingFull.message = 'Aguarde, gerando PDF...';

    let DATA: any = document.getElementById('order-report');

    const namePdf = this.sale.people.social_name || this.sale.people.name;

    // Configurações do PDF
    const pdfOptions = {
      margin: 0,
      filename: namePdf +'.pdf',
      image: { type: 'jpeg', quality: 1 }, // Alterado para JPEG
      html2canvas: {
        scale: 2,
        scrollX: 0,
        scrollY: 0
       }, // Aumentando a escala
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    await html2pdf()
      .set(pdfOptions)
      .from(DATA)
      .save();

    this.loadingFull.active = false;
  }
}
