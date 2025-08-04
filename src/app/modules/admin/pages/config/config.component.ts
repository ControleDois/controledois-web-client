import { throwError, map } from 'rxjs';
import { finalize, catchError } from 'rxjs';
import { ConfigService } from './../../../../shared/services/config.service';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Component, ElementRef, OnInit, Output, ViewChild } from '@angular/core';
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
import { PageHeader } from '../../interfaces/page-header.interface';
import { BasicFormButtons } from '../../interfaces/basic-form-buttons.interface';
import { BasicFormNavigation } from '../../interfaces/basic-form-navigation.interface';
import { DropboxFile } from 'src/app/shared/interfaces/dropbox.interface';
import { DropboxService } from 'src/app/shared/services/dropbox.service';

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
    dropbox_client_id: new FormControl(''),
    dropbox_client_secret: new FormControl(''),
    dropbox_refresh_token: new FormControl(''),
    nfe_serie: new FormControl(0),
    nfe_numero: new FormControl(0),
    nfce_serie: new FormControl(0),
    nfce_numero: new FormControl(0),
    nfe_ambiente: new FormControl(1),
    nfce_ambiente: new FormControl(1),
    mdfe_serie: new FormControl(0),
    mdfe_numero: new FormControl(0),
    mdfe_ambiente: new FormControl(1),
    cte_serie: new FormControl(0),
    cte_numero: new FormControl(0),
    cte_ambiente: new FormControl(1),
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
      certificate_path: new FormControl(''),
      certificate_password: new FormControl(''),
      phone: new FormControl(''),
      email: new FormControl(''),
      crt: new FormControl(0),
      special_regime: new FormControl(0),
      address: new FormGroup({
        zip_code: new FormControl('', Validators.required),
        address: new FormControl('', Validators.required),
        number: new FormControl('', Validators.required),
        state: new FormControl('', Validators.required),
        city: new FormControl('', Validators.required),
        district: new FormControl('', Validators.required),
        complement: new FormControl('', Validators.required),
        code_ibge: new FormControl(''),
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
    { name: '⦿ Não contribuinte', type: 9 },
    { name: '⦿ Contribuinte', type: 1 },
    { name: '⦿ Contribuinte isento', type: 2 },
  ];

  @Output() public pageHeader: PageHeader = {
    title: `Configurações`,
    description: 'Configurações gerais do sistema.',
    button: {
      text: 'Voltar',
      routerLink: '/dash',
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
      },
    ]
  }

  @Output() public navigation: BasicFormNavigation = {
    items: [
      { text: 'Dados da Empresa', index: 0, icon: 'info' },
      { text: 'Fiscal', index: 1, icon: 'info' },
      { text: 'Endereço', index: 2, icon: 'info' },
      { text: 'Config. Venda', index: 3, icon: 'info' },
      { text: 'Config. Nota', index: 4, icon: 'info' },
      { text: 'Shop', index: 5, icon: 'info' },
      { text: 'Config. Api', index: 6, icon: 'contacts' },
    ],
    selectedItem: 0
  }

  @Output() searchPeople: SearchLoadingUnique = {
    noTitle: false,
    title: 'Cliente Selecionado para Vendas',
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
        value: '{2}',
      },
    ],
  };

  @Output() searchCategory: SearchLoadingUnique = {
    noTitle: false,
    title: 'Categoria Selecionada para Vendas',
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
    title: 'Conta Selecionada para Vendas',
    url: 'bank',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
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

  @ViewChild('fileInputCertificado') fileInputCertificado!: ElementRef<HTMLInputElement>;
  public certificado: DropboxFile | undefined;

  public crt = [
    { name: '⦿ Simples Nacional', type: 0 },
    { name: '⦿ Simples Nacional, Excesso sublimete de receita bruta', type: 1 },
    { name: '⦿ Regime Normal', type: 2 },
    { name: '⦿ Simples Nacional - Microempreendedor individual - MEI', type: 3 },
  ];

  public specialRegime = [
    { name: '⦿ Sem Regime Especial', type: 0 },
    { name: '⦿ Microempresa Municipal', type: 1 },
    { name: '⦿ Estimativa', type: 2 },
    { name: '⦿ Sociedade de Profissionais', type: 3 },
    { name: '⦿ Cooperaiva', type: 4 },
    { name: '⦿ Microempresário Individual (MEI)', type: 5 },
    { name: '⦿ Microempresário e Empresa de Pequeo Porte(ME/EPP)', type: 6 },
    { name: '⦿ Lucro real', type: 7 },
  ];

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private ConfigService: ConfigService,
    private peopleService: PeopleService,
    private datePipe: DatePipe,
    private firebaseService: FirebaseService,
    private storageService: StorageService,
    private dialogMessageService: DialogMessageService,
    private dropboxService: DropboxService,
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

      this.getCertificateDropBox();
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
        (this.myForm.get('people') as FormGroup).controls['name'].setValue(cnpj["estabelecimento"]["nome_fantasia"]);
        (this.myForm.get('people') as FormGroup).controls['social_name'].setValue(cnpj["razao_social"]);
        ((this.myForm.get('people') as FormGroup).get('address') as FormGroup).controls['zip_code'].setValue(cnpj["estabelecimento"]["cep"]);
        const birth = new Date();
        const birthGet = cnpj["estabelecimento"]["data_inicio_atividade"].replace(/\D+/g, '');
        birth.setDate(birthGet.substring(6, 8));
        birth.setFullYear(birthGet.substring(0, 4));
        birth.setMonth(birthGet.substring(4, 6) - 1);

        (this.myForm.get('people') as FormGroup).controls['birth'].setValue(this.datePipe.transform(birth, 'yyyy-MM-dd'));
        (this.myForm.get('people') as FormGroup).controls['phone'].setValue(cnpj["estabelecimento"]["ddd1"] + cnpj["estabelecimento"]["telefone1"]);
        (this.myForm.get('people') as FormGroup).controls['email'].setValue(cnpj["estabelecimento"]["email"]);
        ((this.myForm.get('people') as FormGroup).get('address') as FormGroup).controls['address'].setValue(cnpj["estabelecimento"]["logradouro"]);
        ((this.myForm.get('people') as FormGroup).get('address') as FormGroup).controls['number'].setValue(cnpj["estabelecimento"]["numero"]);
        ((this.myForm.get('people') as FormGroup).get('address') as FormGroup).controls['complement'].setValue(cnpj["estabelecimento"]["complemento"]);
        ((this.myForm.get('people') as FormGroup).get('address') as FormGroup).controls['district'].setValue(cnpj["estabelecimento"]["bairro"]);
        ((this.myForm.get('people') as FormGroup).get('address') as FormGroup).controls['city'].setValue(cnpj["estabelecimento"]["cidade"]["nome"]);
        ((this.myForm.get('people') as FormGroup).get('address') as FormGroup).controls['state'].setValue(cnpj["estabelecimento"]["estado"]["sigla"]);
        ((this.myForm.get('people') as FormGroup).get('address') as FormGroup).controls['code_ibge'].setValue(cnpj["estabelecimento"]["cidade"]["ibge_id"]);
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
        ((this.myForm.get('people') as FormGroup).get('address') as FormGroup).controls['code_ibge'].setValue(cep["ibge"]);
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
          data: { id: whatsappId, qr: res.qrcode },
        });
      })
    ).subscribe();

  }

  getCertificateDropBox(): void {
    const documentPath = (this.myForm.get('people') as FormGroup).controls['document'].value || '';

    if (documentPath) {
      this.dropboxService.getCertificate(documentPath).subscribe({
        next: (response) => {
          (this.myForm.get('people') as FormGroup).controls['certificate_path'].setValue(response?.path_display);
          this.certificado = response;

        },
        error: (error) => {
          console.error(error);
          this.notificationService.error('Certificado não vinculado');
        },
      });
    }
  }

  selectCertificadoButton(): void {
    this.fileInputCertificado.nativeElement.click();
  }

  selectCertificado(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const documentPath = (this.myForm.get('people') as FormGroup).controls['document'].value || '';
      if (documentPath) {
        const arquivo = input.files[0];

        if (arquivo.name.endsWith('.pfx')) {
          const path = `/Backups/${documentPath}/Certificado/certificado.pfx`; // Define o caminho no Dropbox

          this.loadingFull.active = true;
          this.dropboxService.uploadFile(arquivo, path).subscribe({
            next: (response) => {
              console.log(response);
              (this.myForm.get('people') as FormGroup).controls['certificate_path'].setValue(response?.path_display);
              this.certificado = response;
              this.loadingFull.active = false;
            },
            error: (error) => {
              console.error('Erro no upload:', error)
              this.loadingFull.active = false;
            },
          });

        } else {
          alert('Por favor, selecione um arquivo .pfx');
          input.value = ''; // Reseta o input
        }
      }
    }
  }

  getDetailsCertificado(): string {
    if (this.certificado) {
      return this.certificado?.name + ' - ' + this.formatBytes(this.certificado?.size)
    } else {
      return ''
    }
  }

  formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = [
      'Bytes',
      'KiB',
      'MiB',
      'GiB',
      'TiB',
      'PiB',
      'EiB',
      'ZiB',
      'YiB',
    ];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
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
