import {Injectable} from '@angular/core';
import {Resolve, ActivatedRouteSnapshot, Router} from '@angular/router';
import {StorageService} from '../services/storage.service';


@Injectable()
export class AuthResolver implements Resolve<any> {

  constructor(
    private router: Router,
    private storageService: StorageService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot): Promise<any> {
    return new Promise((resolve, reject) => {
      const auth = this.storageService.getAuth();
      if (auth) {
        return resolve(auth);
      } else {
        this.router.navigate(['/auth']);
        return reject({message: 'Usuário desconectado'});
      }
    });
  }
}
