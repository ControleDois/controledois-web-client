import { DatePipe } from '@angular/common';
import { Component, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map, throwError } from 'rxjs';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { CteService } from 'src/app/shared/services/cte.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';
import { BasicFormNavigation } from '../../../interfaces/basic-form-navigation.interface';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';
import { DialogMessageService } from 'src/app/shared/services/dialog-message.service';

@Component({
  selector: 'app-cte-form',
  templateUrl: './cte-form.component.html',
})
export class CteFormComponent implements OnInit {
  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    id: new FormControl(''),
    company_id: new FormControl(''),
    code: new FormControl(0),
    cfop_id: new FormControl(''),
    sender_id: new FormControl(''),
    consignor_id: new FormControl(''),
    recipient_id: new FormControl(''),
    receiver_id: new FormControl(''),
    globalized: new FormControl(false),
    document_type: new FormControl(0),
    service_type: new FormControl(0),
    service_taker: new FormControl(0),
    code_municipality_start_transport: new FormControl(''),
    municipality_start_transport: new FormControl(''),
    state_municipality_start_transport: new FormControl(''),
    code_municipality_end_transport: new FormControl(''),
    municipality_end_transport: new FormControl(''),
    state_municipality_end_transport: new FormControl(''),
    issue_date: new FormControl(''),
    load_predominant_product: new FormControl(''),
    load_value_total: new FormControl(0),
    load_other_characteristics: new FormControl(''),
    load_unit_measure: new FormControl(''),
    load_unit_type: new FormControl(''),
    load_amount: new FormControl(0),
    load_rntrc: new FormControl(''),
    total_value: new FormControl(0),
    total_receive: new FormControl(0),
    icms_tax_situation: new FormControl(''),
    icms_reduction_base_calculation: new FormControl(0),
    icms_base_calculation: new FormControl(0),
    icms_aliquot: new FormControl(0),
    icms_amount_due_another_state: new FormControl(0),
    icms_base_calculation_state_end: new FormControl(0),
    icms_percentage_fcp_state_end: new FormControl(0),
    icms_aliquot_internal_state_end: new FormControl(0),
    icms_aliquot_interstate_state_end: new FormControl(0),
    icms_sharing_state_end: new FormControl(0),
    icms_total_value_fcp_state_fim: new FormControl(0),
    icms_value_sharing_state_end: new FormControl(0),
    icms_value_sharing_state_start: new FormControl(0),
    invoice_number: new FormControl(''),
    original_invoice_value: new FormControl(0),
    invoice_discount_value: new FormControl(0),
    net_invoice_value: new FormControl(0),
    invoice_installments: new FormControl(0),
    createdAt: new FormControl(''),
    updatedAt: new FormControl(''),
    deletedAt: new FormControl(''),
    synchronized: new FormControl(''),
  });

  @Output() public pageHeader: PageHeader = {
    title: `CT-e`,
    description: 'Cadastro de CT-e',
    button: {
      text: 'Voltar',
      routerLink: '/cte',
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

  @Output() public navigation: BasicFormNavigation = {
    items: [
      { text: 'Dados da CT-e', index: 0, icon: 'info' },
      { text: 'Carga', index: 1, icon: 'info' },
      { text: 'Impostos', index: 2, icon: 'info' },
      { text: 'Cobrança', index: 3, icon: 'info' },
      { text: 'Outros', index: 4, icon: 'info' },
    ],
    selectedItem: 0
  }

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

  @Output() searchSender: SearchLoadingUnique = {
    noTitle: false,
    title: 'Remetente',
    url: 'people',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [],
  };

  @Output() searchConsignor: SearchLoadingUnique = {
    noTitle: false,
    title: 'Expedidor',
    url: 'people',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [],
  };

  @Output() searchRecipient: SearchLoadingUnique = {
    noTitle: false,
    title: 'Destinatário',
    url: 'people',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [],
  };

  @Output() searchReceiver: SearchLoadingUnique = {
    noTitle: false,
    title: 'Recebedor',
    url: 'people',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [],
  };

  @Output() searchCountiesStart: SearchLoadingUnique = {
    noTitle: false,
    title: 'Município do Início do Transporte',
    url: 'br-conties',
    searchFieldOn: null,
    searchFieldOnCollum: ['nome'],
    sortedBy: 'name',
    orderBy: 'name',
    paramsArray: [],
    searchField: new FormControl(''),
    validation: true,
  };

  @Output() searchCountiesEnd: SearchLoadingUnique = {
    noTitle: false,
    title: 'Município do término do Transporte',
    url: 'br-conties',
    searchFieldOn: null,
    searchFieldOnCollum: ['nome'],
    sortedBy: 'name',
    orderBy: 'name',
    paramsArray: [],
    searchField: new FormControl(''),
    validation: true,
  };

  public documentTypes = [
    { name: '⦿ CT-e Normal', type: 0 },
    { name: '⦿ CT-e de Complemento de Valores', type: 1 },
    { name: '⦿ CT-e de Anulação', type: 2 },
    { name: '⦿ CT-e de Substituto', type: 3 },
  ];

  public serviceTypes = [
    { name: '⦿ Normal', type: 0 },
    { name: '⦿ Subcontratada', type: 1 },
    { name: '⦿ Redespacho', type: 2 },
    { name: '⦿ Redespacho Intermediário', type: 3 },
    { name: '⦿ Serviço Vinculado a Multmodal', type: 4 },
  ];

  public serviceTanker = [
    { name: '⦿ Remetente', type: 0 },
    { name: '⦿ Expedidor', type: 1 },
    { name: '⦿ Recebedor', type: 2 },
    { name: '⦿ Destinatário', type: 3 },
    { name: '⦿ Outros', type: 4 },
  ];

  public codeUnitMeasureGrossWeightList = [
    { name: 'M3', type: '00' },
    { name: 'KG', type: '01' },
    { name: 'TON', type: '02' },
    { name: 'UNIDADE', type: '03' },
    { name: 'LITROS', type: '04' },
    { name: 'MMBTU', type: '05' },
  ]

  public icmsTaxSituation = [
    { name: '⦿ 00 - tributada integralmente', type: '00' },
    { name: '⦿ 20 - tributada com redução de base de cálculo', type: '20' },
    { name: '⦿ 40 - isenta ou não tributada e com cobrança do ICMS por substituição tributária', type: '40-sb' },
    { name: '⦿ 40 - isentas', type: '40' },
    { name: '⦿ 41 - não tributada', type: '41' },
    { name: '⦿ 51 - diferimento (a exigência do preenchimento das informações do ICMS diferido fica a critério de cada UF)', type: '51' },
    { name: '⦿ 60 - cobrado anteriormente por substituição tributária', type: '60' },
    { name: '⦿ 70 - tributada com redução de base de cálculo e com cobrança do ICMS por substituição tributária', type: '70' },
    { name: '⦿ 90 - outros (Regime Normal)', type: '90' },
    { name: '⦿ 90_outra_uf - outros (ICMS devido à UF de origem da prestação, quando diferente da UF do emitente),', type: '90-uf' },
    { name: '⦿ 90_simples_nacional - outros (regime Simples Nacional)', type: '90-sn' },
  ];

  public validationFields: Array<any> = [

  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private cteService: CteService,
    private datePipe: DatePipe,
    private notificationService: NotificationService,
    private router: Router,
    private dialogMessageService: DialogMessageService
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.cteService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['cte']);
          return throwError(error);
        }),
        map((res) => {
          this.setForm(res);
        })
      ).subscribe();
    }
  }

  setForm(value: any): void {
    if (value) {

      this.searchCfop.searchFieldOn = value?.Cfop;
      this.searchCfop.searchField.setValue(value?.Cfop?.description);

      this.searchSender.searchFieldOn = value?.sender;
      this.searchSender.searchField.setValue(value?.sender?.name);

      this.searchConsignor.searchFieldOn = value?.consignor;
      this.searchConsignor.searchField.setValue(value?.consignor?.name);

      this.searchRecipient.searchFieldOn = value?.recipient;
      this.searchRecipient.searchField.setValue(value?.recipient?.name);

      this.searchReceiver.searchFieldOn = value?.receiver;
      this.searchReceiver.searchField.setValue(value?.receiver?.name);

      this.myForm.patchValue(value);
    }
  }

  validateForm(): void {
    //
  }


  save(): void {
    this.loadingFull.active = true;

    this.myForm.value.cfop_id = this.searchCfop?.searchFieldOn?.id;
    this.myForm.value.sender_id = this.searchSender?.searchFieldOn?.id;
    this.myForm.value.consignor_id = this.searchConsignor?.searchFieldOn?.id;
    this.myForm.value.recipient_id = this.searchRecipient?.searchFieldOn?.id;
    this.myForm.value.receiver_id = this.searchReceiver?.searchFieldOn?.id;

    if (this.searchCountiesStart?.searchFieldOn) {
      this.myForm.value.code_municipality_start_transport = this.searchCountiesStart?.searchFieldOn?.id.toString();
      this.myForm.value.municipality_start_transport = this.searchCountiesStart?.searchFieldOn?.nome;
      this.myForm.value.state_municipality_start_transport = this.searchCountiesStart?.searchFieldOn?.uf_sigla;
    }

    if (this.searchCountiesEnd?.searchFieldOn) {
      this.myForm.value.code_municipality_end_transport = this.searchCountiesEnd?.searchFieldOn?.id.toString();
      this.myForm.value.municipality_end_transport = this.searchCountiesEnd?.searchFieldOn?.nome;
      this.myForm.value.state_municipality_end_transport = this.searchCountiesEnd?.searchFieldOn?.uf_sigla;
    }

    this.validateForm();

    if (
      !(this.validationFields.filter((v) => v.validation === false).length > 0)
    ) {
      this.cteService.save(this.formId, this.myForm.value).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((res) => {
          let title = 'Atenção';
          let message = 'Ocorreu um erro inesperado.';
          let message_next = '';

          // Verifica se há erros e trata cada campo individualmente
          if (res?.error?.errors?.[0]?.field) {
            const field = res.error.errors[0].field;

            switch (field) {
              case 'cfop_id':
                title = 'Campo CFOP';
                message = res.error.errors[0].message;
                message_next = 'É essencial que o CFOP seja informado. Sempre valide se o CFOP que você está cadastrando já não está em nossa base de dados.';
                break;

              case 'code_municipality_start_transport':
                title = 'Código do Município de Início';
                message = res.error.errors[0].message;
                message_next = 'Informe o código correto do município onde o transporte começa.';
                break;

              case 'municipality_start_transport':
                title = 'Município de Início do Transporte';
                message = res.error.errors[0].message;
                message_next = 'Informe o nome do município de início do transporte.';
                break;

              case 'state_municipality_start_transport':
                title = 'Estado do Município de Início';
                message = res.error.errors[0].message;
                message_next = 'Informe o estado do município de início do transporte.';
                break;

              case 'code_municipality_end_transport':
                title = 'Código do Município de Fim';
                message = res.error.errors[0].message;
                message_next = 'Informe o código correto do município onde o transporte termina.';
                break;

              case 'municipality_end_transport':
                title = 'Município de Fim do Transporte';
                message = res.error.errors[0].message;
                message_next = 'Informe o nome do município de fim do transporte.';
                break;

              case 'state_municipality_end_transport':
                title = 'Estado do Município de Fim';
                message = res.error.errors[0].message;
                message_next = 'Informe o estado do município de fim do transporte.';
                break;

              case 'issue_date':
                title = 'Data de Emissão';
                message = res.error.errors[0].message;
                message_next = 'Certifique-se de informar a data de emissão corretamente.';
                break;

              case 'load_predominant_product':
                title = 'Produto Predominante';
                message = res.error.errors[0].message;
                message_next = 'Informe o produto predominante na carga.';
                break;

              default:
                title = 'Erro Desconhecido';
                message = res.error.errors[0].message || 'Um erro ocorreu. Verifique os dados informados.';
                message_next = '';
                break;
            }
          }

          // Exibe o diálogo com as mensagens adequadas
          this.dialogMessageService.openDialog({
            icon: 'pan_tool',
            iconColor: '#ff5959',
            title: title,
            message: message,
            message_next: message_next,
          });

          return throwError(res);
        }),
        map(() => {
          this.notificationService.success('Salvo com sucesso.');
          this.router.navigate(['cte']);
        })
      ).subscribe();
    } else {
      this.loadingFull.active = false;
      this.notificationService.error(
        this.validationFields.filter((v) => v.validation === false)[0].msg
      );
    }
  }
}
