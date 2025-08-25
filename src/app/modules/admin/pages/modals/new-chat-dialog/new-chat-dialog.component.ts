import { Component, Inject, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { WhatsappService } from 'src/app/shared/services/whatsapp.service';

@Component({
  selector: 'app-new-chat-dialog',
  templateUrl: './new-chat-dialog.component.html',
  styleUrls: ['./new-chat-dialog.component.scss']
})
export class NewChatDialogComponent implements OnInit {

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    whatsappId: new FormControl('', Validators.required),
    description: new FormControl(''),
  });

  @Output() public pageHeader: PageHeader = {
    title: `Iniciar Novo Atendimento`,
    description: 'Iniciar um novo atendimento para o contato.',
    button: {
      text: 'Voltar',
      icon: 'arrow_back',
      action: () => this.closeModal()
    },
  };

  @Output() public navigationButtons: BasicFormButtons = {
    buttons: [
      {
        text: 'Iniciar Atendimento',
        icon: 'verified',
        action: () => this.save(),
        class: 'c2-btn c2-btn-green',
        navigation: false
      },
    ]
  }

  @Output() searchWhatsapp: SearchLoadingUnique = {
    noTitle: false,
    title: 'Whatsapp',
    url: 'whatsapp',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [],
  };

  public validationFields: Array<any> = [
    { name: 'whatsappId', validation: true, msg: 'Selecione o whatsapp que enviara a mensagem!' },
  ];

  public unicWhatsapp: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<NewChatDialogComponent>,
    private dialogService: DialogService,
    private whatsappService: WhatsappService,
  ) { }

  ngOnInit(): void {
    this.whatsappService.index('', 'name', 'name', '1', '10').subscribe((response) => {
      //Se existir somente 1 whatsapp, ja preenche ele
      if (response && response.data && response.data.length == 1) {
        this.searchWhatsapp.searchFieldOn = response.data[0];
        this.myForm.controls['whatsappId'].setValue(this.searchWhatsapp.searchFieldOn.id);
        this.unicWhatsapp = true;
      }
    });
  }

  save(): void {
    this.loadingFull.active = true;

    this.myForm.value.whatsappId = this.searchWhatsapp?.searchFieldOn?.id;

    this.dialogService.newDialog(this.data, this.myForm.value).subscribe((response) => {
      this.dialogRef.close(response)
      this.loadingFull.active = false;
    });
  }

  closeModal() {
    this.dialogRef.close();
  }
}
