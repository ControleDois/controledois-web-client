import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import { WidgetModule } from 'src/app/shared/widget/widget.module';

const appName = 'CTrix';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    data: { title: `PDV -  ${appName}` },
  }
]
@NgModule({
  declarations: [
    MainComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MaterialModule,
    WidgetModule,
  ]
})
export class PdvModule { }
