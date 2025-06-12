import { Component, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckListService } from 'src/app/shared/services/checklist.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { DialogMessageService } from 'src/app/shared/services/dialog-message.service';
import { catchError, finalize, map, throwError } from 'rxjs';

@Component({
  selector: 'app-checklist-form',
  templateUrl: './checklist-form.component.html',
})
export class ChecklistFormComponent implements OnInit {
  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public myForm: FormGroup = new FormGroup({
    company_id: new FormControl(''),
    checklist_id: new FormControl(''),
    name: new FormControl('', Validators.required),
    primary: new FormControl(false),
  });

  @Output() searchChecklist: SearchLoadingUnique = {
    noTitle: false,
    title: 'Aparecer dentro de',
    url: 'checklist',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    paramsArray: [
      {
        param: 'primary',
        value: true,
      },
    ],
    validation: true
  };

  public validationFields: Array<any> = [
    { name: 'name', validation: true, msg: 'É necessário informar o nome'},
  ];

  @Output() public pageHeader: PageHeader = {
    title: `CheckList`,
    description: 'Cadastro de CheckList',
    button: {
      text: 'Voltar',
      routerLink: '/checklist',
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
        navigation: false,
      }
    ]
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private checklistService: CheckListService,
    private notificationService: NotificationService,
    private dialogMessageService: DialogMessageService,
    private router: Router,
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
    this.pageHeader.title = this.formId === 'new' ? 'Nova CheckList' : 'Editar CheckList';
  }

  validateForm(): void {
    this.validationFields.find((v) => v.name === 'name').validation = !!this.myForm.value.name;
  }

  ngOnInit(): void {
    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.checklistService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['checklist']);
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

      this.searchChecklist.searchFieldOn = value?.check;
      this.searchChecklist.searchField.setValue(value?.check?.name);
    }
  }

  save(): void {
    this.validateForm();

    if (this.myForm.valid) {
      this.loadingFull.active = true;

      //Se for check principal nao vincula o pai
      if (this.myForm.value.primary) {
        this.myForm.value.checklist_id = null;
      } else {
        this.myForm.value.checklist_id = this.searchChecklist?.searchFieldOn?.id || null;
      }

      this.checklistService.save(this.formId, this.myForm.value).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((res) => {
          let title = 'Atenção';
            let message = 'Ocorreu um erro ao realizar o cadastro, tente novamente mais tarde.';
            let message_next = '';

            if (res?.error?.errors?.[0]?.field === 'name') {
              title = 'Campo Nome';
              message = res.error.errors[0].message;
              message_next = 'É essecial que o nome da checklist seja informado. Sempre valide se a checklist que você está cadastrando já não está em nossa base de dados.';
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
          this.router.navigate(['checklist']);
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

}
