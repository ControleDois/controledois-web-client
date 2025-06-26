import { StorageService } from 'src/app/shared/services/storage.service';
import { Component, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { DatePipe } from '@angular/common';
import { SaleService } from 'src/app/shared/services/sale.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { LibraryService } from 'src/app/shared/services/library.service';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { BasicFormNavigation } from '../../../interfaces/basic-form-navigation.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';

@Component({
  selector: 'app-sale-form',
  templateUrl: './sale-form.component.html',
})
export class SaleFormComponent implements OnInit {
  private formId: string = '';

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public myForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    companyId: new FormControl(0),
    peopleId: new FormControl('', Validators.required),
    userId: new FormControl('', Validators.required),
    categoryId: new FormControl(''),
    saleId: new FormControl(''),
    bankAccountId: new FormControl('', Validators.required),
    role: new FormControl(1),
    status: new FormControl(0, Validators.required),
    introduction: new FormControl('', Validators.required),
    date_sale: new FormControl(
      this.datePipe.transform(new Date(), 'yyyy-MM-dd')
    ),
    date_budget: new FormControl(
      this.datePipe.transform(new Date(), 'yyyy-MM-dd')
    ),
    date_budget_validity: new FormControl(
      this.datePipe.transform(new Date(), 'yyyy-MM-dd')
    ),
    delivery_forecast_budget: new FormControl(''),
    amount: new FormControl(0),
    discount_type: new FormControl(0, Validators.required),
    discount: new FormControl(0),
    shipping: new FormControl(0),
    net_total: new FormControl(0),
    note: new FormControl('', Validators.required),
    complementary_information: new FormControl('', Validators.required),
    form_payment: new FormControl(9),
    payment_terms: new FormControl(0),
    is_contract: new FormControl(false),
    contract_billing_day: new FormControl(5),
    contract_validity_type: new FormControl(0),
    contract_date_finish: new FormControl(
      this.datePipe.transform(new Date(), 'yyyy-MM-dd')
    ),
    contract_portion: new FormControl(''),
    products: new FormArray([]),
    plots: new FormArray([]),
    checklists: new FormArray([]),
  });

  public contractDateBilling = 0;

  public products = this.myForm.get('products') as FormArray;
  @Output() public productsOutPut: Array<SearchLoadingUnique>;

  public plots = this.myForm.get('plots') as FormArray;

  public checklists = this.myForm.get('checklists') as FormArray;
  @Output() public checkListsOutPut: Array<SearchLoadingUnique>;

  public statusList = [
    { name: '⦿ Em orçamento', type: 0 },
    { name: '⦿ Orçamento aceito', type: 1 },
    { name: '⦿ Orçamento recusado', type: 2 },
    { name: '⦿ Venda', type: 3 },
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

  public paymentTermsList = [{ name: '⦿ À vista', type: 0 }];

  public contractBillingDayList: Array<any> = [];
  public contractValidityTypeList = [
    { name: '⦿ Em um período específico', type: 0 },
    { name: '⦿ Nunca', type: 1 },
  ];

  public discountTypes: Array<any> = [
    { name: '⦿ %', type: 0 },
    { name: '⦿ R$', type: 1 },
  ];

  public validationFields: Array<any> = [
    { name: 'peopleId', validation: true, msg: 'Informe um cliente!' },
    { name: 'categoryId', validation: true, msg: 'Informe uma categoria!' },
    { name: 'userId', validation: true, msg: 'Informe um usuário!' },
    {
      name: 'bankAccountId',
      validation: true,
      msg: 'Informe uma conta bancaria!',
    },
    {
      name: 'products',
      validation: true,
      msg: 'É necessário adicionar produto ou serviço!',
    },
  ];

  @Output() public pageHeader: PageHeader = {
    title: `Nova Venda`,
    description: 'Preencha os campos para salvar a venda.',
    button: {
      text: 'Voltar',
      routerLink: '/sale',
      icon: 'arrow_back',
    },
  };

  @Output() public navigation: BasicFormNavigation = {
    items: [
      { text: 'Informações Gerais', index: 0, icon: 'info' },
      { text: 'Produtos e Serviços', index: 1, icon: 'shopping_cart' },
      { text: 'Pagamentos', index: 2, icon: 'payment' },
      { text: 'Observações', index: 3, icon: 'description' },
      { text: 'CheckList', index: 4, icon: 'checklist' },
    ],
    selectedItem: 0
  }

  @Output() public navigationButtons: BasicFormButtons = {
    buttons: [
      {
        text: '',
        icon: 'arrow_back',
        action: () => this.setNavigation(false),
        class: 'c2-btn c2-btn-bg-no-color',
        navigation: true,
      },
      {
        text: '',
        icon: 'arrow_forward',
        action: () => this.setNavigation(true),
        class: 'c2-btn c2-btn-bg-no-color',
        navigation: true,
      },
      {
        text: 'Salvar',
        icon: 'save',
        action: () => this.save(false),
        class: 'c2-btn c2-btn-green',
        navigation: false,
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
    ],
  };

  @Output() searchCategory: SearchLoadingUnique = {
    noTitle: false,
    title: 'Categoria',
    url: 'category',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [
      {
        param: 'role',
        value: 1,
      },
    ],
  };

  @Output() searchBank: SearchLoadingUnique = {
    noTitle: false,
    title: 'Conta',
    url: 'bank',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [],
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
    private activatedRoute: ActivatedRoute,
    private saleService: SaleService,
    private notificationService: NotificationService,
    private router: Router,
    private libraryService: LibraryService,
    private datePipe: DatePipe,
    private storageService: StorageService
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
    this.pageHeader.title = this.formId === 'new' ? 'Nova Venda' : 'Editar Venda';
    this.productsOutPut = [];
    this.checkListsOutPut = [];
  }

  ngOnInit(): void {
    for (let i = 1; i <= 48; i++) {
      this.paymentTermsList.push({
        name: `⦿ ${i}x`,
        type: i,
      });
    }

    for (let i = 1; i <= 30; i++) {
      this.contractBillingDayList.push({ name: `⦿ ${i}° dia do mês`, type: i });
    }

    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.saleService
        .show(this.formId)
        .pipe(
          finalize(() => (this.loadingFull.active = false)),
          catchError((error) => {
            this.notificationService.warn('Dados não encontrados...');
            this.router.navigate(['sale']);
            return throwError(error);
          }),
          map((res) => {
            this.setForm(res);
          })
        )
        .subscribe();
    } else {
      const auth = this.storageService.getAuth();

      this.searchUser.searchFieldOn = auth.user.people;
      this.searchUser.searchField.setValue(auth.user.people.name);
      this.searchPeople.searchFieldOn = auth.company.config.sale_people_default;
      this.searchPeople.searchField.setValue(
        auth.company.config.sale_people_default?.name
      );
      this.searchCategory.searchFieldOn = auth.company.config.sale_category_default;
      this.searchCategory.searchField.setValue(
        auth.company.config.sale_category_default?.name
      );
      this.searchBank.searchFieldOn = auth.company.config.sale_bank_account_default;
      this.searchBank.searchField.setValue(
        auth.company.config.sale_bank_account_default?.name
      );

      this.myForm.controls['status'].setValue(3);
      this.addProduct(null);
      this.addPortion(null);
    }
  }

  setForm(value: any): void {
    if (value) {
      if (value.products && value.products.length > 0) {
        for (const product of value.products) {
          this.addProduct(product);
        }
      }

      if (value.bills && value.bills.length > 0) {
        for (const portion of value.bills) {
          this.addPortion(portion);
        }
      }

      if (value.checkLists && value.checkLists.length > 0) {
        for (const checklist of value.checkLists) {
          this.addCheckList(checklist);

          // Adiciona os checks do checklist selecionado
          if (checklist.checklist.checks && checklist.checklist.checks.length > 0) {
            const checksArray = this.getChecksForCheckList(this.checklists.length - 1);

            checklist.checklist.checks.forEach((check: any) => {
              const checkControl = new FormGroup({
                id: new FormControl(check.id),
                name: new FormControl(check.name),
                status: new FormControl(value.checkListChecks.find(c => c.checklist_id === check.id).status),
                description: new FormControl(value.checkListChecks.find(c => c.checklist_id === check.id).description),
              });
              checksArray.push(checkControl);
            });
          }
        }
      }

      this.searchUser.searchFieldOn = value.user;
      this.searchUser.searchField.setValue(value.user.name);
      this.searchPeople.searchFieldOn = value.people;
      this.searchPeople.searchField.setValue(value.people.name);
      this.searchCategory.searchFieldOn = value.category || null;
      this.searchCategory.searchField.setValue(value.category?.name || '');
      this.searchBank.searchFieldOn = value.bank || null;
      this.searchBank.searchField.setValue(value.bank?.name || '');
      this.myForm.patchValue(value);
      this.myForm.controls['date_sale'].setValue(
        this.datePipe.transform(value.date_sale, 'yyyy-MM-dd')
      );
      this.myForm.controls['date_budget'].setValue(
        this.datePipe.transform(value.date_budget, 'yyyy-MM-dd')
      );
      this.myForm.controls['date_budget_validity'].setValue(
        this.datePipe.transform(value.date_budget_validity, 'yyyy-MM-dd')
      );
      this.myForm.controls['contract_date_finish'].setValue(
        this.datePipe.transform(value.contract_date_finish, 'yyyy-MM-dd')
      );
      this.calcDateBilling();
      this.changeNavigation(this.myForm.value.status);
    }
  }

  validateForm(): void {
    this.searchPeople.validation = !!this.myForm.value.peopleId;
    this.validationFields.find((v) => v.name === 'peopleId').validation =
      !!this.myForm.value.peopleId;
    if (
      parseInt(this.myForm.value.status, 0) === 3 &&
      !this.myForm.value.is_contract
    ) {
      this.searchCategory.validation = !!this.myForm.value.categoryId;
      this.validationFields.find((v) => v.name === 'categoryId').validation =
        !!this.myForm.value.categoryId;

      this.searchBank.validation = !!this.myForm.value.bankAccountId;
      this.validationFields.find(
        (v) => v.name === 'bankAccountId'
      ).validation = !!this.myForm.value.bankAccountId;
    }

    this.validationFields.find((v) => v.name === 'products').validation =
      !!this.products.controls[0].value.product_id;
    this.searchUser.validation = !!this.myForm.value.userId;
    this.validationFields.find((v) => v.name === 'userId').validation =
      !!this.myForm.value.userId;
  }

  save(continueForm: boolean): void {
    this.loadingFull.active = true;

    this.myForm.value.peopleId = this.searchPeople?.searchFieldOn?.id;
    this.myForm.value.userId = this.searchUser?.searchFieldOn?.id;
    this.myForm.value.categoryId = this.searchCategory?.searchFieldOn?.id;
    this.myForm.value.bankAccountId = this.searchBank?.searchFieldOn?.id;
    this.myForm.value.status = parseInt(this.myForm.value.status, 0);

    this.validateForm();

    if (
      !(this.validationFields.filter((v) => v.validation === false).length > 0)
    ) {
      this.saleService
        .save(this.formId, this.myForm.value)
        .pipe(
          finalize(() => (this.loadingFull.active = false)),
          catchError((error) => {
            this.notificationService.warn(error.error);
            return throwError(error);
          }),
          map(() => {
            this.notificationService.success('Salvo com sucesso.');
            if (!continueForm) {
              this.router.navigate(['sale']);
            }
          })
        )
        .subscribe();
    } else {
      this.loadingFull.active = false;
      this.notificationService.error(
        this.validationFields.filter((v) => v.validation === false)[0].msg
      );
    }
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
      title: 'Produto / Serviço',
      url: 'product',
      searchFieldOn: value?.product || null,
      searchFieldOnCollum: ['name'],
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
    this.changePortion();
  }

  sumProductDetails(i: any): void {
    setTimeout(() => {
      this.products.at(i).setValue({
        product_id: this.products.at(i).value.product_id,
        description: this.products.at(i).value.description,
        amount: this.products.at(i).value.amount,
        cost_value: this.products.at(i).value.cost_value,
        subtotal:
          this.products.at(i).value.amount * this.products.at(i).value.cost_value,
      });

      this.sumValues();
      this.changePortion();
    }, 1000);
  }

  sumValues(): void {
    this.myForm.controls['amount'].setValue(
      this.products.controls.reduce((sum, product) => {
        return sum + parseFloat(product.value.subtotal);
      }, 0)
    );

    let discount = 0

    if (this.myForm.value.discount_type == 0) {
      discount = (parseFloat(this.myForm.value.amount) * parseFloat(this.myForm.value.discount)) / 100;
    } else {
      discount = parseFloat(this.myForm.value.discount);
    }

    const netTotal =
      parseFloat(this.myForm.value.amount) -
      discount +
      parseFloat(this.myForm.value.shipping);

    this.myForm.controls['net_total'].setValue(netTotal);
  }

  descountTypeAndShipping(): void {
    this.sumValues();
    this.changePortion();
  }

  addPortion(value: any): void {
    const control = new FormGroup({
      portion: new FormControl(value?.portion || this.plots.length + 1),
      form_payment: new FormControl(value?.form_payment || 9),
      date_due: new FormControl(
        this.datePipe.transform(value?.date_due || new Date(), 'yyyy-MM-dd')
      ),
      amount: new FormControl(parseFloat(value?.amount).toFixed(2) || 0),
      note: new FormControl(value?.note || ''),
    });

    this.plots.push(control);
  }

  changeNavigation(status: number) {
    if (status == 3) {
      this.navigation = {
        items: [
          { text: 'Informações Gerais', index: 0, icon: 'info' },
          { text: 'Produtos e Serviços', index: 1, icon: 'shopping_cart' },
          { text: 'Pagamentos', index: 2, icon: 'payment' },
          { text: 'Observações', index: 3, icon: 'description' },
          { text: 'CheckLists', index: 4, icon: 'CheckList' },
        ],
        selectedItem: this.navigation.selectedItem
      }
    } else {
      this.navigation = {
        items: [
          { text: 'Informações Gerais', index: 0, icon: 'info' },
          { text: 'Produtos e Serviços', index: 1, icon: 'shopping_cart' },
          { text: 'Observações', index: 3, icon: 'description' },
          { text: 'CheckLists', index: 4, icon: 'CheckList' },
        ],
        selectedItem: this.navigation.selectedItem == 2 ? 3 : this.navigation.selectedItem
      }
    }
  }

  changePortion(): void {
    this.changeNavigation(this.myForm.value.status);

    if (this.myForm.value.status == 3) {
      this.plots.clear();
      this.addPortion({
        portion: 1,
        form_payment: 9,
        date_due: this.myForm.value.date_sale,
        amount: parseFloat(this.myForm.value.net_total),
        note: '',
      });
    }

    if (this.myForm.value.payment_terms > 0 && this.myForm.value.status == 3) {
      this.plots.clear();
      const portionCalc = this.libraryService.calcularParcelas(
        this.myForm.value.payment_terms,
        this.myForm.value.date_sale
      );

      for (let i = 1; i <= this.myForm.value.payment_terms; i++) {
        this.addPortion({
          portion: i,
          form_payment: 9,
          date_due: this.libraryService.getFormatEs(portionCalc[i - 1]),
          amount:
            parseFloat(this.myForm.value.net_total) /
            this.myForm.value.payment_terms,
          note: '',
        });
      }
    }
  }

  calcValidityContract(): void {
    const initial = new Date(this.myForm.value.date_sale + 'T12:00:00Z');
    const validity = new Date(this.myForm.value.date_sale + 'T12:00:00Z');
    validity.setDate(this.myForm.value.contract_billing_day);
    validity.setMonth(validity.getMonth() + 11);

    this.myForm.controls['contract_date_finish'].setValue(
      this.datePipe.transform(validity, 'yyyy-MM-dd')
    );

    this.contractDateBilling =
      (validity.getFullYear() - initial.getFullYear()) * 12 +
      (validity.getMonth() - initial.getMonth()) +
      1;
  }

  calcDateBilling(): void {
    const initial = new Date(this.myForm.value.date_sale + 'T12:00:00Z');
    const validity = new Date(
      this.myForm.value.contract_date_finish + 'T12:00:00Z'
    );

    this.contractDateBilling =
      (validity.getFullYear() - initial.getFullYear()) * 12 +
      (validity.getMonth() - initial.getMonth()) +
      1;
  }

  setNavigation(nextOrBack: boolean): void {
    if (nextOrBack) {
      this.navigation.selectedItem++;
    } else {
      this.navigation.selectedItem--;
    }

    if (this.navigation.selectedItem < 0) {
      this.navigation.selectedItem = 0;
    } else if (this.navigation.selectedItem >= this.navigation.items.length) {
      this.navigation.selectedItem = this.navigation.items.length - 1;
    }
  }

  removeCheckList(index: any): void {
    this.checklists.controls.splice(index, 1);
    this.checklists.value.splice(index, 1);
  }

  getChecksForCheckList(index: any): FormArray {
    return this.checklists.at(index).get('checks') as FormArray;
  }

  addCheckList(value: any): void {
    const control = new FormGroup({
      checklist_id: new FormControl(value?.checklist?.id || null),
      checks: new FormArray([]),
    });

    this.checklists.push(control);
    this.checkListsOutPut.push({
      noTitle: true,
      title: 'CheckList',
      url: 'checklist',
      searchFieldOn: value?.checklist || null,
      searchFieldOnCollum: ['name'],
      sortedBy: 'name',
      orderBy: 'name',
      searchField: new FormControl(''),
      validation: true,
      paramsArray: [
        {
          param: 'primary',
          value: true,
        },
        {
          param: 'checks',
          value: true,
        },
      ],
    });
  }

  selectCheckList(event: any, i: any): void {
    this.checklists.at(i).setValue({
      checklist_id: event.id,
      checks: [],
    });

    // Adiciona os checks do checklist selecionado
    if (event.checks && event.checks.length > 0) {
      const checksArray = this.getChecksForCheckList(i);
      event.checks.forEach((check: any) => {
        const checkControl = new FormGroup({
          id: new FormControl(check.id),
          name: new FormControl(check.name),
          status: new FormControl(3),
          description: new FormControl(check.description || ''),
        });
        checksArray.push(checkControl);
      });
    }
  }

  getStatusCheck(status: number, indexCheck: number, indexList: number): boolean {
    const checksArray = this.getChecksForCheckList(indexCheck);

    if (checksArray && checksArray.length > 0) {
      const check = checksArray.at(indexList);
      if (check && check.value.status !== undefined) {
        return check.value.status === status;
      }
    }

    return false;
  }

  setStatusCheck(status: number, indexCheck: number, indexList: number): void {
    const checksArray = this.getChecksForCheckList(indexCheck);

    if (checksArray && checksArray.length > 0) {
      const check = checksArray.at(indexList);
      if (check) {
        check.patchValue({ status: status });
      }
    }
  }
}
