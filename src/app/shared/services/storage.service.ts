import {Injectable} from '@angular/core';
import {Auth} from '../interfaces/auth.interface';
import {EncryptService} from './encrypt.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() {
  }

  clear(): void {
    window.localStorage.clear();
  }

  setAuth(data: any): void {
    localStorage.setItem(
      'auth',
      EncryptService.encrypt(JSON.stringify(data))
    );
  }

  getAuth(): Auth {
    let localStorageAuth = localStorage.getItem('auth');
    return  localStorageAuth
      ? JSON.parse(EncryptService.decrypt(localStorageAuth))
      : null;
  }

  setList(name: string, list: any) {
    localStorage.setItem(
      name,
      EncryptService.encrypt(JSON.stringify(list))
    );
  }

  getList(name: string): any {
    let localStorageItem = localStorage.getItem(name);

    let list = localStorageItem
      ? JSON.parse(EncryptService.decrypt(localStorageItem))
      : [];

    return list;
  }
}
