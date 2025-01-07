import {Component, OnInit, Output} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {catchError, finalize, map} from "rxjs/operators";
import {throwError} from "rxjs";
import {DatePipe} from '@angular/common';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';
import { BillReceivementService } from 'src/app/shared/services/bill-receivement.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { LibraryService } from 'src/app/shared/services/library.service';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { BasicFormNavigation } from '../../../interfaces/basic-form-navigation.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';

@Component({
  selector: 'app-bill-receivement-form',
  templateUrl: './bill-receivement-form.component.html',
})
export class BillReceivementFormComponent implements OnInit {

  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public myForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    company_id: new FormControl(0),
    category_id: new FormControl('', Validators.required),
    bank_account_id: new FormControl('', Validators.required),
    people_id: new FormControl(''),
    cost_center_id: new FormControl(''),
    role: new FormControl(1),
    name: new FormControl('', Validators.required),
    date_competence: new FormControl('', Validators.required),
    date_due: new FormControl('', Validators.required),
    amount: new FormControl('', Validators.required),
    repeat: new FormControl(false, Validators.required),
    repeat_period: new FormControl(0, Validators.required),
    repeat_occurrences: new FormControl(''),
    date_received: new FormControl(''),
    discount: new FormControl(''),
    fees: new FormControl(''),
    bill_value: new FormControl(''),
    form_payment: new FormControl(9),
    note: new FormControl(''),
    status: new FormControl(0),
  });

  public products = this.myForm.get('products') as FormArray;
  @Output() public productsOutPut = [];

  public repeatPeriods = [
    { name: '⦿ Diariamente', type: 0 },
    { name: '⦿ Semanalmente', type: 1 },
    { name: '⦿ Mensalmente', type: 2 },
    { name: '⦿ Bimestralmente', type: 3 },
    { name: '⦿ Trimestralmente', type: 4 },
    { name: '⦿ Semestralmente', type: 5 },
    { name: '⦿ Anualmente', type: 6 },
  ];

  public formPaymentList = [
    { name: '⦿ Boleto Bancário', type: 0 },
    { name: '⦿ Cartão de Crédito', type: 1 },
    { name: '⦿ Cartão de Débito', type: 2 },
    { name: '⦿ Carteira Digital', type: 3 },
    { name: '⦿ Cashback', type: 4 },
    { name: '⦿ Cheque', type: 5 },
    { name: '⦿ Credito da Loja', type: 6 },
    { name: '⦿ Crédito Virtual', type: 7 },
    { name: '⦿ Depósito Bancário', type: 8 },
    { name: '⦿ Dinheiro', type: 9 },
    { name: '⦿ PIX - Pagamento Instantâneo', type: 10 },
    { name: '⦿ Programa de Fidelidade', type: 11 },
    { name: '⦿ Transferência Bancária', type: 12 },
    { name: '⦿ Vale Alimentação', type: 13 },
    { name: '⦿ Vale Combustível', type: 14 },
    { name: '⦿ Vale Presente', type: 15 },
    { name: '⦿ Vale Refeição', type: 16 },
  ];

  public validationFields: Array<any> = [
    {name: 'people_id', validation: true, msg: 'Informe um fornecedor!'},
    {name: 'category_id', validation: true, msg: 'Informe uma categoria!'},
    {name: 'bank_account_id', validation: true, msg: 'Informe uma conta bancaria!'},
  ];

  @Output() searchCategory: SearchLoadingUnique = {
    noTitle: false,
    title: 'Categoria',
    url: 'category',
    searchFieldOn: null,
    searchFieldOnCollum: 'name',
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [
      {
        param: 'role',
        value: 1
      }
    ]
  };

  @Output() searchBank: SearchLoadingUnique = {
    noTitle: false,
    title: 'Conta',
    url: 'bank',
    searchFieldOn: null,
    searchFieldOnCollum: 'name',
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: []
  };

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
    ]
  };

  @Output() searchCost: SearchLoadingUnique = {
    noTitle: false,
    title: 'Centro de custo',
    url: 'cost-center',
    searchFieldOn: null,
    searchFieldOnCollum: 'name',
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: []
  };

  @Output() public pageHeader: PageHeader = {
    title: `Nova Conta a Receber`,
    description: 'Preencha os campos para adicionar uma nova conta a receber.',
    button: {
      text: 'Voltar',
      routerLink: '/bill-receivement',
      icon: 'arrow_back',
    },
  };

  @Output() public navigation: BasicFormNavigation = {
    items: [
      { text: 'Informações Gerais', index: 0, icon: 'info' },
      { text: 'Cliente e Obs', index: 1, icon: 'shopping_cart' },
      { text: 'Pagamentos', index: 2, icon: 'payment' },
    ],
    selectedItem: 0
  }

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

  constructor(
    private activatedRoute: ActivatedRoute,
    private billReceivementService: BillReceivementService,
    private notificationService: NotificationService,
    private router: Router,
    private libraryService: LibraryService,
    private datePipe: DatePipe
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
    this.pageHeader.title = this.formId === 'new' ? 'Novo Recebimento' : 'Editar Recebimento';
  }

  ngOnInit(): void {
    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.billReceivementService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['bill-receivement']);
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
      this.searchCategory.searchFieldOn = value?.category;
      this.searchCategory.searchField.setValue(value?.category?.name);
      this.searchBank.searchFieldOn = value?.bank;
      this.searchBank.searchField.setValue(value?.bank?.name);
      this.searchPeople.searchFieldOn = value?.people;
      this.searchPeople.searchField.setValue(value?.people?.name);
      this.searchCost.searchFieldOn = value?.cost;
      this.searchCost.searchField.setValue(value?.cost?.name);
      this.myForm.patchValue(value);

      this.myForm.controls['date_competence'].setValue(this.datePipe.transform(value.date_competence, 'yyyy-MM-dd'));
      this.myForm.controls['date_due'].setValue(this.datePipe.transform(value.date_due, 'yyyy-MM-dd'));
      this.myForm.controls['date_received'].setValue(this.datePipe.transform(value.date_received, 'yyyy-MM-dd'));
      this.myForm.value.status = this.myForm.value.status === 1 || false;
    }
  }

  validateForm(): void {
    this.searchPeople.validation = !!this.myForm.value.people_id;
    this.validationFields.find(v => v.name === 'people_id').validation = !!this.myForm.value.people_id;

    this.searchCategory.validation = !!this.myForm.value.category_id;
    this.validationFields.find(v => v.name === 'category_id').validation = !!this.myForm.value.category_id;

    this.searchBank.validation = !!this.myForm.value.bank_account_id;
    this.validationFields.find(v => v.name === 'bank_account_id').validation = !!this.myForm.value.bank_account_id;
  }

  save(): void {
    this.loadingFull.active = true;

    this.myForm.value.category_id = this.searchCategory?.searchFieldOn?.id;
    this.myForm.value.bank_account_id = this.searchBank?.searchFieldOn?.id;
    this.myForm.value.people_id = this.searchPeople?.searchFieldOn?.id;
    this.myForm.value.cost_center_id = this.searchCost?.searchFieldOn?.id;
    this.myForm.value.status = this.myForm.value.status ? 1 : 0;

    this.validateForm();

    if (!(this.validationFields.filter(v => v.validation === false).length > 0)) {
      this.billReceivementService.save(this.formId, this.myForm.value).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn(error.error);
          return throwError(error);
        }),
        map(() => {
          this.notificationService.success('Salvo com sucesso.');
          this.router.navigate(['bill-receivement']);
        })
      ).subscribe();
    } else {
      this.loadingFull.active = false;
      this.notificationService.error(this.validationFields.filter(v => v.validation === false)[0].msg);
    }
  }

  sumValues(): void {
    if (this.myForm.value.status) {
      const amount = parseFloat(this.myForm.value.amount) || 0;
      const discount = parseFloat(this.myForm.value.discount) || 0;
      const fees = parseFloat(this.myForm.value.fees) || 0;

      const netTotal = (amount - discount) + fees;

      this.myForm.controls['bill_value'].setValue(netTotal);
    }
  }
}
