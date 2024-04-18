import {Component, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {catchError, finalize, map} from "rxjs/operators";
import {throwError} from "rxjs";
import { CategoryService } from 'src/app/shared/services/category.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { DialogMessageService } from 'src/app/shared/services/dialog-message.service';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
})
export class CategoryFormComponent implements OnInit {
  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public myForm: FormGroup = new FormGroup({
    company_id: new FormControl(''),
    category_id: new FormControl(''),
    role: new FormControl(0, Validators.required),
    name: new FormControl('', Validators.required),
  });

  public roles = [{ name: '⦿ Despesa', type: 0 }, { name: '⦿ Receita', type: 1 }];

  @Output() searchCategory: SearchLoadingUnique = {
    noTitle: false,
    title: 'Aparecer dentro de',
    url: 'category',
    searchFieldOn: null,
    searchFieldOnCollum: 'name',
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    paramsArray: [
      {
        param: 'role',
        value: 0
      }
    ],
    validation: true
  };

  public validationFields: Array<any> = [
    { name: 'name', validation: true, msg: 'É necessário informar o nome'},
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private categoryService: CategoryService,
    private notificationService: NotificationService,
    private dialogMessageService: DialogMessageService,
    private router: Router,
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
  }

  validateForm(): void {
    this.validationFields.find((v) => v.name === 'name').validation = !!this.myForm.value.name;
  }

  ngOnInit(): void {
    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.categoryService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['category']);
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

      this.getRole();
      this.searchCategory.searchFieldOn = value?.category;
      this.searchCategory.searchField.setValue(value?.category?.name);
    }
  }

  save(): void {
    this.validateForm();

    if (this.myForm.valid) {
      this.loadingFull.active = true;
      this.myForm.value.category_id = this.searchCategory?.searchFieldOn?.id || null;

      this.categoryService.save(this.formId, this.myForm.value).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((res) => {
          let title = 'Atenção';
            let message = 'Ocorreu um erro ao realizar o cadastro, tente novamente mais tarde.';
            let message_next = '';

            if (res?.error?.errors?.[0]?.field === 'name') {
              title = 'Campo Nome';
              message = res.error.errors[0].message;
              message_next = 'É essecial que o nome da categoria seja informado. Sempre valide se a categoria que você está cadastrando já não está em nossa base de dados.';
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
          this.router.navigate(['category']);
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

  getRole(): void {
    this.searchCategory.searchFieldOn = null;
    this.searchCategory.searchField.setValue('');
    this.searchCategory.paramsArray = [
      {
        param: 'role',
        value: this.myForm.value.role
      }
    ];
  }
}
