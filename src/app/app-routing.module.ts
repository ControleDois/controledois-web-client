import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './modules/admin/admin.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { AuthResolver } from './shared/resolvers/auth.resolver';
import { PdvComponent } from './modules/pdv/pdv.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./modules/admin/admin.module').then((m) => m.AdminModule),
      },
    ],
    resolve: {data: AuthResolver},
  },
  {
    path: 'pdv',
    component: PdvComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./modules/pdv/pdv.module').then((m) => m.PdvModule),
      },
    ],
    resolve: {data: AuthResolver},
  },
  {
    path: 'auth',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./modules/auth/auth.module').then((m) => m.AuthModule),
      },
    ],
    canActivate: [AuthGuard],
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
