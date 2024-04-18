import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, map, throwError } from 'rxjs';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { AuthService } from 'src/app/shared/services/auth.service';
import { DialogMessageService } from 'src/app/shared/services/dialog-message.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-auth-signup',
  templateUrl: './auth-signup.component.html',
  styleUrls: ['./../auth.scss']
})
export class AuthSignupComponent  {

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required]),
    repeat_password: new FormControl('', [Validators.required]),
  });

  public validationFields: Array<any> = [
    { name: 'name', validation: true, msg: 'É necessário informar o nome' },
    { name: 'email', validation: true, msg: 'É necessário informar o email' },
    { name: 'password', validation: true, msg: 'É necessário informar a senha' },
    { name: 'repeat_password', validation: true, msg: 'É necessário repetir a senha' },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private dialogMessageService: DialogMessageService,
  ) {}

  validateForm(): void {
    this.validationFields.find((v) => v.name === 'name').validation = !!this.myForm.value.name;
    this.validationFields.find((v) => v.name === 'email').validation = !!this.myForm.value.email;
    this.validationFields.find((v) => v.name === 'password').validation = !!this.myForm.value.password;
    this.validationFields.find((v) => v.name === 'repeat_password').validation = !!this.myForm.value.repeat_password;
  }

  getValidation(name: string): boolean {
    return !this.validationFields.find((v) => v.name === name).validation;
  }

  register(): void {
    this.validateForm();

    if (this.myForm.valid) {
      if (this.myForm.value.password !== this.myForm.value.repeat_password) {
        this.dialogMessageService.openDialog({
          icon: 'priority_high',
          iconColor: '#ff5959',
          title: 'Senhas não coincidem',
          message: 'As senhas não coincidem, verifique se as senhas estão iguais.',
          message_next: 'É necessário informar a mesma senha nos dois campos. Desta forma evitamos ao máximo que você esqueça sua senha.',
        });
        return;
      }

      this.loadingFull.active = true;
      this.authService.register(this.myForm.value).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((res) => {
          let title = 'Atenção';
          let message = 'Ocorreu um erro ao realizar o cadastro, tente novamente mais tarde.';
          let message_next = '';

          if (res?.error?.errors?.[0]?.field === 'email') {
            title = 'Email já cadastrado';
            message = res.error.errors[0].message;
            message_next = 'Este email informado já se encontra cadastrado em nossa base de dados, tente recuperar sua senha. Caso não consiga, entre em contato com o suporte.';
          }

          if (res?.error?.errors?.[0]?.field === 'password') {
            title = 'Senha não atende aos requisitos';
            message = res.error.errors[0].message;
            message_next = 'Para cadastrar uma senha, é necessário que ela tenha no mínimo 6 caracteres, sendo pelo menos 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial.';
          }

          this.dialogMessageService.openDialog({
            icon: 'pan_tool',
            iconColor: '#ff5959',
            title: title,
            message: message,
            message_next: message_next,
          });
          return throwError(res);
        }),
        map((res) => {
          this.dialogMessageService.openDialog({
            icon: 'check_circle',
            iconColor: '#4ABA58',
            title: 'Cadastro realizado com sucesso',
            message: 'Seu cadastro foi realizado com sucesso, você será redirecionado para a página de login.',
          });
          this.router.navigate(['/auth/signin']);
        })
      ).subscribe();
    } else {
      this.dialogMessageService.openDialog({
        icon: 'priority_high',
        iconColor: '#ff5959',
        title: 'Campos inválidos',
        message: 'Existem campos inválidos, verifique se todos os campos estão preenchidos corretamente.',
        message_next: 'Todos os campos são obrigatórios, verifique se todos os campos estão preenchidos corretamente.',
      });
    }
  }
}
