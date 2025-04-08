import { DatePipe } from '@angular/common';
import { Component, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { DialogMessageService } from 'src/app/shared/services/dialog-message.service';
import { LibraryService } from 'src/app/shared/services/library.service';
import { NDFeService } from 'src/app/shared/services/mdfe.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { BasicFormNavigation } from '../../../interfaces/basic-form-navigation.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';

@Component({
  selector: 'app-mdfe-form',
  templateUrl: './mdfe-form.component.html',
})
export class MdfeFormComponent implements OnInit {

  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    company_id: new FormControl(''),
  });

  public validationFields: Array<any> = [];

  @Output() public navigation: BasicFormNavigation = {
    items: [
      { text: 'Geral', index: 0, icon: 'info' },
      { text: 'Modal', index: 1, icon: 'info' },
      { text: 'Documentos', index: 2, icon: 'info' },
      { text: 'Seguro', index: 2, icon: 'info' },
    ],
    selectedItem: 0
  }

  @Output() public pageHeader: PageHeader = {
    title: `MDFe`,
    description: 'Cadastro de mdfes',
    button: {
      text: 'Voltar',
      routerLink: '/mdfe',
      icon: 'arrow_back',
    },
  };

  @Output() public navigationButtons: BasicFormButtons = {
    buttons: [
      {
        text: 'Salvar',
        icon: 'save',
        action: () => this.save(),
        class: 'c2-btn c2-btn-green',
      }
    ]
  }

  public stateList = [
    { name: 'Acre', type: 'AC' },
    { name: 'Alagoas', type: 'AL' },
    { name: 'Amapá', type: 'AP' },
    { name: 'Amazonas', type: 'AM' },
    { name: 'Bahia', type: 'BA' },
    { name: 'Ceará', type: 'CE' },
    { name: 'Distrito Federal', type: 'DF' },
    { name: 'Espírito Santo', type: 'ES' },
    { name: 'Goiás', type: 'GO' },
    { name: 'Maranhão', type: 'MA' },
    { name: 'Mato Grosso', type: 'MT' },
    { name: 'Mato Grosso do Sul', type: 'MS' },
    { name: 'Minas Gerais', type: 'MG' },
    { name: 'Pará', type: 'PA' },
    { name: 'Paraíba', type: 'PB' },
    { name: 'Paraná', type: 'PR' },
    { name: 'Pernambuco', type: 'PE' },
    { name: 'Piauí', type: 'PI' },
    { name: 'Rio de Janeiro', type: 'RJ' },
    { name: 'Rio Grande do Norte', type: 'RN' },
    { name: 'Rio Grande do Sul', type: 'RS' },
    { name: 'Rondônia', type: 'RO' },
    { name: 'Roraima', type: 'RR' },
    { name: 'Santa Catarina', type: 'SC' },
    { name: 'São Paulo', type: 'SP' },
    { name: 'Sergipe', type: 'SE' },
    { name: 'Tocantins', type: 'TO' }
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private mdfeService: NDFeService,
    private notificationService: NotificationService,
    private router: Router,
    private datePipe: DatePipe,
    private dialogMessageService: DialogMessageService,
    private libraryService: LibraryService
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
  }

  save(): void {}
}
