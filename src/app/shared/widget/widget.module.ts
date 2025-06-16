import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../modules/material.module';
import { LoadingFullComponent } from './loading-full/loading-full.component';
import { SearchSimpleComponent } from './search-simple/search-simple.component';
import { QuestionModalComponent } from './question-modal/question-modal.component';
import { SearchLoadingChipsComponent } from './search-loading-chips/search-loading-chips.component';
import { SearchLoadingUniqueComponent } from './search-loading-unique/search-loading-unique.component';
import { SearchDateMonthComponent } from './search-date-month/search-date-month.component';
import { DialogMessageFullComponent } from './dialog-message-full/dialog-message-full.component';
import { DialogWhatsappConnectComponent } from './dialog-whatsapp-connect/dialog-whatsapp-connect.component';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { SelectOptionSimpleComponent } from './select-option-simple/select-option-simple.component';
import { SearchLoadingChipsObjectComponent } from './search-loading-chips-object/search-loading-chips-object.component';

@NgModule({
  declarations: [
    LoadingFullComponent,
    QuestionModalComponent,
    SearchSimpleComponent,
    SearchLoadingChipsComponent,
    SearchLoadingUniqueComponent,
    SearchDateMonthComponent,
    DialogMessageFullComponent,
    DialogWhatsappConnectComponent,
    SelectOptionSimpleComponent,
    SearchLoadingChipsObjectComponent
  ],
    exports: [
        LoadingFullComponent,
        QuestionModalComponent,
        SearchSimpleComponent,
        SearchLoadingChipsComponent,
        SearchLoadingUniqueComponent,
        SearchDateMonthComponent,
        DialogMessageFullComponent,
        SelectOptionSimpleComponent,
        SearchLoadingChipsObjectComponent
    ],
  imports: [
    CommonModule,
    MaterialModule,
    NgxQRCodeModule
  ]
})
export class WidgetModule { }
