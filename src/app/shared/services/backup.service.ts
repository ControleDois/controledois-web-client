import { ApiService } from './api.service';
import { Injectable, } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class BackupService {


  constructor(
    private apiService: ApiService,
  ) {
  }


}
