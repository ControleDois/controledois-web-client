import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map, throwError } from 'rxjs';
import { CompanyService } from 'src/app/shared/services/company.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { DialogMessageService } from 'src/app/shared/services/dialog-message.service';
import { BasicFormNavigation } from '../../../interfaces/basic-form-navigation.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';
import { DropboxFile } from 'src/app/shared/interfaces/dropbox.interface';
import { DropboxService } from 'src/app/shared/services/dropbox.service';

@Component({
  selector: 'app-company-form',
  templateUrl: './company-form.component.html',
})
export class CompanyFormComponent implements OnInit {
  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    id: new FormControl(''),
    company_id: new FormControl(''),
    name: new FormControl('', Validators.required),
    people_type: new FormControl(0, Validators.required),
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
    note: new FormControl(''),
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

  public validationFields: Array<any> = [
    { name: 'document', validation: true, msg: this.myForm.value.people_type === 0 ? 'É necessário informar o CPF' : 'É necessário informar o CNPJ' },
    { name: 'name', validation: true, msg: this.myForm.value.people_type === 0 ? 'É necessário informar o nome' : 'É necessário informar o nome fantasia' },
  ];

  @Output() public navigation: BasicFormNavigation = {
    items: [
      { text: 'Dados da Empresa', index: 0, icon: 'info' },
      { text: 'Fiscal', index: 1, icon: 'info' },
      { text: 'Endereço', index: 2, icon: 'info' },
      { text: 'Observação', index: 3, icon: 'contacts' },
    ],
    selectedItem: 0
  }

  @Output() public pageHeader: PageHeader = {
    title: `Empresas`,
    description: 'Cadastro de empresas',
    button: {
      text: 'Voltar',
      routerLink: '/company',
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
    private activatedRoute: ActivatedRoute,
    private peopleService: CompanyService,
    private notificationService: NotificationService,
    private router: Router,
    private datePipe: DatePipe,
    private dialogMessageService: DialogMessageService,
    private dropboxService: DropboxService
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
    this.pageHeader.title = this.formId === 'new' ? 'Nova Empresa' : 'Editar Empresa';
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
          this.router.navigate(['company']);
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

      this.getCertificateDropBox();
    }
  }

  save(): void {
    this.validateForm();

    if (this.myForm.valid) {
      this.loadingFull.active = true;
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
              message_next = 'É essecial que o nome da empresa seja informado. Sempre valide se o empresa que você está cadastrando já não está em nossa base de dados.';
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
          this.router.navigate(['company']);
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

  getValidation(name: string): boolean {
    return !this.validationFields.find((v) => v.name === name).validation;
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
