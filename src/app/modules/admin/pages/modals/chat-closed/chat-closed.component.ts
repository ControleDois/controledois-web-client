import { Component, Inject, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';
import { DialogService } from 'src/app/shared/services/dialog.service';

@Component({
  selector: 'app-chat-closed',
  templateUrl: './chat-closed.component.html',
  styleUrls: ['./chat-closed.component.scss']
})
export class ChatClosedComponent implements OnInit {
  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    description: new FormControl(''),
    peopleId: new FormControl(''),
    classificationId: new FormControl(''),
    transferred: new FormControl(false),
    userId: new FormControl(''),
  });

  @Output() public pageHeader: PageHeader = {
    title: `Finalizar Atendimento`,
    description: 'Finalizar ou transferir atendimento do contato',
    button: {
      text: 'Voltar',
      icon: 'arrow_back',
      action: () => this.closeModal()
    },
  };

  @Output() public navigationButtons: BasicFormButtons = {
    buttons: [
      {
        text: 'Finalizar Atendimento',
        icon: 'verified',
        action: () => this.save(),
        class: 'c2-btn c2-btn-green',
        navigation: false
      },
    ]
  }

  @Output() searchPeople: SearchLoadingUnique = {
    noTitle: false,
    title: 'Cliente',
    url: 'people',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [
      {
        param: 'roles',
        value: '{2}'
      }
    ]
  };

  @Output() searchClassification: SearchLoadingUnique = {
    noTitle: false,
    title: 'Clasificação',
    url: 'people',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: []
  };

  @Output() searchUser: SearchLoadingUnique = {
    noTitle: false,
    title: 'Usuário',
    url: 'people',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [
      {
        param: 'roles',
        value: '{0}'
      }
    ],
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ChatClosedComponent>,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
  }

  save(): void {
    this.loadingFull.active = true;

    this.myForm.value.peopleId = this.searchPeople?.searchFieldOn?.id;
    this.myForm.value.userId = this.searchUser?.searchFieldOn?.id;

    this.dialogService.closeDialog(this.data, this.myForm.value).subscribe((response) => {
      this.dialogRef.close(response)
      this.loadingFull.active = false;
    });
  }

  closeModal() {
    this.dialogRef.close();
  }
}
