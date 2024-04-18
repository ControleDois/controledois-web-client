import {Injectable} from '@angular/core';
import {AngularFireStorage} from '@angular/fire/compat/storage';
import {AngularFireDatabase} from '@angular/fire/compat/database';
import {LibraryService} from './library.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private driver: AngularFireStorage,
    private libraryService: LibraryService,
    public database: AngularFireDatabase,
  ) {
  }


  removeStorage(path) {
    return new Promise<boolean>((resolve, reject) => {
      this.driver.storage
        .ref(path)
        .delete()
        .then((result) => {
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
    });
  }

  uploadStorage(routerPath: string, file: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const data = new Date();
      const fileType = file.name.split('.').pop();
      const FileName =
        this.libraryService.removeSpecialCaracters(
          `${data.toISOString()}`
        ) + `.${fileType}`;
      const path = `${routerPath}/${FileName}`;

      const storage = this.driver.ref(path).put(file);

      storage
        .then((result) => {
          resolve(path);
        })
        .catch(() => {
          resolve({});
        });
    });
  }

  async getStorageURL(path) {
    return await this.driver.storage
      .ref(path)
      .getDownloadURL()
      .then((res) => res)
      .catch((err) => err);
  }
}
