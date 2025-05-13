import { DEFAULT_CURRENCY_CODE, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { AuthResolver } from './shared/resolvers/auth.resolver';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './shared/modules/material.module';
import { WidgetModule } from './shared/widget/widget.module';
import { NgxMaskModule } from 'ngx-mask';
import { DatePipe, registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { PdvComponent } from './modules/pdv/pdv.component';

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: "right",
  allowNegative: true,
  decimal: ",",
  precision: 2,
  prefix: "R$ ",
  suffix: "",
  thousands: "."
};

registerLocaleData(ptBr);

@NgModule({
  declarations: [
    AppComponent,
    PdvComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    WidgetModule,
    NgxMaskModule.forRoot(),
    StoreModule.forRoot({}),
  ],
  providers: [
    AuthResolver,
    DatePipe,
    { provide: LOCALE_ID, useValue: 'pt' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
