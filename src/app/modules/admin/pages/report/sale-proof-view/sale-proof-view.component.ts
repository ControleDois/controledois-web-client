import { AfterViewInit, Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { LibraryService } from 'src/app/shared/services/library.service';
import { SaleService } from 'src/app/shared/services/sale.service';
import { catchError, finalize, map, throwError } from 'rxjs';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { Auth } from 'src/app/shared/interfaces/auth.interface';

@Component({
  selector: 'app-sale-proof-view',
  templateUrl: './sale-proof-view.component.html',
  styleUrls: ['./sale-proof-view.component.scss']
})
export class SaleProofViewComponent implements OnInit, AfterViewInit {
  public auth: Auth;
  public data: any;
  public products: Array<any> = [];
  public plots: Array<any> = [];

  emitter: EventEmitter<void> = new EventEmitter();

  constructor(
    public libraryService: LibraryService,
    public saleService: SaleService,
    private storageService: StorageService,
  ) {
    this.auth = this.storageService.getAuth();
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.emitter.emit();
  }

  getDateNow(): string {
    var data = new Date();
    var dia = String(data.getDate()).padStart(2, '0')
    var mes = String(data.getMonth() + 1).padStart(2, '0');
    var ano = data.getFullYear();

    return dia + '/' + mes + '/' + ano;
  }
}
