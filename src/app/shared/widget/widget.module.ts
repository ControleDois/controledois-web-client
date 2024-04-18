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

@NgModule({
  declarations: [
    LoadingFullComponent,
    QuestionModalComponent,
    SearchSimpleComponent,
    SearchLoadingChipsComponent,
    SearchLoadingUniqueComponent,
    SearchDateMonthComponent,
    DialogMessageFullComponent
  ],
    exports: [
        LoadingFullComponent,
        QuestionModalComponent,
        SearchSimpleComponent,
        SearchLoadingChipsComponent,
        SearchLoadingUniqueComponent,
        SearchDateMonthComponent,
        DialogMessageFullComponent
    ],
  imports: [
    CommonModule,
    MaterialModule
  ]
})
export class WidgetModule { }
