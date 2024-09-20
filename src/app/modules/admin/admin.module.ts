import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import { WidgetModule } from 'src/app/shared/widget/widget.module';
import { NgxMaskModule } from 'ngx-mask';
import { AdminComponent } from './admin.component';
import { HeaderComponent } from './components/header/header.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PeopleListComponent } from './pages/people/people-list/people-list.component';
import { PeopleFormComponent } from './pages/people/people-form/people-form.component';
import { ProductListComponent } from './pages/product/product-list/product-list.component';
import { ProductFormComponent } from './pages/product/product-form/product-form.component';
import { ServiceListComponent } from './pages/service/service-list/service-list.component';
import { ServiceFormComponent } from './pages/service/service-form/service-form.component';
import { CategoryListComponent } from './pages/category/category-list/category-list.component';
import { CategoryFormComponent } from './pages/category/category-form/category-form.component';
import { CostCenterListComponent } from './pages/cost-center/cost-center-list/cost-center-list.component';
import { CostCenterFormComponent } from './pages/cost-center/cost-center-form/cost-center-form.component';
import { BankFormComponent } from './pages/bank/bank-form/bank-form.component';
import { BankExtractComponent } from './pages/bank/bank-extract/bank-extract.component';
import { BankListComponent } from './pages/bank/bank-list/bank-list.component';
import { BillPaymentListComponent } from './pages/bill-payment/bill-payment-list/bill-payment-list.component';
import { BillPaymentFormComponent } from './pages/bill-payment/bill-payment-form/bill-payment-form.component';
import { BillReceivementListComponent } from './pages/bill-receivement/bill-receivement-list/bill-receivement-list.component';
import { BillReceivementFormComponent } from './pages/bill-receivement/bill-receivement-form/bill-receivement-form.component';
import { PurchaseListComponent } from './pages/purchase/purchase-list/purchase-list.component';
import { PurchaseFormComponent } from './pages/purchase/purchase-form/purchase-form.component';
import { CurrencyMaskModule } from "ng2-currency-mask";
import { OrderServiceListComponent } from './pages/order-service/order-service-list/order-service-list.component';
import { OrderServiceFormComponent } from './pages/order-service/order-service-form/order-service-form.component';
import { OrderServiceViewComponent } from './pages/report/order-service-view/order-service-view.component';
import { SaleListComponent } from './pages/sale/sale-list/sale-list.component';
import { SaleFormComponent } from './pages/sale/sale-form/sale-form.component';
import { SaleProofViewComponent } from './pages/report/sale-proof-view/sale-proof-view.component';
import { ConfigComponent } from './pages/config/config.component';
import { UserListComponent } from './pages/user/user-list/user-list.component';
import { UserFormComponent } from './pages/user/user-form/user-form.component';
import { StreamingFormComponent } from './pages/streaming/streaming-form/streaming-form.component';
import { StreamingListComponent } from './pages/streaming/streaming-list/streaming-list.component';
import { CompanyListComponent } from './pages/company/company-list/company-list.component';
import { CompanyFormComponent } from './pages/company/company-form/company-form.component';
import { NfeListComponent } from './pages/nfe/nfe-list/nfe-list.component';
import { NfeFormComponent } from './pages/nfe/nfe-form/nfe-form.component';

