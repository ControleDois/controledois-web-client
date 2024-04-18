import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {StorageService} from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private storageService: StorageService
  ) {
  }

  canActivate(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const auth = this.storageService.getAuth();
      if (auth) {
        this.router.navigate(['/dash']);
        return resolve(false);
      } else {
        return resolve(true);
      }
    });
  }
}
