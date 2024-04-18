import {Component, OnInit, Output} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {DatePipe} from "@angular/common";
import {catchError, finalize, map} from "rxjs/operators";
import {throwError} from "rxjs";
import { PurchaseService } from 'src/app/shared/services/purchase.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { LibraryService } from 'src/app/shared/services/library.service';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';

@Component({
  selector: 'app-purchase-form',
  templateUrl: './purchase-form.component.html',
})
export class PurchaseFormComponent implements OnInit {
  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public myForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    company_id: new FormControl(0),
    people_id: new FormControl('', Validators.required),
    user_id: new FormControl('', Validators.required),
    category_id: new FormControl(''),
    sale_id: new FormControl(''),
    bank_account_id: new FormControl('', Validators.required),
    role: new FormControl(0),
    status: new FormControl(0, Validators.required),
    introduction: new FormControl('', Validators.required),
    date_sale: new FormControl(this.datePipe.transform(new Date(), 'yyyy-MM-dd')),
    date_budget: new FormControl(this.datePipe.transform(new Date(), 'yyyy-MM-dd')),
    date_budget_validity: new FormControl(this.datePipe.transform(new Date(), 'yyyy-MM-dd')),
    delivery_forecast_budget: new FormControl(''),
    amount: new FormControl(0),
    discount_type: new FormControl(1, Validators.required),
    discount: new FormControl(0),
    shipping: new FormControl(0),
    net_total: new FormControl(0),
    note: new FormControl('', Validators.required),
    complementary_information: new FormControl('', Validators.required),
    form_payment: new FormControl(9),
    payment_terms: new FormControl(0),
    isContract: new FormControl(false),
    contract_billing_day: new FormControl(5),
    contract_validity_type: new FormControl(0),
    contract_date_finish: new FormControl(this.datePipe.transform(new Date(), 'yyyy-MM-dd')),
    contract_portion: new FormControl(''),
    products: new FormArray([]),
    plots: new FormArray([])
  });

  public contractDateBilling = 0;

  public products = this.myForm.get('products') as FormArray;
  @Output()
  public productsOutPut: Array<SearchLoadingUnique>;

  public plots = this.myForm.get('plots') as FormArray;

  public statusList = [
    {name: '⦿ Em orçamento', type: 0},
    {name: '⦿ Orçamento aceito', type: 1},
    {name: '⦿ Orçamento recusado', type: 2},
    {name: '⦿ Compra', type: 3}
  ];

  public formPaymentList = [
    {name: '⦿ Boleto Bancário', type: 0},
    {name: '⦿ Cartão de Crédito', type: 1},
    {name: '⦿ Cartão de Débito', type: 2},
    {name: '⦿ Carteira Digital', type: 3},
    {name: '⦿ Cashback', type: 4},
    {name: '⦿ Cheque', type: 5},
    {name: '⦿ Credito da Loja', type: 6},
    {name: '⦿ Crédito Virtual', type: 7},
    {name: '⦿ Depósito Bancário', type: 8},
    {name: '⦿ Dinheiro', type: 9},
    {name: '⦿ PIX - Pagamento Instantâneo', type: 10},
    {name: '⦿ Programa de Fidelidade', type: 11},
    {name: '⦿ Transferência Bancária', type: 12},
    {name: '⦿ Vale Alimentação', type: 13},
    {name: '⦿ Vale Combustível', type: 14},
    {name: '⦿ Vale Presente', type: 15},
    {name: '⦿ Vale Refeição', type: 16},
  ];

  public paymentTermsList = [
    {name: '⦿ À vista', type: 0},
  ];

  public contractBillingDayList: Array<any> = [];
  public contractValidityTypeList = [
    {name: '⦿ Em um período específico', type: 0},
    {name: '⦿ Nunca', type: 1},
  ];

  public discountTypes = [
    {name: '⦿ %', type: 0},
    {name: '⦿ R$', type: 1},
  ];

  public validationFields: Array<any> = [
    {name: 'people_id', validation: true, msg: 'Informe um cliente!'},
    {name: 'category_id', validation: true, msg: 'Informe uma categoria!'},
    {name: 'user_id', validation: true, msg: 'Informe um usuário!'},
    {name: 'bank_account_id', validation: true, msg: 'Informe uma conta bancaria!'},
    {name: 'products', validation: true, msg: 'É necessário adicionar produto ou serviço!'}
  ];

  @Output() searchPeople: SearchLoadingUnique = {
    noTitle: false,
    title: 'Fornecedor',
    url: 'people',
    searchFieldOn: null,
    searchFieldOnCollum: 'name',
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [
      {
        param: 'isProvider',
        value: true
      }
    ]
  };

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
        value: 0
      }
    ]
  };

  @Output() searchUser: SearchLoadingUnique = {
    noTitle: false,
    title: 'Usuário',
    url: 'people',
    searchFieldOn: null,
    searchFieldOnCollum: 'name',
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [
      {
        param: 'isUser',
        value: true
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

  constructor(
    private activatedRoute: ActivatedRoute,
    private purchaseService: PurchaseService,
    private notificationService: NotificationService,
    private router: Router,
    private libraryService: LibraryService,
    private datePipe: DatePipe
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
    this.productsOutPut = [];
  }

  ngOnInit(): void {
    for (let i = 1; i <= 48; i++) {
      this.paymentTermsList.push({
        name: `⦿ ${i}x`,
        type: i
      });
    }

    for (let i = 1; i <= 28; i++) {
      this.contractBillingDayList.push(
        {name: `⦿ ${i}° dia do mês`, type: i},
      );
    }

    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.purchaseService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['sale']);
          return throwError(error);
        }),
        map((res) => {
          this.setForm(res);
        })
      ).subscribe();
    } else {
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

      this.searchUser.searchFieldOn = value.user;
      this.searchUser.searchField.setValue(value.user.name);
      this.searchPeople.searchFieldOn = value?.people;
      this.searchPeople.searchField.setValue(value?.people?.name);
      this.searchCategory.searchFieldOn = value?.category;
      this.searchCategory.searchField.setValue(value?.category?.name);
      this.searchBank.searchFieldOn = value?.bank;
      this.searchBank.searchField.setValue(value?.bank?.name);
      this.myForm.patchValue(value);
      this.myForm.controls['date_sale'].setValue(this.datePipe.transform(value.date_sale, 'yyyy-MM-dd'));
      this.myForm.controls['date_budget'].setValue(this.datePipe.transform(value.date_budget, 'yyyy-MM-dd'));
      this.myForm.controls['date_budget_validity'].setValue(this.datePipe.transform(value.date_budget_validity, 'yyyy-MM-dd'));
      this.myForm.controls['contract_date_finish'].setValue(this.datePipe.transform(value.contract_date_finish, 'yyyy-MM-dd'));
      this.calcDateBilling();

      this.sumValues();
    }
  }

  validateForm(): void {
    this.searchPeople.validation = !!this.myForm.value.people_id;
    this.validationFields.find(v => v.name === 'people_id').validation = !!this.myForm.value.people_id;
    if (parseInt(this.myForm.value.status, 0) === 3 && !this.myForm.value.isContract) {
      this.searchCategory.validation = !!this.myForm.value.category_id;
      this.validationFields.find(v => v.name === 'category_id').validation = !!this.myForm.value.category_id;

      this.searchBank.validation = !!this.myForm.value.bank_account_id;
      this.validationFields.find(v => v.name === 'bank_account_id').validation = !!this.myForm.value.bank_account_id;
    }

    this.validationFields.find(v => v.name === 'products').validation = !!this.products.controls[0].value.product_id;
    this.searchUser.validation = !!this.myForm.value.user_id;
    this.validationFields.find(v => v.name === 'user_id').validation = !!this.myForm.value.user_id;
  }

  save(): void {
    this.loadingFull.active = true;

    this.myForm.value.people_id = this.searchPeople?.searchFieldOn?.id;
    this.myForm.value.user_id = this.searchUser?.searchFieldOn?.id;
    this.myForm.value.category_id = this.searchCategory?.searchFieldOn?.id;
    this.myForm.value.bank_account_id = this.searchBank?.searchFieldOn?.id;
    this.myForm.value.status = parseInt(this.myForm.value.status, 0);

    this.validateForm();

    if (!(this.validationFields.filter(v => v.validation === false).length > 0)) {
      this.purchaseService.save(this.formId, this.myForm.value).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn(error.error);
          return throwError(error);
        }),
        map(() => {
          this.notificationService.success('Salvo com sucesso.');
          this.router.navigate(['purchase']);
        })
      ).subscribe();
    } else {
      this.loadingFull.active = false;
      this.notificationService.error(this.validationFields.filter(v => v.validation === false)[0].msg);
    }
  }

  addProduct(value: any): void {
    const control = new FormGroup({
      product_id: new FormControl(value?.product?.id || null),
      description: new FormControl(value?.description || ''),
      amount: new FormControl(value?.amount || 0),
      cost_value: new FormControl(value?.cost_value || 0),
      subtotal: new FormControl(value?.subtotal || 0),
    });

    this.products.push(control);
    this.productsOutPut.push(
      {
        noTitle: true,
        title: 'Produto',
        url: 'product',
        searchFieldOn: value?.product || null,
        searchFieldOnCollum: 'name',
        sortedBy: 'name',
        orderBy: 'name',
        searchField: new FormControl(''),
        validation: true,
        paramsArray: []
      }
    );
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
      cost_value: event.cost_value,
      subtotal: event.cost_value
    });

    this.sumValues();
    this.changePortion();
  }

  sumProductDetails(i: any): void {
    this.products.at(i).setValue({
      product_id: this.products.at(i).value.product_id,
      description: this.products.at(i).value.description,
      amount: this.products.at(i).value.amount,
      cost_value: this.products.at(i).value.cost_value,
      subtotal: this.products.at(i).value.amount * this.products.at(i).value.cost_value,
    });

    this.sumValues();
    this.changePortion();
  }

  getQtdProducts() {
    return this.products.controls.reduce((sum, product) => {
      return sum + parseFloat(product.value.amount);
    }, 0);
  }

  sumValues(): void {
    this.myForm.controls['amount'].setValue(this.products.controls.reduce((sum, product) => {
      return sum + parseFloat(product.value.subtotal);
    }, 0));

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
      date_due: new FormControl(this.datePipe.transform(value?.date_due || new Date(), 'yyyy-MM-dd')),
      amount: new FormControl(parseFloat(value?.amount).toFixed(2) || 0),
      note: new FormControl(value?.note || ''),
    });

    this.plots.push(control);
  }

  changePortion(): void {
    if (this.myForm.value.payment_terms > 0 && this.myForm.value.status == 3) {
      this.plots.clear();
      const portionCalc = this.libraryService.calcularParcelas(this.myForm.value.payment_terms, this.myForm.value.date_sale);

      for (let i = 1; i <= this.myForm.value.payment_terms; i++) {
        this.addPortion({
          portion: i,
          form_payment: 9,
          date_due: this.libraryService.getFormatEs(portionCalc[i - 1]),
          amount: parseFloat(this.myForm.value.net_total) / this.myForm.value.payment_terms,
          note: ''
        });
      }
    } else if (this.myForm.value.status == 3) {
      this.plots.clear();
      this.addPortion({
        portion: 1,
        form_payment: 9,
        date_due: this.myForm.value.date_sale,
        amount: parseFloat(this.myForm.value.net_total),
        note: ''
      });
    }
  }

  calcValidityContract(): void {
    const initial = new Date(this.myForm.value.date_sale + 'T12:00:00Z');
    const validity = new Date(this.myForm.value.date_sale + 'T12:00:00Z');
    validity.setDate(this.myForm.value.contract_billing_day);
    validity.setMonth(validity.getMonth() + 11);

    this.myForm.controls['contract_date_finish'].setValue(this.datePipe.transform(validity, 'yyyy-MM-dd'));

    this.contractDateBilling = (validity.getFullYear() - initial.getFullYear()) * 12 + (validity.getMonth() - initial.getMonth()) + 1;
  }

  calcDateBilling(): void {
    const initial = new Date(this.myForm.value.date_sale + 'T12:00:00Z');
    const validity = new Date(this.myForm.value.contract_date_finish + 'T12:00:00Z');

    this.contractDateBilling = (validity.getFullYear() - initial.getFullYear()) * 12 + (validity.getMonth() - initial.getMonth()) + 1;
  }
}
