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
import { DropboxFile } from 'src/app/shared/interfaces/dropbox.interface';

@Component({
  selector: 'app-client-form',
  templateUrl: './people-form.component.html',
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
    certificate_path: new FormControl(''),
    certificate_password: new FormControl(''),
    phone: new FormControl(''),
    email: new FormControl(''),
    crt: new FormControl(0),
    special_regime: new FormControl(0),
    address: new FormGroup({
      zip_code: new FormControl(''),
      address: new FormControl(''),
      number: new FormControl(''),
      state: new FormControl(''),
      city: new FormControl(''),
      district: new FormControl(''),
      complement: new FormControl(''),
      code_ibge: new FormControl(''),
    }),
    transporter: new FormGroup({
      national_transport_registration: new FormControl(''),
      vehicle_owner_type: new FormControl(0),
      transport_type: new FormControl(0),
    }),
    note: new FormControl(''),
    keys: new FormArray([]),
    contacts: new FormArray([]),
    backups: new FormArray([]),
    remoteAccess: new FormArray([]),
    vehicles: new FormArray([]),
  });

  @Output() public pageHeader: PageHeader = {
    title: `Pessoas`,
    description: 'Cadastro de pessoas',
    button: {
      text: 'Voltar',
      routerLink: '/people',
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

  public keys = this.myForm.get('keys') as FormArray;

  public contacts = this.myForm.get('contacts') as FormArray;
  @Output() public contactsOutPut: Array<SearchLoadingUnique> = [];

  public backups = this.myForm.get('backups') as FormArray;
  public remoteAccess = this.myForm.get('remoteAccess') as FormArray;

  public vehicles = this.myForm.get('vehicles') as FormArray;
  @Output() public vehiclesOutPut: Array<SearchLoadingUnique> = [];

  public peopleRole = [
    { name: '⦿ Física', type: 0 },
    { name: '⦿ Juridíca', type: 1 },
  ];

  public stateRegistrationIndicator = [
    { name: '⦿ Não contribuinte', type: 9 },
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
      { text: 'Veículos', index: 4, icon: 'contacts' },
    ],
    selectedItem: 0
  }

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

  public vehicleOwnerType = [
    { name: '⦿ Agregado (TAC)', type: 0 },
    { name: '⦿ Independente (TAC)', type: 1 },
    { name: '⦿ Outros', type: 2 },
  ];

  public transportType = [
    { name: '⦿ Empresa de Transporte de Cargas (ETC)', type: 1 },
    { name: '⦿ Transportador Autônomo de Cargas (TAC)', type: 2 },
    { name: '⦿ Cooperativa de Transporte de Cargas (CTC)', type: 3 },
  ];

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
    this.pageHeader.title = this.formId === 'new' ? 'Nova Pessoa' : 'Editar Pessoa';
    if (this.formId !== 'new') {
      this.navigation.items.push({ text: 'Chaves', index: 5, icon: 'vpn_key' });
      this.navigation.items.push({ text: 'Backups', index: 6, icon: 'backup' });
    }
    this.navigation.items.push({ text: 'Acesso Remoto', index: 7, icon: 'folder' });
    this.navigation.items.push({ text: 'Observações', index: 8, icon: 'folder' });
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

      if (value.vehicles && value.vehicles.length > 0) {
        for (const vehicle of value.vehicles) {
          this.addVehicle({ vehicle });
        }
      }

      if (value.backups && value.backups.length > 0) {
        for (const backup of value.backups) {
          this.addBackup(backup);
        }
      }

      if (value.remoteAccess && value.remoteAccess.length > 0) {
        for (const access of value.remoteAccess) {
          this.addRemoteAccess(access);
        }
      }

      this.listDropboxFolder();
      this.listDropboxNFe();
      this.listDropboxNFCe();
      this.getCertificateDropBox();
    }
  }

  save(): void {
    this.validateForm();

    if (this.myForm.valid) {
      this.loadingFull.active = true;

      this.myForm.value.contacts = this.myForm.value.contacts.map(
        (contact) => contact.contact_id
      );

      this.myForm.value.vehicles = this.myForm.value.vehicles.map(
        (vehicle) => vehicle.vehicle_id
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
        this.myForm.controls['name'].setValue(cnpj["estabelecimento"]["nome_fantasia"]);
        this.myForm.controls['social_name'].setValue(cnpj["razao_social"]);
        (this.myForm.get('address') as FormGroup).controls['zip_code'].setValue(cnpj["estabelecimento"]["cep"]);
        const birth = new Date();
        const birthGet = cnpj["estabelecimento"]["data_inicio_atividade"].replace(/\D+/g, '');
        birth.setDate(birthGet.substring(6, 8));
        birth.setFullYear(birthGet.substring(0, 4));
        birth.setMonth(birthGet.substring(4, 6) - 1);
        this.myForm.controls['birth'].setValue(this.datePipe.transform(birth, 'yyyy-MM-dd'));
        this.myForm.controls['phone'].setValue(cnpj["estabelecimento"]["ddd1"] + cnpj["estabelecimento"]["telefone1"]);
        this.myForm.controls['email'].setValue(cnpj["estabelecimento"]["email"]);
        (this.myForm.get('address') as FormGroup).controls['address'].setValue(cnpj["estabelecimento"]["logradouro"]);
        (this.myForm.get('address') as FormGroup).controls['number'].setValue(cnpj["estabelecimento"]["numero"]);
        (this.myForm.get('address') as FormGroup).controls['complement'].setValue(cnpj["estabelecimento"]["complemento"]);
        (this.myForm.get('address') as FormGroup).controls['district'].setValue(cnpj["estabelecimento"]["bairro"]);
        (this.myForm.get('address') as FormGroup).controls['city'].setValue(cnpj["estabelecimento"]["cidade"]["nome"]);
        (this.myForm.get('address') as FormGroup).controls['state'].setValue(cnpj["estabelecimento"]["estado"]["sigla"]);
        (this.myForm.get('address') as FormGroup).controls['code_ibge'].setValue(cnpj["estabelecimento"]["cidade"]["ibge_id"]);
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
        (this.myForm.get('address') as FormGroup).controls['code_ibge'].setValue(cep["ibge"]);
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
    if (this.keys.controls[index].value.role == 1) {
      const serialKeySystem = this.keys.controls[index].value.role + ' - encryptSerial - 16/04/2023';
      const due_date = this.libraryService.getFormatData(
        this.keys.controls[index].value.due_date
      );
      const key = serialKeySystem + ' - ' + this.myForm.value.document + ' - ' + due_date;
      const keyMD5 = MD5(key).toString().toUpperCase();
      this.keys.at(index).get('key')?.setValue(keyMD5);
    } else {
      const serialKeySystem = 'StartNet Informatica - encryptSerial - 16/04/2023';
      const due_date = this.libraryService.getFormatData(
        this.myForm.controls['due_date'].value
      );
      const key = serialKeySystem + this.myForm.value.document + due_date;
      console.log(key);
      const keyMD5 = MD5(key).toString().toUpperCase();
      this.myForm.controls['key'].setValue(keyMD5);
    }
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
      searchFieldOnCollum: ['name'],
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

  selectVehicle(event: any, i: any): void {
    if (this.vehicles.value.find((v: any) => v.vehicle_id === event.id)) {
      this.removeVehicle(i);
      return;
    }

    this.vehicles.at(i).setValue({
      vehicle_id: event.id,
      brand: event.brand,
      model: event.model,
      year: event.year,
      license_plate: event.license_plate,
    });
  }

  addVehicle(value: any): void {
    const control = new FormGroup({
      vehicle_id: new FormControl(value?.vehicle?.id || null),
      brand: new FormControl(value?.vehicle?.brand || ''),
      model: new FormControl(value?.vehicle?.model || ''),
      year: new FormControl(value?.vehicle?.year || ''),
      license_plate: new FormControl(value?.vehicle?.license_plate || ''),
    });

    this.vehicles.push(control);

    this.vehiclesOutPut.push({
      noTitle: true,
      title: 'Veículos',
      url: 'vehicle',
      searchFieldOn: value?.vehicle || null,
      searchFieldOnCollum: ['brand', 'model', 'year'],
      sortedBy: 'model',
      orderBy: 'model',
      searchField: new FormControl(''),
      validation: true,
      paramsArray: [],
    });
  }

  removeVehicle(index: any): void {
    this.vehicles.controls.splice(index, 1);
    this.vehiclesOutPut.splice(index, 1);
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

  roleActive(role: number): boolean {
    //Verificar se existe o role no array
    return this.myForm.value.roles.includes(role);
  }

  onRoleChange(role: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      // Adicionar o role se não existir
      if (!this.myForm.value.roles.includes(role)) {
        this.myForm.value.roles.push(role);
      }
    } else {
      // Verificar se pode remover o role
      if (this.myForm.value.roles.length > 1) {
        this.myForm.value.roles = this.myForm.value.roles.filter(item => item !== role);
      } else {
        // Se for o único role, impedir desmarcar
        checkbox.checked = true;
      }
    }
  }

  getCertificateDropBox(): void {
    const documentPath = this.myForm.controls['document'].value || '';
    if (documentPath) {
      this.dropboxService.getCertificate(documentPath).subscribe({
        next: (response) => {
          this.myForm.controls['certificate_path'].setValue(response?.path_display);
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
      const documentPath = this.myForm.controls['document'].value || '';
      if (documentPath) {
        const arquivo = input.files[0];

        if (arquivo.name.endsWith('.pfx')) {
          const path = `/Backups/${documentPath}/Certificado/certificado.pfx`; // Define o caminho no Dropbox

          this.loadingFull.active = true;
          this.dropboxService.uploadFile(arquivo, path).subscribe({
            next: (response) => {
              this.myForm.controls['certificate_path'].setValue(response.path_display);
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

  addRemoteAccess(value: any): void {
    const control = new FormGroup({
      role: new FormControl(value?.role || 0),
      name: new FormControl(value?.name || ''),
      access_id: new FormControl(value?.access_id || ''),
      access_password: new FormControl(value?.access_password || ''),
    });

    this.remoteAccess.push(control);
  }

  removeRemoteAccess(index: any): void {
    this.remoteAccess.controls.splice(index, 1);
    this.remoteAccess.value.splice(index, 1);
  }

  openRemoteAccess(index: any): void {
    const id = this.remoteAccess.controls[index].value.access_id.replace(/\s/g, "");
    const password = this.remoteAccess.controls[index].value.access_password;
    window.open(`rustdesk://${id}#${password}`, '_blank');
  }

  getDetailsCertificado(): string {
    if (this.certificado) {
      return this.certificado?.name + ' - ' + this.formatBytes(this.certificado?.size)
    } else {
      return ''
    }
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
