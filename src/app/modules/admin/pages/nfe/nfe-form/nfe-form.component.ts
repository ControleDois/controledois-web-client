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
    indicador_pagamento: new FormControl(0),
    indicador_intermediario: new FormControl(0),
    forma_pagamento: new FormControl('01'),
    amount: new FormControl(0),
    products: new FormArray([]),
  });

  public keys = this.myForm.get('keys') as FormArray;

  public indicadorPagamento = [
    { name: '⦿ Pagamento à Vista', type: 0 },
    { name: '⦿ Pagamento a Prazo', type: 1 },
  ];

  public indicadorIntermediario = [
    { name: '⦿ (valor default) Operação sem intermediador (em site ou plataforma própria)', type: 0 },
    { name: '⦿ Operação em site ou plataforma de terceiros (intermediadores/marketplace)', type: 1 },
  ]

  public formaPagamento = [
    { name: '⦿ 01 - Dinheiro', type: '01' },
    { name: '⦿ 02 - Cheque', type: '02' },
    { name: '⦿ 03 - Cartão de Crédito', type: '03' },
    { name: '⦿ 04 - Cartão de Débito', type: '04' },
    { name: '⦿ 05 - Cartão da Loja (Private Label)', type: '05' },
    { name: '⦿ 10 - Vale Alimentação', type: '10' },
    { name: '⦿ 11 - Vale Refeição', type: '11' },
    { name: '⦿ 12 - Vale Presente', type: '12' },
    { name: '⦿ 13 - Vale Combustível', type: '13' },
    { name: '⦿ 14 - Duplicata Mercantil', type: '14' },
    { name: '⦿ 15 - Boleto Bancário', type: '15' },
    { name: '⦿ 16 - Depósito Bancário', type: '16' },
    { name: '⦿ 17 - Pagamento Instantâneo (PIX) – Dinâmico', type: '17' },
    { name: '⦿ 18 - Transferência bancária, Carteira Digital', type: '18' },
    { name: '⦿ 19 - Programa de fidelidade, Cashback, Crédito Virtual', type: '19' },
    { name: '⦿ 20 - Pagamento Instantâneo (PIX) – Estático', type: '20' },
    { name: '⦿ 21 - Crédito em Loja', type: '21' },
    { name: '⦿ 22 - Pagamento Eletrônico não Informado - falha de hardware do sistema emissor', type: '22' },
    { name: '⦿ 90 - Sem pagamento', type: '90' },
    { name: '⦿ 99 - Outros', type: '99' }
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

  @Output() searchNatureOperation: SearchLoadingUnique = {
    noTitle: false,
    title: 'Natureza da Operação',
    url: 'nfe-nature-operation',
    searchFieldOn: null,
    searchFieldOnCollum: 'description',
    sortedBy: 'description',
    orderBy: 'description',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [],
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

  public products = this.myForm.get('products') as FormArray;
  @Output() public productsOutPut: Array<SearchLoadingUnique>;

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
    this.productsOutPut = [];
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

  addProduct(value: any): void {
    const control = new FormGroup({
      product_id: new FormControl(value?.product?.id || null),
      description: new FormControl(value?.description || ''),
      amount: new FormControl(value?.amount || 0),
      cost_value: new FormControl(value?.sale_value || 0),
      subtotal: new FormControl(value?.subtotal || 0),
    });

    this.products.push(control);
    this.productsOutPut.push({
      noTitle: true,
      title: 'produto',
      url: 'product',
      searchFieldOn: value?.product || null,
      searchFieldOnCollum: 'name',
      sortedBy: 'name',
      orderBy: 'name',
      searchField: new FormControl(''),
      validation: true,
      paramsArray: [],
    });
  }

  removeProduct(index: any): void {
    this.products.controls.splice(index, 1);
    this.productsOutPut.splice(index, 1);
    this.sumValues();
  }

  selectProduct(event: any, i: any): void {
    this.products.at(i).setValue({
      product_id: event.id,
      description: '',
      amount: '1',
      cost_value: event.sale_value,
      subtotal: event.sale_value,
    });

    this.sumValues();
  }

  sumProductDetails(i: any): void {
    this.products.at(i).setValue({
      product_id: this.products.at(i).value.product_id,
      description: this.products.at(i).value.description,
      amount: this.products.at(i).value.amount,
      cost_value: this.products.at(i).value.cost_value,
      subtotal:
        this.products.at(i).value.amount * this.products.at(i).value.cost_value,
    });

    this.sumValues();
  }

  sumValues(): void {
    this.myForm.controls['amount'].setValue(
      this.products.controls.reduce((sum, product) => {
        return sum + parseFloat(product.value.subtotal);
      }, 0)
    );
  }
}
