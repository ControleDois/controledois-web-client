import { throwError, map } from 'rxjs';
import { finalize, catchError } from 'rxjs';
import { ConfigService } from './../../../../shared/services/config.service';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Component, OnInit, Output } from '@angular/core';
import { PeopleService } from 'src/app/shared/services/people.service';
import { DatePipe } from '@angular/common';
import { People } from './../../../../shared/interfaces/people.interface';
import { SearchLoadingChips } from 'src/app/shared/widget/search-loading-chips/search-loading-chips.interface';
import { FirebaseService } from 'src/app/shared/services/firebase.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { DialogMessageService } from 'src/app/shared/services/dialog-message.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogWhatsappConnectComponent } from 'src/app/shared/widget/dialog-whatsapp-connect/dialog-whatsapp-connect.component';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
})
export class ConfigComponent implements OnInit {
  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    company_id: new FormControl(0),
    token: new FormControl('', Validators.required),
    sale_people_default_id: new FormControl('', Validators.required),
    sale_category_default_id: new FormControl('', Validators.required),
    sale_bank_account_default_id: new FormControl('', Validators.required),
    people: new FormGroup({
      id: new FormControl('', Validators.required),
      company_id: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      people_type: new FormControl(0, Validators.required),
      social_name: new FormControl('', Validators.required),
      simple: new FormControl(false, Validators.required),
      state_registration_indicator: new FormControl(0, Validators.required),
      state_registration: new FormControl(''),
      municipal_registration: new FormControl(''),
      inscription_suframa: new FormControl(''),
      document: new FormControl('', Validators.required),
      general_record: new FormControl('', Validators.required),
      birth: new FormControl('', Validators.required),
      address: new FormGroup({
        zip_code: new FormControl('', Validators.required),
        address: new FormControl('', Validators.required),
        number: new FormControl('', Validators.required),
        state: new FormControl('', Validators.required),
        city: new FormControl('', Validators.required),
        district: new FormControl('', Validators.required),
        complement: new FormControl('', Validators.required),
      }),
    }),
    shop: new FormGroup({
      color_default: new FormControl('', Validators.required),
      link_url: new FormControl('', Validators.required),
      is_active: new FormControl(false, Validators.required),
      categories: new FormArray([]),
    }),
    whatsapps: new FormArray([]),
  });

  public peopleRole = [
    { name: '⦿ Física', type: 0 },
    { name: '⦿ Juridíca', type: 1 },
  ];

  public stateRegistrationIndicator = [
    { name: '⦿ Não contribuinte', type: 0 },
    { name: '⦿ Contribuinte', type: 1 },
    { name: '⦿ Contribuinte isento', type: 2 },
  ];

  @Output() searchPeople: SearchLoadingUnique = {
    noTitle: false,
    title: 'Cliente Selecionado para Vendas',
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
        value: '{2}',
      },
    ],
  };

  @Output() searchCategory: SearchLoadingUnique = {
    noTitle: false,
    title: 'Categoria Selecionada para Vendas',
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
        value: 1,
      },
    ],
  };

  @Output() searchBank: SearchLoadingUnique = {
    noTitle: false,
    title: 'Conta Selecionada para Vendas',
    url: 'bank',
    searchFieldOn: null,
    searchFieldOnCollum: 'name',
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [],
  };

  @Output() searchCategories: SearchLoadingChips = {
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

  public shopPhoto: any;
  public shopPhotoURL: any;

  public validationFields: Array<any> = [
    { name: 'document', validation: true, msg: this.myForm.value.people_type == 0 ? 'É necessário informar o CPF' : 'É necessário informar o CNPJ' },
    { name: 'name', validation: true, msg: this.myForm.value.people_type == 0 ? 'É necessário informar o nome' : 'É necessário informar o nome fantasia' },
    { name: 'birth', validation: true, msg: this.myForm.value.people_type == 0 ? 'É necessário informar a data de nascimento' : 'É necessário informar a data de abertura' },
    { name: 'general_record', validation: true, msg: 'É necessário informar o RG' },
    { name: 'social_name', validation: true, msg: 'É necessário informar a razão social' },
    { name: 'zip_code', validation: true, msg: 'É necessário informar o CEP' },
    { name: 'address', validation: true, msg: 'É necessário informar o endereço' },
    { name: 'number', validation: true, msg: 'É necessário informar o número' },
    { name: 'district', validation: true, msg: 'É necessário informar o bairro' },
    { name: 'city', validation: true, msg: 'É necessário informar a cidade' },
    { name: 'state', validation: true, msg: 'É necessário informar o estado'},
    { name: 'sale_people_default_id', validation: true, msg: 'Em configurações de venda. É necessário informar o vendedor padrão' },
    { name: 'sale_category_default_id', validation: true, msg: 'Em configurações de venda. É necessário informar a categoria padrão' },
    { name: 'sale_bank_account_default_id', validation: true, msg: 'Em configurações de venda. É necessário informar a conta padrão' },
  ];

  public whatsapps = this.myForm.get('whatsapps') as FormArray;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private ConfigService: ConfigService,
    private peopleService: PeopleService,
    private datePipe: DatePipe,
    private firebaseService: FirebaseService,
    private storageService: StorageService,
    private dialogMessageService: DialogMessageService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadingFull.active = true;
    this.ConfigService.show()
      .pipe(
        finalize(() => (this.loadingFull.active = false)),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['dash']);
          return throwError(error);
        }),
        map((res) => {
          this.setForm(res);
        })
      )
      .subscribe();
  }

  validateForm(): void {
    this.validationFields.find((v) => v.name === 'name').validation = !!this.myForm.value.people.name;
    this.validationFields.find((v) => v.name === 'document').validation = !!this.myForm.value.people.document;
    this.validationFields.find((v) => v.name === 'birth').validation = !!this.myForm.value.people.birth;
    if (this.myForm.value.people.people_type == 0) {
      (this.myForm.get('people') as FormGroup).controls['general_record'].validator = Validators.required;
      this.validationFields.find((v) => v.name === 'general_record').validation = !!this.myForm.value.people.general_record;

      this.validationFields.find((v) => v.name === 'social_name').validation = true;
      (this.myForm.get('people') as FormGroup).controls['social_name'].validator = Validators.nullValidator;
    } else {
      (this.myForm.get('people') as FormGroup).controls['general_record'].validator = Validators.nullValidator;
      this.validationFields.find((v) => v.name === 'general_record').validation = true;

      (this.myForm.get('people') as FormGroup).controls['social_name'].validator = Validators.required;
      this.validationFields.find((v) => v.name === 'social_name').validation = !!this.myForm.value.people.social_name;
    }
    this.validationFields.find((v) => v.name === 'zip_code').validation = !!this.myForm.value.people.address.zip_code;
    this.validationFields.find((v) => v.name === 'address').validation = !!this.myForm.value.people.address.address;
    this.validationFields.find((v) => v.name === 'number').validation = !!this.myForm.value.people.address.number;
    this.validationFields.find((v) => v.name === 'district').validation = !!this.myForm.value.people.address.district;
    this.validationFields.find((v) => v.name === 'city').validation = !!this.myForm.value.people.address.city;
    this.validationFields.find((v) => v.name === 'state').validation = !!this.myForm.value.people.address.state;
    this.validationFields.find((v) => v.name === 'sale_people_default_id').validation = !!this.myForm.value.sale_people_default_id;
    this.validationFields.find((v) => v.name === 'sale_category_default_id').validation = !!this.myForm.value.sale_category_default_id;
    this.validationFields.find((v) => v.name === 'sale_bank_account_default_id').validation = !!this.myForm.value.sale_bank_account_default_id;
    this.searchPeople.validation = !!this.myForm.value.sale_people_default_id;
    this.searchCategory.validation = !!this.myForm.value.sale_category_default_id;
    this.searchBank.validation = !!this.myForm.value.sale_bank_account_default_id;
  }

  setForm(value: any): void {
    if (value) {
      this.searchPeople.searchFieldOn = value.sale_people_default;
      this.searchPeople.searchField.setValue(value.sale_people_default?.name);

      this.searchCategory.searchFieldOn = value.sale_category_default;
      this.searchCategory.searchField.setValue(
        value.sale_category_default?.name
      );

      this.searchBank.searchFieldOn = value.sale_bank_account_default;
      this.searchBank.searchField.setValue(
        value.sale_bank_account_default?.name
      );

      (this.myForm.get('people') as FormGroup).patchValue(value?.company?.people);
      (this.myForm.get('shop') as FormGroup).patchValue(value?.company?.shop);

      if (value.company?.whatsapps && value.company?.whatsapps.length > 0) {
        for (const whatsapp of value.company?.whatsapps) {
          this.addWhatsapp(whatsapp);
        }
      }

      this.searchCategories.searchFieldOn = value?.shop?.categories?.map((category: any) => category.name) || [];
      this.myForm.patchValue(value);
    }
  }

  async save() {
    this.myForm.value.sale_people_default_id =
      this.searchPeople?.searchFieldOn?.id || null;
    this.myForm.value.sale_category_default_id =
      this.searchCategory?.searchFieldOn?.id || null;
    this.myForm.value.sale_bank_account_default_id =
      this.searchBank?.searchFieldOn?.id || null;

    this.myForm.value.shop.categories = this.searchCategories.searchFieldOn;

    this.validateForm();

    console.log(this.myForm.value);
    console.log(this.validationFields.filter((v) => v.validation === false));

    if (this.validationFields.filter((v) => v.validation === false).length > 0) {
      this.dialogMessageService.openDialog({
        icon: 'priority_high',
        iconColor: '#ff5959',
        title: 'Campos inválidos',
        message: this.validationFields.filter((v) => v.validation === false).map((v) => v.msg).join('<br>'),
        message_next: 'Todos os campos são obrigatórios, verifique se todos os campos estão preenchidos corretamente.',
      });

      return;
    }

    this.loadingFull.active = true;
    this.ConfigService.save(this.myForm.value.id, this.myForm.value
      )
      .pipe(
        finalize(() => (this.loadingFull.active = false)),
        catchError((error) => {
          this.notificationService.warn(error.error.errors[0].message);
          return throwError(error);
        }),
        map(() => {
          this.notificationService.success('Salvo com sucesso.');
          this.router.navigate(['dash']);
        })
      )
      .subscribe();
  }

  getValidation(name: string): boolean {
    return !this.validationFields.find((v) => v.name === name).validation;
  }

  getCNPJ(): void {
    this.loadingFull.active = true;
    this.peopleService.cnpj(this.myForm.value.people.document).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        this.notificationService.warn(error.error);
        return throwError(error);
      }),
      map((cnpj) => {
        (this.myForm.get('people') as FormGroup).controls['name'].setValue(cnpj["NOME FANTASIA"]);
        (this.myForm.get('people') as FormGroup).controls['social_name'].setValue(cnpj["RAZAO SOCIAL"]);
        ((this.myForm.get('people') as FormGroup).get('address') as FormGroup).controls['zip_code'].setValue(cnpj["CEP"]);
        const birth = new Date();
        const birthGet = cnpj["DATA ABERTURA"].replace(/\D+/g, '');
        birth.setDate(birthGet.substring(0, 2));
        birth.setFullYear(birthGet.substring(4, 8));
        birth.setMonth(birthGet.substring(2, 4) - 1);
        (this.myForm.get('people') as FormGroup).controls['birth'].setValue(this.datePipe.transform(birth, 'yyyy-MM-dd'));
        (this.myForm.get('people') as FormGroup).controls['phone_commercial'].setValue(cnpj["DDD"] + cnpj["TELEFONE"]);
        (this.myForm.get('people') as FormGroup).controls['email'].setValue(cnpj["EMAIL"]);
        ((this.myForm.get('people') as FormGroup).get('address') as FormGroup).controls['address'].setValue(cnpj["LOGRADOURO"]);
        ((this.myForm.get('people') as FormGroup).get('address') as FormGroup).controls['number'].setValue(cnpj["NUMERO"]);
        ((this.myForm.get('people') as FormGroup).get('address') as FormGroup).controls['complement'].setValue(cnpj["COMPLEMENTO"]);
        ((this.myForm.get('people') as FormGroup).get('address') as FormGroup).controls['district'].setValue(cnpj["BAIRRO"]);
        ((this.myForm.get('people') as FormGroup).get('address') as FormGroup).controls['city'].setValue(cnpj["MUNICIPIO"]);
        ((this.myForm.get('people') as FormGroup).get('address') as FormGroup).controls['state'].setValue(cnpj["UF"]);
      })
    ).subscribe();
  }

  getCEP(): void {
    this.loadingFull.active = true;
    this.peopleService.cep(this.myForm.value.people.address.zip_code).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        this.notificationService.warn(error.error);
        return throwError(error);
      }),
      map((cep) => {
        ((this.myForm.get('people') as FormGroup).get('address') as FormGroup).controls['address'].setValue(cep["logradouro"]);
        ((this.myForm.get('people') as FormGroup).get('address') as FormGroup).controls['number'].setValue(cep["NUMERO"]);
        ((this.myForm.get('people') as FormGroup).get('address') as FormGroup).controls['complement'].setValue(cep["complemento"]);
        ((this.myForm.get('people') as FormGroup).get('address') as FormGroup).controls['district'].setValue(cep["bairro"]);
        ((this.myForm.get('people') as FormGroup).get('address') as FormGroup).controls['city'].setValue(cep["localidade"]);
        ((this.myForm.get('people') as FormGroup).get('address') as FormGroup).controls['state'].setValue(cep["uf"]);
      })
    ).subscribe();
  }

  getFile(event) {
    this.shopPhoto = event.target.files[0];
    this.myForm.value.img_url = null;
    const reader = new FileReader();
    reader.onload = () => {
      this.shopPhotoURL = reader.result as string;
    }
    reader.readAsDataURL(this.shopPhoto);
  }

  async uploadPhoto(): Promise<any> {
    if (this.shopPhoto) {
      if (this.myForm.value.shop.img_path && this.shopPhotoURL) {
        await this.firebaseService.removeStorage(this.myForm.value.shop.img_path);
      }

      const path = this.storageService.getAuth().company.id;
      this.myForm.value.shop.img_path = await this.firebaseService.uploadStorage(`companies/${path}/shops`, this.shopPhoto);
      this.myForm.value.shop.img_url = await this.firebaseService.getStorageURL(this.myForm.value.shop.img_path);
    }
  }

  startUpload(): void {
    const btn = document.getElementById('photo');
    if (btn) {
      btn.click();
    }
  }

  addWhatsapp(value: any): void {
    const control = new FormGroup({
      id: new FormControl(value?.id || ''),
      name: new FormControl(value?.name || ''),
      phone: new FormControl(value?.phone || ''),
      status: new FormControl(value?.status || 0),
    });

    this.whatsapps.push(control);
  }

  removeWhatsapp(index: any): void {
    this.whatsapps.controls.splice(index, 1);
    this.whatsapps.value.splice(index, 1);
  }

  connectWhatsapp(index: any): void {
    this.loadingFull.message = 'Buscando conexão...';
    this.loadingFull.active = true;

    const whatsappId = this.whatsapps.controls[index].value.id;

    this.ConfigService.whatsappConnect(whatsappId).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        this.notificationService.warn(error.error);
        return throwError(error);
      }),
      map((res) => {
        console.log(res);
        this.dialog.open(DialogWhatsappConnectComponent, {
          data: { id: whatsappId, qr: res.qr },
        });
      })
    ).subscribe();

  }
}
