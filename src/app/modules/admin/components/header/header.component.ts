import { Component, OnInit, Output } from '@angular/core';
import {StorageService} from "../../../../shared/services/storage.service";
import {Router} from "@angular/router";
import {Auth} from "../../../../shared/interfaces/auth.interface";
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public auth: Auth;
  public menuMobileOn = false;

  @Output() searchCompany: SearchLoadingUnique = {
    noTitle: true,
    title: 'Empresa',
    url: 'people',
    searchFieldOn: null,
    searchFieldOnCollum: 'name',
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [
      {
        param: 'roles',
        value: '{2}'
      }
    ],
  };

  constructor(
    private storageService: StorageService,
    private router: Router
  ) {
    this.auth = this.storageService.getAuth();
  }

  ngOnInit(): void {
  }

  logout(): void {
    this.storageService.clear();
    this.router.navigate(['/auth/signin']);
  }
}
