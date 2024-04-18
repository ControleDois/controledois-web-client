import { Component, OnInit } from '@angular/core';
import {StorageService} from "../../../../shared/services/storage.service";
import {Router} from "@angular/router";
import {Auth} from "../../../../shared/interfaces/auth.interface";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public auth: Auth;
  public menuMobileOn = false;

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
