import {Component, OnInit, Output} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { throwError } from 'rxjs';
import {catchError, finalize, map} from 'rxjs/operators';
import { Complement } from 'src/app/shared/interfaces/complement';
import { FirebaseService } from 'src/app/shared/services/firebase.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ProductService } from 'src/app/shared/services/product.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { SearchLoadingChips } from 'src/app/shared/widget/search-loading-chips/search-loading-chips.interface';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { BasicFormNavigation } from '../../../interfaces/basic-form-navigation.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit {
  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public myForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    company_id: new FormControl(0),
    ncm_id: new FormControl('', Validators.required),
    nfe_taxation_id: new FormControl('', Validators.required),
    brand_id: new FormControl(''),
    role: new FormControl(0, Validators.required),
    name: new FormControl('', Validators.required),
    sale_value: new FormControl('', Validators.required),
    description: new FormControl(''),
    barcode: new FormControl(''),
    unit: new FormControl(''),
    icms_origin: new FormControl(0),
    gross_weighy: new FormControl(''),
    fuel_anp: new FormControl(''),
    code_cest: new FormControl(''),
    cfop_state: new FormControl(''),
    cfop_interstate: new FormControl(''),
    img_path: new FormControl(''),
    img_url: new FormControl(''),
    heavy_product: new FormControl(0),
    change_price: new FormControl(false),
    shop: new FormGroup({
      name: new FormControl(''),
      sale_value: new FormControl(0),
      description: new FormControl(''),
      active_minimum_sales_quantity: new FormControl(false),
      minimum_sales_quantity: new FormControl(1),
      active: new FormControl(false),
    }),
    categories: new FormArray([]),
    complements: new FormArray([]),
  });

  @Output() searchCategory: SearchLoadingChips = {
    noTitle: false,
    title: 'Categorias',
    url: 'category-product',
    searchFieldOn: [],
    searchFieldOnCollum: 'name',
    sortedBy: 'name',
    orderBy: 'name',
    paramsArray: [],
    searchField: new FormControl(''),
    validation: true
  };

  public complements = this.myForm.get('complements') as FormArray;
  @Output() public productsOutPut: Array<Array<SearchLoadingUnique>> = [];

  public productPhoto: any;
  public productPhotoURL: any;

  @Output() public pageHeader: PageHeader = {
    title: `Novo Produto`,
    description: 'Adicione um novo produto ao sistema.',
    button: {
      text: 'Voltar',
      routerLink: '/product',
      icon: 'arrow_back',
    },
  };

  @Output() public navigation: BasicFormNavigation = {
    items: [
      { text: 'Informações Gerais', index: 0, icon: 'info' },
      { text: 'Shop', index: 1, icon: 'info' },
      { text: 'Complementos', index: 2, icon: 'shopping_cart' },
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
        action: () => this.save(),
        class: 'c2-btn c2-btn-green',
        navigation: false,
      },
    ]
  }

  public listIcmsOrigem = [
    { name: '0 - Nacional', type: 0 },
    { name: '1 - Estrangeira (importação direta)', type: 1 },
    { name: '2 - Estrangeira (adquirida no mercado interno)', type: 2 },
    { name: '3 - Nacional com mais de 40% de conteúdo estrangeiro', type: 3 },
    { name: '4 - Nacional produzida através de processos produtivos básicos', type: 4 },
    { name: '5 - Nacional com menos de 40% de conteúdo estrangeiro', type: 5 },
    { name: '6 - Estrangeira (importação direta) sem produto nacional similar', type: 6 },
    { name: '7 - Estrangeira (adquirida no mercado interno) sem produto nacional similar', type: 7 },
    { name: '8 - Nacional, mercadoria ou bem com conteúdo de importação superior a 70%', type: 8 },
  ];

  public listUnit = [
    { name: '⦿ CA - Caixa', type: 'CA' },
    { name: '⦿ CX - Caixa Grande', type: 'CX' },
    { name: '⦿ UN - Unidade', type: 'UN' },
    { name: '⦿ KG - Quilograma', type: 'KG' },
    { name: '⦿ LT - Litro', type: 'LT' },
    { name: '⦿ ML - Mililitro', type: 'ML' },
    { name: '⦿ MT - Metro', type: 'MT' },
    { name: '⦿ M2 - Metro Quadrado', type: 'M2' },
    { name: '⦿ M3 - Metro Cúbico', type: 'M3' },
    { name: '⦿ PC - Peça', type: 'PC' },
    { name: '⦿ PT - Pacote', type: 'PT' },
    { name: '⦿ CXA - Caixa com 10 unidades', type: 'CXA' },
    { name: '⦿ DZ - Dúzia', type: 'DZ' },
    { name: '⦿ GR - Grama', type: 'GR' },
    { name: '⦿ CM - Centímetro', type: 'CM' },
    { name: '⦿ MM - Milímetro', type: 'MM' },
    { name: '⦿ PAR - Par', type: 'PAR' },
    { name: '⦿ MIL - Milheiro', type: 'MIL' },
    { name: '⦿ TON - Tonelada', type: 'TON' },
    { name: '⦿ GAL - Galão', type: 'GAL' },
    { name: '⦿ BD - Barril', type: 'BD' },
    { name: '⦿ AM - Ampola', type: 'AM' },
    { name: '⦿ FR - Frasco', type: 'FR' },
    { name: '⦿ BL - Bloco', type: 'BL' },
    { name: '⦿ SC - Saco', type: 'SC' },
    { name: '⦿ RL - Rolo', type: 'RL' },
    { name: '⦿ FT - Fardo', type: 'FT' },
    { name: '⦿ CP - Copo', type: 'CP' },
    { name: '⦿ PF - Pacote Fechado', type: 'PF' },
    { name: '⦿ TM - Tambor', type: 'TM' },
    { name: '⦿ HB - Hábito (customizado)', type: 'HB' },
    { name: '⦿ CJ - Conjunto', type: 'CJ' },
    { name: '⦿ CD - Cento', type: 'CD' },
    { name: '⦿ TP - Tipo', type: 'TP' },
    { name: '⦿ TO - Toalha', type: 'TO' },
    { name: '⦿ ES - Estojo', type: 'ES' },
    { name: '⦿ PE - Pente', type: 'PE' },
  ];

  @Output() searchNCM: SearchLoadingUnique = {
    noTitle: false,
    title: 'NCM',
    url: 'ncm',
    searchFieldOn: null,
    searchFieldOnCollum: ['code'],
    sortedBy: 'description',
    orderBy: 'description',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [],
  };

  @Output() searchTaxation: SearchLoadingUnique = {
    noTitle: false,
    title: 'Grupo de Tributação',
    url: 'nfe-taxation',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [],
  };

  @Output() searchBrand: SearchLoadingUnique = {
    noTitle: false,
    title: 'Marca',
    url: 'brand',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [],
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private notificationService: NotificationService,
    private router: Router,
    private firebaseService: FirebaseService,
    private storageService: StorageService,
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
    this.pageHeader.title = this.formId === 'new' ? 'Novo Produto' : 'Editar Produto';
    this.productsOutPut = [];
  }

  ngOnInit(): void {
    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.productService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['product']);
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
      this.searchCategory.searchFieldOn = value?.categories?.map((category: any) => category.name) || [];
      this.myForm.patchValue(value);

      if (value.complements && value.complements.length > 0) {
        let index = 0;
        for (const complement of value.complements) {
          this.addComplement(complement);

          for (const product of complement.products) {
            this.addProduct(product, index);
          }

          index += 1;
        }
      }

      this.searchTaxation.searchFieldOn = value.taxation;
      this.searchTaxation.searchField.setValue(value?.taxation?.name);

      this.searchNCM.searchFieldOn = value?.ncm;
      this.searchNCM.searchField.setValue(value?.ncm?.code);

      this.searchBrand.searchFieldOn = value?.brand;
      this.searchBrand.searchField.setValue(value?.brand?.name);
    }
  }

  async save() {
    this.loadingFull.active = true;

    this.myForm.value.ncm_id = this.searchNCM?.searchFieldOn?.id;
    this.myForm.value.nfe_taxation_id = this.searchTaxation?.searchFieldOn?.id;
    this.myForm.value.brand_id = this.searchBrand?.searchFieldOn?.id;

    if (!this.myForm.value.img_url) {
      await this.uploadPhoto();
    }

    this.myForm.value.categories = this.searchCategory.searchFieldOn;

    this.productService.save(this.formId, this.myForm.value).pipe(
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

  addComplement(value: any): void {
    const control = new FormGroup({
      name: new FormControl(value?.name || ''),
      required: new FormControl(value?.required || false),
      minimum: new FormControl(value?.minimum || 1),
      maximum: new FormControl(value?.maximum || 1),
      products: new FormArray([])
    });

    this.complements.push(control);
  }

  removeComplement(index: any): void {
    this.complements.controls.splice(index, 1);
    this.complements.value.splice(index, 1);
  }

  addProduct(value: any, complement: any): void {
    const products = this.complements.at(complement).get('products') as FormArray;

    const control = new FormGroup({
      id: new FormControl(value?.product?.id || null),
      description: new FormControl(value?.description || ''),
      sale_value: new FormControl(value?.sale_value || 0),
      status: new FormControl(true),
    });

    products.push(control);
    if (!this.productsOutPut[complement]) {
      this.productsOutPut[complement] = [];
    }
    this.productsOutPut[complement].push({
      noTitle: true,
      title: 'Produto',
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

  removeProduct(index: any, complement: any): void {
    const products = this.complements.at(complement).get('products') as FormArray;
    products.controls.splice(index, 1);
    this.productsOutPut.splice(index, 1);
    this.complements.controls[complement].get('products')?.value.splice(index, 1);
  }

  selectProduct(event: any, i: any, complement: any): void {
    const products = this.complements.at(complement).get('products') as FormArray;
    products.at(i).setValue({
      id: event.id,
      description: event.name,
      sale_value: event.sale_value || 0,
      status: true,
    });
  }

  getProdutsComplement(index: any): FormArray {
    return this.complements.at(index).get('products') as FormArray;
  }

  getFile(event) {
    this.productPhoto = event.target.files[0];
    this.myForm.value.img_url = null;
    const reader = new FileReader();
    reader.onload = () => {
      this.productPhotoURL = reader.result as string;
    }
    reader.readAsDataURL(this.productPhoto);
  }

  async uploadPhoto(): Promise<any> {
    if (this.productPhoto) {
      if (this.myForm.value.img_path && this.productPhotoURL) {
        await this.firebaseService.removeStorage(this.myForm.value.img_path);
      }

      const path = this.storageService.getAuth().company.id;
      this.myForm.value.img_path = await this.firebaseService.uploadStorage(`companies/${path}/products`, this.productPhoto);
      this.myForm.value.img_url = await this.firebaseService.getStorageURL(this.myForm.value.img_path);
    }
  }

  startUpload(): void {
    const btn = document.getElementById('photo');
    if (btn) {
      btn.click();
    }
  }

  setShopOn() {
    (this.myForm.get('shop') as FormGroup).controls['name'].setValue(this.myForm.value.name);
    (this.myForm.get('shop') as FormGroup).controls['sale_value'].setValue(this.myForm.value.sale_value);
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
