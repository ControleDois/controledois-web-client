import { Injectable } from '@angular/core';
import { LibraryService } from './library.service';
import { getApp, getApps, deleteApp, initializeApp } from '@firebase/app';
import { getStorage, ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
import { StorageService } from './storage.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private appName = 'controledois'; // Nome do app
  private storage: any;

  constructor(
    private libraryService: LibraryService,
    private storageService: StorageService
  ) {
    this.startFirebase();
  }

  public startFirebase(): void {
    const auth = this.storageService.getAuth();

    if (auth.company.config.firebase_api_key && auth.company.config.firebase_project_id) {
      this.initializeFirebase({
        apiKey: auth.company.config.firebase_api_key,
        authDomain: auth.company.config.firebase_project_id,
        projectId: auth.company.config.firebase_project_id,
        storageBucket: auth.company.config.firebase_project_id,
        messagingSenderId: auth.company.config.firebase_messaging_sender_id,
        appId: auth.company.config.firebase_app_id,
      });
    } else {
      this.initializeFirebase(environment.firebase);
    }
  }

  async initializeFirebase(config: any): Promise<void> {
    const apps = getApps();
    if (apps.find(app => app.name === this.appName)) {
      const existingConfig = getApp(this.appName).options;
      if (JSON.stringify(existingConfig) === JSON.stringify(config)) {
        console.log('Firebase já está configurado com as mesmas credenciais.');
        return;
      }

      await deleteApp(getApp(this.appName)); // Destrói o app existente
    }

    const app = initializeApp(config, this.appName); // Inicializa um novo app
    this.storage = getStorage(app); // Inicializa o Storage
  }

  async removeStorage(path: string): Promise<void> {
    const auth = this.storageService.getAuth();
    const companyId = auth.company.id;

    path = `${companyId}/${path}`;
    const storageRef = ref(this.storage, path);

    try {
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Erro ao remover arquivo:', error);
      throw error;
    }
  }

  async uploadStorage(routerPath: string, file: any): Promise<string> {
    const auth = this.storageService.getAuth();
    const companyId = auth.company.id;

    try {
      const data = new Date();
      const fileType = file.name.split('.').pop();
      const fileName = this.libraryService.removeSpecialCaracters(
        `${data.toISOString()}`
      ) + `.${fileType}`;
      const path = `${companyId}/${routerPath}/${fileName}`;
      const storageRef = ref(this.storage, path);

      // Faz o upload do arquivo
      await uploadBytes(storageRef, file);

      // Retorna o caminho do arquivo no Storage
      return path;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    }
  }

  async uploadStorageTasks(routerPath: string, file: any): Promise<any> {
    const auth = this.storageService.getAuth();
    const companyId = auth.company.id;

    try {
      const data = new Date();
      const fileType = file.name.split('.').pop();
      const fileName = this.libraryService.removeSpecialCaracters(
        `${data.toISOString()}`
      ) + `.${fileType}`;
      const path = `${companyId}/${routerPath}/${fileName}`;
      const storageRef = ref(this.storage, path);

      // Faz o upload do arquivo
      await uploadBytes(storageRef, file);

      // Cria o objeto de retorno com os dados do upload
      const fileUpload = {
        fileUrl: path,
        fileName: fileName,
      };

      return fileUpload;
    } catch (error) {
      console.error('Erro ao fazer upload de tasks:', error);
      throw error;
    }
  }

  async getStorageURL(path: string): Promise<string> {
    const auth = this.storageService.getAuth();
    const companyId = auth.company.id;
    path = `${companyId}/${path}`;

    const storageRef = ref(this.storage, path);

    try {
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Erro ao obter URL do arquivo:', error);
      throw error;
    }
  }
}
