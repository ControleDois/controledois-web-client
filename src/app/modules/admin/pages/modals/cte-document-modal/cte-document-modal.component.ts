import { Component, Inject, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CteDocument } from '../../../interfaces/cte.document.interface';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';

@Component({
  selector: 'app-cte-document-modal',
  templateUrl: './cte-document-modal.component.html',
  styleUrls: ['./cte-document-modal.component.scss']
})
export class CteDocumentModalComponent implements OnInit {
  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    role: new FormControl(2),
    mailing_number: new FormControl(''),
    order_number: new FormControl(''),
    model: new FormControl(''),
    series: new FormControl(''),
    icms_calculation_base_value: new FormControl(''),
    total_icms_value: new FormControl(''),
    base_value_calculation_icms_st: new FormControl(''),
    icms_st_value: new FormControl(''),
    cfop: new FormControl(''),
    weight: new FormControl(''),
    access_key: new FormControl(''),
    description_document: new FormControl(''),
    pin_suframa: new FormControl(''),
    delivery_forecast: new FormControl(''),
    number: new FormControl(''),
    issue_date: new FormControl(''),
    total_products: new FormControl(''),
    total_value: new FormControl(''),
    loadUnit: new FormGroup({
      role: new FormControl(1),
      identification: new FormControl(''),
      prorated_quantity: new FormControl(''),
      taxed_weight: new FormControl(''),
    }),
  });

  @Output() public pageHeader: PageHeader = {
    title: `Documento CTe`,
    description: 'Cadastro de documento CTe',
    button: {
      text: 'Voltar',
      icon: 'arrow_back',
      action: () => this.closeModal()
    },
  };

  @Output() public navigationButtons: BasicFormButtons = {
    buttons: [
      {
        text: 'Salvar',
        icon: 'save',
        action: () => this.save(),
        class: 'c2-btn c2-btn-green',
        navigation: false
      },
    ]
  }

  public roles = [
    { name: '⦿ 01 - NFe Modelo 01/1A e Avulsa/NF de Produtor', type: 0 },
    { name: '⦿ NF de Produtor', type: 1 },
    { name: '⦿ 55 - NFe', type: 2 },
    { name: '⦿ 00 - Declaração', type: 3 },
    { name: '⦿ 59 - CFe SAT', type: 5 },
    { name: '⦿ 65 - NFC-e', type: 6 },
    { name: '⦿ 99 - Outros', type: 7 },
  ];

  public roleLoadUnit = [
    { name: '⦿ Container', type: 1 },
    { name: '⦿ ULD', type: 2 },
    { name: '⦿ Pallet', type: 3 },
    { name: '⦿ Outros', type: 4 },
  ]

  @Output() searchCfop: SearchLoadingUnique = {
    noTitle: false,
    title: 'CFOP',
    url: 'cfop',
    searchFieldOn: null,
    searchFieldOnCollum: ['cfop','description'],
    sortedBy: 'description',
    orderBy: 'description',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [],
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CteDocument,
    private dialogRef: MatDialogRef<CteDocumentModalComponent>,
  ) { }

  ngOnInit(): void {
    this.myForm.patchValue(this.data);
  }

  public save() {
    const data = this.myForm.value;
    this.dialogRef.close(data);
  }

  closeModal() {
    this.dialogRef.close();
  }
}
