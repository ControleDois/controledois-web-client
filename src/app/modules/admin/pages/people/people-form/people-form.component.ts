import { catchError, finalize, map } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
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
    email: new FormControl(''),
    phone_commercial: new FormControl(''),
    phone_cell: new FormControl(''),
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
  });

  public keys = this.myForm.get('keys') as FormArray;

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

  constructor(
    private activatedRoute: ActivatedRoute,
    private peopleService: PeopleService,
    private notificationService: NotificationService,
    private router: Router,
    private datePipe: DatePipe,
    private dialogMessageService: DialogMessageService,
    private libraryService: LibraryService
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
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
}
