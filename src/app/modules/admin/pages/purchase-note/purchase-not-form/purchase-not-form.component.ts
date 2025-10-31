import { Component, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseNoteService } from 'src/app/shared/services/purchase-note.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { catchError, finalize, map, throwError } from 'rxjs';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';
import { BasicFormNavigation } from '../../../interfaces/basic-form-navigation.interface';

@Component({
  selector: 'app-purchase-not-form',
  templateUrl: './purchase-not-form.component.html',
})
export class PurchaseNotFormComponent implements OnInit {

  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    company_id: new FormControl(0),
    description: new FormControl('', Validators.required),
    document_key: new FormControl('', Validators.required),
    qr_code: new FormControl('', Validators.required),
    total: new FormControl(0),
    products: new FormArray([]),
  });

  public products = this.myForm.get('products') as FormArray;
  @Output() public productsOutPut: Array<SearchLoadingUnique>;

  @Output() public pageHeader: PageHeader = {
    title: `Notas de Compra`,
    description: 'Cadastro de Notas de Compra',
    button: {
      text: 'Voltar',
      routerLink: '/purchase-note',
      icon: 'arrow_back',
    },
  };

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
        action: () => this.save(),
        class: 'c2-btn c2-btn-green',
        navigation: false,
      }
    ]
  }

  @Output() public navigation: BasicFormNavigation = {
    items: [
      { text: 'Dados da Nota', index: 0, icon: 'info' },
      { text: 'Produtos', index: 1, icon: 'info' },
    ],
    selectedItem: 0
  }

  @Output() searchPeople: SearchLoadingUnique = {
    noTitle: false,
    title: 'Fornecedor',
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
        value: '{3}'
      }
    ],
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private purchaseNoteService: PurchaseNoteService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
    this.pageHeader.title = this.formId === 'new' ? 'Nova Nota de Compra' : 'Editar Nota de Compra';
    this.productsOutPut = [];
  }

  ngOnInit(): void {
    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.purchaseNoteService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['purchase-note']);
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
      if (value.products && value.products.length > 0) {
        for (const product of value.products) {
          this.addProduct(product);
        }
      }

      this.searchPeople.searchFieldOn = value?.issuer;
      this.searchPeople.searchField.setValue(value?.issuer?.name);

      this.myForm.patchValue(value);
    }
  }

  save(): void {
    this.loadingFull.active = true;
    this.purchaseNoteService.save(this.formId, this.myForm.value).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        this.notificationService.warn(error.error.errors[0].message);
        return throwError(error);
      }),
      map((res) => {
        this.notificationService.success('Salvo com sucesso.');
        this.formId = res.id;
      })
    ).subscribe();
  }

  addProduct(value: any): void {
    const control = new FormGroup({
      product_id: new FormControl(value?.product_id || null),
      description: new FormControl(value?.descricao || ''),
      amount: new FormControl(value?.quantidade_comercial || 0),
      cost_value: new FormControl(value?.valor_unitario_comercial || 0),
      subtotal: new FormControl((value?.quantidade_comercial * value?.valor_unitario_comercial) || 0),
    });

    this.products.push(control);
    this.productsOutPut.push({
      noTitle: true,
      title: 'produto',
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
    this.myForm.controls['total'].setValue(
      this.products.controls.reduce((sum, product) => {
        return sum + parseFloat(product.value.subtotal);
      }, 0)
    );
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
}
