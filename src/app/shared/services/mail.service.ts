import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { Observable } from "rxjs";
import { Auth } from '../interfaces/auth.interface';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class MailService {
  private resource = 'mail';

  constructor(
    private apiService: ApiService
  ) { }

  sendKey(id: string, body: Object): Observable<any> {
    return this.apiService.on(`${this.resource}/send-key/${id}`, body, 'post-token');
  }


}
