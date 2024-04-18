import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./../auth.scss']
})
export class RecoverPasswordComponent implements OnInit {

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
  });

  constructor(
    private router: Router,
    private storageService: StorageService
  ) {
  }

  ngOnInit(): void {
  }

  recover(): void {

  }

}
