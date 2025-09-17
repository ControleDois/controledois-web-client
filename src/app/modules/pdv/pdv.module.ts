import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import { WidgetModule } from 'src/app/shared/widget/widget.module';
import { FreeBoxComponent } from './pages/free-box/free-box.component';
import { SearchProductComponent } from './components/sidebar/search-product/search-product.component';
import { SelectedProductComponent } from './components/sidebar/selected-product/selected-product.component';
import { GridEmptyComponent } from './components/main/grid-empty/grid-empty.component';
import { GridValuesComponent } from './components/main/grid-values/grid-values.component';
import { GridProductsComponent } from './components/main/grid-products/grid-products.component';
import { PaymentMethodsComponent } from './components/sidebar/payment-methods/payment-methods.component';
import { GridPaymentsComponent } from './components/main/grid-payments/grid-payments.component';
import { GridPaymentValuesComponent } from './components/main/grid-payment-values/grid-payment-values.component';

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
    MainComponent,
    FreeBoxComponent,
    SearchProductComponent,
    SelectedProductComponent,
    GridEmptyComponent,
    GridValuesComponent,
    GridProductsComponent,
    PaymentMethodsComponent,
    GridPaymentsComponent,
    GridPaymentValuesComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MaterialModule,
    WidgetModule,
  ]
})
export class PdvModule { }
