import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { catchError, finalize, map, throwError } from 'rxjs';
import { Auth } from 'src/app/shared/interfaces/auth.interface';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { CompanyService } from 'src/app/shared/services/company.service';
import { FirebaseService } from 'src/app/shared/services/firebase.service';
import { LibraryService } from 'src/app/shared/services/library.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  @Input() active = false;
  @Output() close = new EventEmitter<void>();

  public menuMobileOn = false;
  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public auth: Auth;
  public menuShow = [false, false];
  public selectedCompany = false;


  @Output() searchCompany: SearchLoadingUnique = {
    noTitle: true,
    title: 'Empresa',
    url: 'company',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [],
  };

  constructor(
    private storageService: StorageService,
    private companyService: CompanyService,
    private notificationService: NotificationService,
    private firebaseService: FirebaseService,
    public libraryService: LibraryService
  ) {
    this.auth = this.storageService.getAuth();
   }

  ngOnInit(): void {

  }

  public clickRoute(): void {
    const isMobile = window.innerWidth < 992;
    if (isMobile) {
      this.onClose();
    }
  }


  onClose() {
    this.close.emit();
  }

  selectCompany(event: any): void {
    this.loadingFull.active = true;
    this.companyService.select(event.company_id).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        this.notificationService.warn('Empresa não encontrada.');
        return throwError(error);
      }),
      map((res) => {
        this.auth = this.storageService.getAuth();
        this.auth.company = res;
        this.storageService.setAuth(this.auth);
        this.firebaseService.startFirebase();
        window.location.reload();
      })
    ).subscribe();
  }
}
