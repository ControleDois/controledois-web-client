import { catchError, finalize, map } from 'rxjs/operators';
import { Component, ElementRef, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { throwError } from 'rxjs';
import { DatePipe } from "@angular/common";
import { PeopleService } from 'src/app/shared/services/people.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { DialogMessageService } from 'src/app/shared/services/dialog-message.service';
import { LibraryService } from 'src/app/shared/services/library.service';
import { MD5 } from 'crypto-js';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';
import { DropboxService } from 'src/app/shared/services/dropbox.service';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { BasicFormNavigation } from '../../../interfaces/basic-form-navigation.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';

@Component({
  selector: 'app-client-form',
  templateUrl: './people-form.component.html',
  styleUrls: ['./people-form.component.scss'],

})
export class PeopleFormComponent implements OnInit {
  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    company_id: new FormControl(''),
    name: new FormControl('', Validators.required),
    roles: new FormControl([2], Validators.required),
    people_type: new FormControl(0),
    social_name: new FormControl(''),
    simple: new FormControl(false),
    state_registration_indicator: new FormControl(0),
    state_registration: new FormControl(''),
    municipal_registration: new FormControl(''),
    inscription_suframa: new FormControl(''),
    document: new FormControl(''),
    general_record: new FormControl(''),
    birth: new FormControl(''),
    address: new FormGroup({
      zip_code: new FormControl(''),
      address: new FormControl(''),
      number: new FormControl(''),
      state: new FormControl(''),
      city: new FormControl(''),
      district: new FormControl(''),
      complement: new FormControl(''),
    }),
    note: new FormControl(''),
    keys: new FormArray([]),
    contacts: new FormArray([]),
    backups: new FormArray([]),
  });

  @Output() public pageHeader: PageHeader = {
    title: `Cliente`,
    description: 'Cadastro de cliente',
    button: {
      text: 'Voltar',
      routerLink: '/people',
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

  public keys = this.myForm.get('keys') as FormArray;

  public contacts = this.myForm.get('contacts') as FormArray;
  @Output() public contactsOutPut: Array<SearchLoadingUnique> = [];

  public backups = this.myForm.get('backups') as FormArray;

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

  public files: any[] = [];
  public nfe: any[] = [];
  public nfce: any[] = [];

  @Output() public navigation: BasicFormNavigation = {
    items: [
      { text: 'Dados da Pessoa', index: 0, icon: 'info' },
      { text: 'Fiscal', index: 1, icon: 'info' },
      { text: 'Endereço', index: 2, icon: 'info' },
      { text: 'Contatos', index: 3, icon: 'contacts' },
    ],
    selectedItem: 0
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private peopleService: PeopleService,
    private notificationService: NotificationService,
    private router: Router,
    private datePipe: DatePipe,
    private dialogMessageService: DialogMessageService,
    private libraryService: LibraryService,
    private dropboxService: DropboxService
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
    this.pageHeader.title = this.formId === 'new' ? 'Novo Cliente' : 'Editar Cliente';
    if (this.formId !== 'new') {
      this.navigation.items.push({ text: 'Chaves', index: 4, icon: 'vpn_key' });
      this.navigation.items.push({ text: 'Backups', index: 5, icon: 'backup' });
    }
    this.navigation.items.push({ text: 'Observações', index: 6, icon: 'folder' });
  }

  validateForm(): void {
    this.validationFields.find((v) => v.name === 'name').validation = !!this.myForm.value.name;
    this.validationFields.find((v) => v.name === 'document').validation = !!this.myForm.value.document;
  }

  ngOnInit(): void {
    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.peopleService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['people']);
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
          this.addKey(key);
        }
      }

      if (value.contacts && value.contacts.length > 0) {
        for (const contact of value.contacts) {
          this.addContact({ contact });
        }
      }

      if (value.backups && value.backups.length > 0) {
        for (const backup of value.backups) {
          this.addBackup(backup);
        }
      }

      this.listDropboxFolder();
      this.listDropboxNFe();
      this.listDropboxNFCe();
    }
  }

  save(): void {
    this.validateForm();

    if (this.myForm.valid) {
      this.loadingFull.active = true;

      this.myForm.value.contacts = this.myForm.value.contacts.map(
        (contact) => contact.contact_id
      );

      this.peopleService.save(this.formId, this.myForm.value).pipe(
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

  getCNPJ(): void {
    this.loadingFull.active = true;
    this.peopleService.cnpj(this.myForm.value.document).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        this.notificationService.warn(error.error);
        return throwError(error);
      }),
      map((cnpj) => {
        this.myForm.controls['name'].setValue(cnpj["NOME FANTASIA"]);
        this.myForm.controls['social_name'].setValue(cnpj["RAZAO SOCIAL"]);
        (this.myForm.get('address') as FormGroup).controls['zip_code'].setValue(cnpj["CEP"]);
        const birth = new Date();
        const birthGet = cnpj["DATA ABERTURA"].replace(/\D+/g, '');
        birth.setDate(birthGet.substring(0, 2));
        birth.setFullYear(birthGet.substring(4, 8));
        birth.setMonth(birthGet.substring(2, 4) - 1);
        this.myForm.controls['birth'].setValue(this.datePipe.transform(birth, 'yyyy-MM-dd'));
        this.myForm.controls['phone_commercial'].setValue(cnpj["DDD"] + cnpj["TELEFONE"]);
        this.myForm.controls['email'].setValue(cnpj["EMAIL"]);
        (this.myForm.get('address') as FormGroup).controls['address'].setValue(cnpj["LOGRADOURO"]);
        (this.myForm.get('address') as FormGroup).controls['number'].setValue(cnpj["NUMERO"]);
        (this.myForm.get('address') as FormGroup).controls['complement'].setValue(cnpj["COMPLEMENTO"]);
        (this.myForm.get('address') as FormGroup).controls['district'].setValue(cnpj["BAIRRO"]);
        (this.myForm.get('address') as FormGroup).controls['city'].setValue(cnpj["MUNICIPIO"]);
        (this.myForm.get('address') as FormGroup).controls['state'].setValue(cnpj["UF"]);
      })
    ).subscribe();
  }

  getCEP(): void {
    this.loadingFull.active = true;
    this.peopleService.cep(this.myForm.value.address.zip_code).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        this.notificationService.warn(error.error);
        return throwError(error);
      }),
      map((cep) => {
        (this.myForm.get('address') as FormGroup).controls['address'].setValue(cep["logradouro"]);
        (this.myForm.get('address') as FormGroup).controls['number'].setValue(cep["NUMERO"]);
        (this.myForm.get('address') as FormGroup).controls['complement'].setValue(cep["complemento"]);
        (this.myForm.get('address') as FormGroup).controls['district'].setValue(cep["bairro"]);
        (this.myForm.get('address') as FormGroup).controls['city'].setValue(cep["localidade"]);
        (this.myForm.get('address') as FormGroup).controls['state'].setValue(cep["uf"]);
      })
    ).subscribe();
  }

  getValidation(name: string): boolean {
    return !this.validationFields.find((v) => v.name === name).validation;
  }

  addKey(value: any): void {
    const control = new FormGroup({
      role: new FormControl(value?.role || 0),
      key: new FormControl(value?.key || ''),
      due_date: new FormControl(this.datePipe.transform(value?.due_date || new Date(), 'yyyy-MM-dd')),
    });

    this.keys.push(control);
  }

  removeKey(index: any): void {
    this.keys.controls.splice(index, 1);
    this.keys.value.splice(index, 1);
  }

  gerenateKey(index: any): void {
    const serialKeySystem = this.keys.controls[index].value.role + ' - encryptSerial - 16/04/2023';
    const due_date = this.libraryService.getFormatData(
      this.keys.controls[index].value.due_date
    );
    const key = serialKeySystem + ' - ' + this.myForm.value.document + ' - ' + due_date;
    const keyMD5 = MD5(key).toString().toUpperCase();
    this.keys.at(index).get('key')?.setValue(keyMD5);
  }

  getDaysKey(index: any): string {
    const dueDate = this.keys.controls[index].value?.due_date;
    if (dueDate) {
      const hoje = new Date();
      const dataAlvo = new Date(dueDate);

      const diffTime = dataAlvo.getTime() - hoje.getTime();
      const diffDays = Math.abs(Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      return `${diffDays} dias até a data de vencimento!`;
    } else {
      return 'Data de vencimento não definida.';
    }
  }

  selectContact(event: any, i: any): void {
    //se o contato ja existir nao adicionar
    if (this.contacts.value.find((v: any) => v.contact_id === event.id)) {
      this.removeContact(i);
      return;
    }

    this.contacts.at(i).setValue({
      contact_id: event.id,
      email: event.email,
      phone: event.phone
    });
  }

  addContact(value: any): void {
    const control = new FormGroup({
      contact_id: new FormControl(value?.contact?.id || null),
      email: new FormControl(value?.contact?.email || ''),
      phone: new FormControl(value?.contact?.phone || ''),
    });

    this.contacts.push(control);

    this.contactsOutPut.push({
      noTitle: true,
      title: 'Contatos',
      url: 'contact',
      searchFieldOn: value?.contact || null,
      searchFieldOnCollum: 'name',
      sortedBy: 'name',
      orderBy: 'name',
      searchField: new FormControl(''),
      validation: true,
      paramsArray: [],
    });
  }

  removeContact(index: any): void {
    this.contacts.controls.splice(index, 1);
    this.contactsOutPut.splice(index, 1);
  }

  addBackup(value: any): void {
    const control = new FormGroup({
      name: new FormControl(value?.name || ''),
      path: new FormControl(value?.path || ''),
      size: new FormControl(value?.size || 0),
      role: new FormControl(value?.role || 0),
      last_backup: new FormControl(this.datePipe.transform(value?.last_backup || new Date(), 'yyyy-MM-dd')),
      active: new FormControl(value?.active || false),
    });

    this.backups.push(control);
  }

  removeBackup(index: any): void {
    this.backups.controls.splice(index, 1);
    this.backups.value.splice(index, 1);
  }

  openFile(file) {
    window.open(file, '_blank');
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

  listDropboxFolder(): void {
    const documentPath = this.myForm.controls['document'].value || '';
    if (documentPath) {
      this.dropboxService.listFolder(documentPath).subscribe({
        next: (response) => {
          this.files = response;
        },
        error: (error) => {
          console.error(error);
          this.notificationService.error('Backup não encontrado.');
        },
      });
    }
  }

  listDropboxNFe(): void {
    const documentPath = this.myForm.controls['document'].value || '';
    if (documentPath) {
      this.dropboxService.listNfe(documentPath).subscribe({
        next: (response) => {
          this.nfe = response;
        },
        error: (error) => {
          console.error(error);
          this.notificationService.error('NFe não encontrado.');
        },
      });
    }
  }

  listDropboxNFCe(): void {
    const documentPath = this.myForm.controls['document'].value || '';
    if (documentPath) {
      this.dropboxService.listNfce(documentPath).subscribe({
        next: (response) => {
          this.nfce = response;
        },
        error: (error) => {
          console.error(error);
          this.notificationService.error('NFCe não encontrado.');
        },
      });
    }
  }

  downloadFile(path: string): void {
    this.loadingFull.active = true;
    this.dropboxService.downloadFile(path).subscribe(
      (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = path.split('/').pop() ?? 'default_filename';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.loadingFull.active = false;
        this.notificationService.success('Arquivo baixado com sucesso!.');
      },
      (error) => {
        console.error('Download error:', error);
        this.notificationService.error('Erro ao baixar o arquivo.');
        this.loadingFull.active = false;
      }
    );
  }
}
