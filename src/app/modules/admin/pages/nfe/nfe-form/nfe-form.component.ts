import { DatePipe } from '@angular/common';
import { Component, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map, throwError } from 'rxjs';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { DialogMessageService } from 'src/app/shared/services/dialog-message.service';
import { LibraryService } from 'src/app/shared/services/library.service';
import { NFeService } from 'src/app/shared/services/nfe.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { BasicFormNavigation } from '../../../interfaces/basic-form-navigation.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';

@Component({
  selector: 'app-nfe-form',
  templateUrl: './nfe-form.component.html',
})
export class NfeFormComponent implements OnInit {
  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    company_id: new FormControl(''),
    natureza_operacao: new FormControl('', Validators.required),
    serie: new FormControl(),
    numero: new FormControl(),
    data_emissao: new FormControl(Validators.required),
    data_entrada_saida: new FormControl(Validators.required),
    tipo_documento: new FormControl(0, Validators.required),
    local_destino: new FormControl(1, Validators.required),
    municipio_prestacao: new FormControl(''),
    finalidade_emissao: new FormControl(1, Validators.required),
    consumidor_final: new FormControl(1, Validators.required),
    presenca_comprador: new FormControl(1, Validators.required),
    indicador_intermediario: new FormControl(0),
    cnpj_emitente: new FormControl('', Validators.required),
    cpf_emitente: new FormControl('', Validators.required),
    nome_emitente: new FormControl(''),
    nome_fantasia_emitente: new FormControl(''),
    logradouro_emitente: new FormControl(''),
    numero_emitente: new FormControl(''),
    complemento_emitente: new FormControl(''),
    bairro_emitente: new FormControl(''),
    municipio_emitente: new FormControl(''),
    uf_emitente: new FormControl(''),
    cep_emitente: new FormControl(''),
    telefone_emitente: new FormControl(''),
    inscricao_estadual_emitente: new FormControl('', Validators.required),
    inscricao_estadual_st_emitente: new FormControl(''),
    inscricao_municipal_emitente: new FormControl(''),
    cnae_fiscal_emitente: new FormControl(''),
    regime_tributario_emitente: new FormControl(1),
    cnpj_destinatario: new FormControl(''),
    cpf_destinatario: new FormControl(''),
    id_estrangeiro_destinatario: new FormControl(''),
    nome_destinatario: new FormControl('', Validators.required),
    logradouro_destinatario: new FormControl('', Validators.required),
    numero_destinatario: new FormControl('', Validators.required),
    complemento_destinatario: new FormControl(''),
    bairro_destinatario: new FormControl('', Validators.required),
    codigo_municipio_destinatario: new FormControl(''),
    municipio_destinatario: new FormControl('', Validators.required),
    uf_destinatario: new FormControl('', Validators.required),
    cep_destinatario: new FormControl(''),
    codigo_pais_destinatario: new FormControl('1058'),
    pais_destinatario: new FormControl('BRASIL'),
    telefone_destinatario: new FormControl(''),
    indicador_inscricao_estadual_destinatario: new FormControl(1, Validators.required),
    inscricao_estadual_destinatario: new FormControl(''),
    inscricao_suframa_destinatario: new FormControl(''),
    inscricao_municipal_destinatario: new FormControl(''),
    email_destinatario: new FormControl(''),
    cnpj_retirada: new FormControl(''),
    cpf_retirada: new FormControl(''),
    nome_retirada: new FormControl(''),
    logradouro_retirada: new FormControl(''),
    numero_retirada: new FormControl(''),
    complemento_retirada: new FormControl(''),
    bairro_retirada: new FormControl(''),
    codigo_municipio_retirada: new FormControl(''),
    municipio_retirada: new FormControl(''),
    uf_retirada: new FormControl(''),
    cep_retirada: new FormControl(''),
    codigo_pais_retirada: new FormControl('1058'),
    pais_retirada: new FormControl('BRASIL'),
    telefone_retirada: new FormControl(''),
    email_retirada: new FormControl(''),
    inscricao_estadual_retirada: new FormControl(''),
    cnpj_entrega: new FormControl(''),
    cpf_entrega: new FormControl(''),
    nome_entrega: new FormControl(''),
    logradouro_entrega: new FormControl(''),
    numero_entrega: new FormControl(''),
    complemento_entrega: new FormControl(''),
    bairro_entrega: new FormControl(''),
    codigo_municipio_entrega: new FormControl(''),
    municipio_entrega: new FormControl(''),
    uf_entrega: new FormControl(''),
    cep_entrega: new FormControl(''),
    codigo_pais_entrega: new FormControl('1058'),
    pais_entrega: new FormControl('BRASIL'),
    telefone_entrega: new FormControl(''),
    email_entrega: new FormControl(''),
    inscricao_estadual_entrega: new FormControl(''),
    icms_base_calculo: new FormControl(0),
    icms_valor_total: new FormControl(0),
    icms_valor_total_desonerado: new FormControl(0),
    fcp_valor_total_desonerado: new FormControl(0),
    fcp_valor_total_uf_destino: new FormControl(0),
    icms_valor_total_uf_destino: new FormControl(0),
    icms_valor_total_uf_remetente: new FormControl(0),
    fcp_valor_total: new FormControl(0),
    icms_base_calculo_st: new FormControl(0),
    icms_valor_total_st: new FormControl(0),
    fcp_valor_total_st: new FormControl(0),
    fcp_valor_total_retido_st: new FormControl(0),
    icms_base_calculo_mono: new FormControl(0),
    icms_valor_mono: new FormControl(0),
    icms_base_calculo_mono_retencao: new FormControl(0),
    icms_valor_mono_retencao: new FormControl(0),
    icms_base_calculo_mono_retido: new FormControl(0),
    icms_valor_mono_retido: new FormControl(0),
    valor_produtos: new FormControl(0, Validators.required),
    valor_frete: new FormControl(0, Validators.required),
    valor_seguro: new FormControl(0, Validators.required),
    valor_desconto: new FormControl(0, Validators.required),
    valor_total_ii: new FormControl(0, Validators.required),
    valor_ipi: new FormControl(0, Validators.required),
    valor_ipi_devolvido: new FormControl(0, Validators.required),
    valor_pis: new FormControl(0, Validators.required),
    valor_cofins: new FormControl(0, Validators.required),
    valor_outras_despesas: new FormControl(0, Validators.required),
    valor_total: new FormControl(0, Validators.required),
    valor_total_tributos: new FormControl(0),
    valor_total_servicos: new FormControl(0),
    issqn_base_calculo: new FormControl(0),
    issqn_valor_total: new FormControl(0),
    valor_pis_servicos: new FormControl(0),
    valor_cofins_servicos: new FormControl(0),
    data_prestacao_servico: new FormControl(),
    issqn_valor_total_deducao: new FormControl(0),
    issqn_valor_total_outras_retencoes: new FormControl(0),
    issqn_valor_total_desconto_incondicionado: new FormControl(0),
    issqn_valor_total_desconto_condicionado: new FormControl(0),
    issqn_valor_total_retencao: new FormControl(0),
    codigo_regime_especial_tributacao: new FormControl(),
    pis_valor_retido: new FormControl(0),
    cofins_valor_retido: new FormControl(0),
    csll_valor_retido: new FormControl(0),
    csll_base_calculo: new FormControl(0),
    irrf_base_calculo: new FormControl(0),
    irrf_valor_retido: new FormControl(0),
    prev_social_base_calculo: new FormControl(0),
    prev_social_valor_retido: new FormControl(0),
    modalidade_frete: new FormControl(0, Validators.required),
    cnpj_transportador: new FormControl(''),
    cpf_transportador: new FormControl(''),
    nome_transportador: new FormControl(''),
    inscricao_estadual_transportador: new FormControl(''),
    endereco_transportador: new FormControl(''),
    municipio_transportador: new FormControl(''),
    uf_transportador: new FormControl(''),
    transporte_icms_servico: new FormControl(0),
    transporte_icms_base_calculo: new FormControl(0),
    transporte_icms_aliquota: new FormControl(0),
    transporte_icms_valor: new FormControl(0),
    transporte_icms_cfop: new FormControl(0),
    transporte_icms_codigo_municipio: new FormControl(0),
    veiculo_placa: new FormControl(''),
    veiculo_uf: new FormControl(''),
    veiculo_rntc: new FormControl(''),
    veiculo_indentificacao_vagao: new FormControl(''),
    veiculo_identificacao_balsa: new FormControl(''),
    numero_fatura: new FormControl(''),
    valor_original_fatura: new FormControl(0),
    valor_desconto_fatura: new FormControl(0),
    valor_liquido_fatura: new FormControl(0),
    valor_troco: new FormControl(0),
    cnpj_intermediario: new FormControl(''),
    id_intermediario: new FormControl(''),
    informacoes_adicionais_fisco: new FormControl(''),
    informacoes_adicionais_contribuinte: new FormControl(''),
    n_a: new FormControl(''),
    nota_empenho_compra: new FormControl(''),
    pedido_compra: new FormControl(''),
    contrato_compra: new FormControl(''),
    uf_local_embarque: new FormControl(''),
    local_embarque: new FormControl(''),
    local_despacacho: new FormControl(''),
    cnpj_responsavel_tecnico: new FormControl(''),
    contato_responsavel_tecnico: new FormControl(''),
    email_responsavel_tecnico: new FormControl(''),
    telefone_responsavel_tecnico: new FormControl(''),
  });

  public keys = this.myForm.get('keys') as FormArray;

  public peopleRole = [
    { name: '⦿ Física', type: 0 },
    { name: '⦿ Juridíca', type: 1 },
  ];

  public stateRegistrationIndicator = [
    { name: '⦿ Não contribuinte', type: 0 },
    { name: '⦿ Contribuinte', type: 1 },
    { name: '⦿ Contribuinte isento', type: 2 },
  ];

  public validationFields: Array<any> = [
    { name: 'document', validation: true, msg: this.myForm.value.people_type === 0 ? 'É necessário informar o CPF' : 'É necessário informar o CNPJ' },
    { name: 'name', validation: true, msg: this.myForm.value.people_type === 0 ? 'É necessário informar o nome' : 'É necessário informar o nome fantasia' },
  ];

  @Output() searchPeople: SearchLoadingUnique = {
    noTitle: false,
    title: 'Cliente',
    url: 'people',
    searchFieldOn: null,
    searchFieldOnCollum: 'name',
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [
      {
        param: 'roles',
        value: '{2}'
      }
    ],
  };

  @Output() public pageHeader: PageHeader = {
    title: `NFe`,
    description: 'Cadastro de nfes',
    button: {
      text: 'Voltar',
      routerLink: '/nfe',
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
      { text: 'Dados da NFe', index: 0, icon: 'info' },
      { text: 'Produtos', index: 1, icon: 'info' },
      { text: 'Outros', index: 2, icon: 'info' },
    ],
    selectedItem: 0
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private nfeService: NFeService,
    private notificationService: NotificationService,
    private router: Router,
    private datePipe: DatePipe,
    private dialogMessageService: DialogMessageService,
    private libraryService: LibraryService
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
  }

  validateForm(): void {
    this.validationFields.find((v) => v.name === 'name').validation = !!this.myForm.value.name;
    this.validationFields.find((v) => v.name === 'document').validation = !!this.myForm.value.document;
  }

  ngOnInit(): void {
    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.nfeService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['nfe']);
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
      this.myForm.patchValue(value);
      this.myForm.controls['birth'].setValue(this.datePipe.transform(value.birth, 'yyyy-MM-dd'));

      if (value.keys && value.keys.length > 0) {
        for (const key of value.keys) {
          //
        }
      }
    }
  }

  save(): void {
    this.validateForm();

    if (this.myForm.valid) {
      this.loadingFull.active = true;
      this.nfeService.save(this.formId, this.myForm.value).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((res) => {
          let title = 'Atenção';
            let message = 'Ocorreu um erro ao realizar o cadastro, tente novamente mais tarde.';
            let message_next = '';

            if (res?.error?.errors?.[0]?.field === 'document') {
              title = this.myForm.value.people_type === 0 ? 'Campo CPF' : 'Campo CNPJ';
              message = res.error.errors[0].message;
              message_next = 'Para cadastrar um CPF, é necessário que ele tenha 11 dígitos. Para cadastrar um CNPJ, é necessário que ele tenha 14 dígitos. Caso o CPF ou CNPJ esteja correto, talvez a empresa já esteja cadastrada em nossa base de dados.';
            }

            if (res?.error?.errors?.[0]?.field === 'name') {
              title = this.myForm.value.people_type === 0 ? 'Campo Nome' : 'Campo Nome Fantasia';
              message = res.error.errors[0].message;
              message_next = 'É essecial que o nome do cliente seja informado. Sempre valide se o cliente que você está cadastrando já não está em nossa base de dados.';
            }

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
          this.router.navigate(['people']);
        })
      ).subscribe();
    } else {
      this.dialogMessageService.openDialog({
        icon: 'priority_high',
        iconColor: '#ff5959',
        title: 'Campos inválidos',
        message: 'Existem campos inválidos, verifique se todos os campos estão preenchidos corretamente.',
        message_next: 'Todos os campos são obrigatórios, verifique se todos os campos estão preenchidos corretamente.',
      });
    }
  }

  getValidation(name: string): boolean {
    return !this.validationFields.find((v) => v.name === name).validation;
  }
}
