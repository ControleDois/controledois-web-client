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
    role: new FormControl(0, Validators.required),
    name: new FormControl('', Validators.required),
    sale_value: new FormControl('', Validators.required),
    description: new FormControl(''),
    img_path: new FormControl(''),
    img_url: new FormControl(''),
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

  constructor(
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private notificationService: NotificationService,
    private router: Router,
    private firebaseService: FirebaseService,
    private storageService: StorageService,
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
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
    }
  }

  async save() {
    this.loadingFull.active = true;

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
      map(() => {
        this.notificationService.success('Salvo com sucesso.');
        this.router.navigate(['product']);
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
      searchFieldOnCollum: 'name',
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
}