const appName = 'CTrix';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dash',
    pathMatch: 'full'
  },
  {
    path: 'dash',
    component: DashboardComponent,
    data: { title: `Dashborad -  ${appName}` },
  },
  {
    path: 'people',
    component: PeopleListComponent,
    data: { title: `Pessoas -  ${appName}` },
  },
  {
    path: 'people/:id',
    component: PeopleFormComponent,
    data: { title: `Cadastro de Pessoas -  ${appName}` },
  },
  {
    path: 'product',
    component: ProductListComponent,
    data: { title: `Produtos -  ${appName}` },
  },
  {
    path: 'product/:id',
    component: ProductFormComponent,
    data: { title: `Cadastro de Produtos -  ${appName}` },
  },
  {
    path: 'service',
    component: ServiceListComponent,
    data: { title: `Serviços -  ${appName}` },
  },
  {
    path: 'service/:id',
    component: ServiceFormComponent,
    data: { title: `Cadastro de Serviços -  ${appName}` },
  },
  {
    path: 'category',
    component: CategoryListComponent,
    data: { title: `Categorias -  ${appName}` },
  },
  {
    path: 'category/:id',
    component: CategoryFormComponent,
    data: { title: `Cadastro de Categorias -  ${appName}`},
  },
  {
    path: 'cost-center',
    component: CostCenterListComponent,
    data: { title: `Centro de Custo -  ${appName}`},
  },
  {
    path: 'cost-center/:id',
    component: CostCenterFormComponent,
    data: { title: `Cadastro de Centro de Custo -  ${appName}`},
  },
  {
    path: 'bank',
    component: BankListComponent,
    data: { title: `Bancos -  ${appName}`},
  },
  {
    path: 'bank/:id',
    component: BankFormComponent,
    data: { title: `Cadastro de Bancos -  ${appName}`},
  },
  {
    path: 'bank-extract',
    component: BankExtractComponent,
    data: { title: `Extraton de Banco -  ${appName}`},
  },
  {
    path: 'bill-payment',
    component: BillPaymentListComponent,
    data: { title: `Contas a Pagar -  ${appName}`},
  },
  {
    path: 'bill-payment/:id',
    component: BillPaymentFormComponent,
    data: { title: `Cadastro de Contas a Pagar -  ${appName}`},
  },
  {
    path: 'bill-receivement',
    component: BillReceivementListComponent,
    data: { title: `Dashborad -  ${appName}`},
  },
  {
    path: 'bill-receivement/:id',
    component: BillReceivementFormComponent,
    data: { title: `Cadastro de Contas a Receber -  ${appName}`},
  },
  {
    path: 'purchase',
    component: PurchaseListComponent,
    data: { title: `Compras -  ${appName}`},
  },
  {
    path: 'purchase/:id',
    component: PurchaseFormComponent,
    data: { title: `Cadastro de Compras -  ${appName}`},
  },
  {
    path: 'os',
    component: OrderServiceListComponent,
    data: { title: `Ordem de Serviço -  ${appName}`},
  },
  {
    path: 'os/:id',
    component: OrderServiceFormComponent,
    data: { title: `Cadastro de Ordem de Serviço -  ${appName}`},
  },
  {
    path: 'sale',
    component: SaleListComponent,
    data: { title: `Venda -  ${appName}`},
  },
  {
    path: 'sale/:id',
    component: SaleFormComponent,
    data: { title: `Cadastro de Venda -  ${appName}`},
  },
  {
    path: 'streaming',
    component: StreamingListComponent,
    data: { title: `Transmissão -  ${appName}`},
  },
  {
    path: 'streaming/:id',
    component: StreamingFormComponent,
    data: { title: `Cadastro de Transmissão -  ${appName}`},
  },
  {
    path: 'configuration',
    component: ConfigComponent,
    data: { title: `Configuração de Sistema -  ${appName}`},
  },
  {
    path: 'user',
    component: UserListComponent,
    data: { title: `Usuários -  ${appName}`},
  },
  {
    path: 'user/:id',
    component: UserFormComponent,
    data: { title: `Cadastro de Usuários -  ${appName}`},
  },
  {
    path: 'company',
    component: CompanyListComponent,
    data: { title: `Empresas -  ${appName}`},
  },
  {
    path: 'company/:id',
    component: CompanyFormComponent,
    data: { title: `Cadastro de Empresas -  ${appName}`},
  },
  {
    path: 'nfe',
    component: NfeListComponent,
    data: { title: `NFe -  ${appName}`},
  },
  {
    path: 'nfe/:id',
    component: NfeFormComponent,
    data: { title: `Cadastro de NFe -  ${appName}`},
  }
]

@NgModule({
  declarations: [
    AdminComponent,
    HeaderComponent,
    DashboardComponent,
    PeopleListComponent,
    PeopleFormComponent,
    ProductListComponent,
    ProductFormComponent,
    ServiceListComponent,
    ServiceFormComponent,
    CategoryListComponent,
    CategoryFormComponent,
    CostCenterListComponent,
    CostCenterFormComponent,
    BankListComponent,
    BankFormComponent,
    BankExtractComponent,
    BillPaymentListComponent,
    BillPaymentFormComponent,
    BillReceivementListComponent,
    BillReceivementFormComponent,
    PurchaseListComponent,
    PurchaseFormComponent,
    OrderServiceListComponent,
    OrderServiceFormComponent,
    OrderServiceViewComponent,
    SaleListComponent,
    SaleFormComponent,
    SaleProofViewComponent,
    ConfigComponent,
    UserListComponent,
    UserFormComponent,
    StreamingFormComponent,
    StreamingListComponent,
    CompanyListComponent,
    CompanyFormComponent,
    NfeListComponent,
    NfeFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MaterialModule,
    WidgetModule,
    NgxMaskModule.forRoot(),
    CurrencyMaskModule,
  ]
})
export class AdminModule { }
