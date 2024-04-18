import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthSigninComponent } from './auth-signin/auth-signin.component';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import { WidgetModule } from 'src/app/shared/widget/widget.module';
import { AuthSignupComponent } from './auth-signup/auth-signup.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'signin',
    pathMatch: 'full'
  },
  {
    path: 'signin',
    component: AuthSigninComponent,
    data: { title: "Login - Controle Dois" },
  },
  {
    path: 'signup',
    component: AuthSignupComponent,
    data: { title: "Cadastro - Controle Dois" },
  },
  {
    path: 'recover-password',
    component: RecoverPasswordComponent,
    data: { title: "Recuperar senha - Controle Dois" },
  }
];

@NgModule({
  declarations: [
    AuthSigninComponent,
    AuthSignupComponent,
    RecoverPasswordComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MaterialModule,
    WidgetModule
  ]
})
export class AuthModule {
}
