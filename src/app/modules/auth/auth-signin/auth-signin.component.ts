import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, map, throwError } from 'rxjs';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { AuthService } from 'src/app/shared/services/auth.service';
import { DialogMessageService } from 'src/app/shared/services/dialog-message.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-auth-signin',
  templateUrl: './auth-signin.component.html',
  styleUrls: ['./../auth.scss']
})
export class AuthSigninComponent implements OnInit {

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(
    private router: Router,
    private storageService: StorageService,
    private authService: AuthService,
    private dialogMessageService: DialogMessageService,
  ) {
  }

  ngOnInit(): void {
  }

  login(): void {
    if (this.myForm.valid) {
      this.loadingFull.active = true;
      this.authService.login(this.myForm.value).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.dialogMessageService.openDialog({
            icon: 'priority_high',
            iconColor: '#ff5959',
            title: 'Login inválido',
            message: 'Usuário ou senha inválidos',
            message_next: 'Verifique se seu email está correto, caso esteja correto, verifique se sua senha está correta. Caso não lembre sua senha, clique em "Esqueci minha senha"',
          });
          return throwError(error);
        }),
        map((auth) => {
          this.storageService.setAuth(auth);
          this.router.navigate(['/dash']);
        })
      ).subscribe();
    }
  }
}
