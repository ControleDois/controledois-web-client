import { DatePipe } from '@angular/common';
import { Component, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map, throwError } from 'rxjs';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { UserService } from 'src/app/shared/services/user.service';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';
import { BasicFormNavigation } from '../../../interfaces/basic-form-navigation.interface';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  public formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    company_id: new FormControl(0),
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    companies: new FormArray([]),
  });

  public companies = this.myForm.get('companies') as FormArray;
  @Output() public companiesOutPut: Array<SearchLoadingUnique>;

  @Output() public pageHeader: PageHeader = {
    title: `Usuário`,
    description: 'Cadastro de Usuário',
    button: {
      text: 'Voltar',
      routerLink: '/user',
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
        navigation: false
      }
    ]
  }

  @Output() public navigation: BasicFormNavigation = {
    items: [
      { text: 'Dados do Usuário', index: 0, icon: 'article_person' },
      { text: 'Empresas', index: 1, icon: 'add_business' },
    ],
    selectedItem: 0
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router,
    private datePipe: DatePipe
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
    this.pageHeader.title = this.formId === 'new' ? 'Novo Usuário' : 'Editar Usuário';
    this.companiesOutPut = [];
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.userService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['user']);
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
      if (value.companies && value.companies.length > 0) {
        for (const company of value.companies) {
          this.addCompany({ company });
        }
      }

      this.myForm.patchValue(value);
    }
  }

  save(): void {
    //Passa so os id das empresas
    this.myForm.value.companies = this.myForm.value.companies.map(
      (company) => company.company_id
    );

    this.loadingFull.active = true;
    this.userService.save(this.formId, this.myForm.value).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        this.notificationService.warn(error.error.errors[0].message);
        return throwError(error);
      }),
      map((res) => {
        this.notificationService.success('Salvo com sucesso.');
        this.formId = res.id;
        this.load();
      })
    ).subscribe();
  }

  addCompany(value: any): void {
    if (this.companies.value.find((v: any) => v.company_id === value?.company?.id)) {
      return;
    }

    const control = new FormGroup({
      company_id: new FormControl(value?.company?.id || null),
    });

    this.companies.push(control);

    this.companiesOutPut.push({
      noTitle: true,
      title: 'Empresas',
      url: 'company',
      searchFieldOn: value?.company?.people || null,
      searchFieldOnCollum: ['name'],
      sortedBy: 'name',
      orderBy: 'name',
      searchField: new FormControl(''),
      validation: true,
      paramsArray: [],
    });
  }

  removeCompany(index: any): void {
    this.companies.controls.splice(index, 1);
    this.companies.value.splice(index, 1);
    this.companiesOutPut.splice(index, 1);
  }

  selectCompany(event: any, i: any): void {
    if (this.companies.value.find((v: any) => v.company_id === event.id)) {
      this.removeCompany(i);
      return;
    }

    this.companies.at(i).setValue({
      company_id: event.company_id,
    });
  }
}
