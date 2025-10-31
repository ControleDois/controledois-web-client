import {Component, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {DatePipe} from '@angular/common';
import {ActivatedRoute, Router} from "@angular/router";
import {catchError, finalize, map} from "rxjs/operators";
import {throwError} from "rxjs";
import { OsService } from 'src/app/shared/services/os.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { LibraryService } from 'src/app/shared/services/library.service';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { BasicFormNavigation } from '../../../interfaces/basic-form-navigation.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';

@Component({
  selector: 'app-order-service-form',
  templateUrl: './order-service-form.component.html',
})
export class OrderServiceFormComponent implements OnInit {
  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public myForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    companyId: new FormControl(0),
    peopleId: new FormControl('', Validators.required),
    userId: new FormControl('', Validators.required),
    status: new FormControl(0, Validators.required),
    date_start: new FormControl(this.datePipe.transform(new Date(), 'yyyy-MM-dd')),
    date_finish: new FormControl(this.datePipe.transform(new Date(), 'yyyy-MM-dd')),
    equipment_received: new FormControl('', Validators.required),
    serial_number: new FormControl('', Validators.required),
    brand: new FormControl('', Validators.required),
    model: new FormControl('', Validators.required),
    note_equipment: new FormControl('', Validators.required),
    note_problem: new FormControl('', Validators.required),
    note_service: new FormControl('', Validators.required),
    note_private: new FormControl('', Validators.required),
  });

  public statusList = [
    {name: '⦿ Orçamento pendente', type: 0},
    {name: '⦿ Serviço pendente', type: 1},
    {name: '⦿ Em andamento', type: 2},
    {name: '⦿ Concluido', type: 3}
  ];

  @Output() searchPeople: SearchLoadingUnique = {
    noTitle: false,
    title: 'Cliente:',
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
        value: '{2}'
      }
    ]
  };

  @Output() searchUser: SearchLoadingUnique = {
    noTitle: false,
    title: 'Usuário Responsável:',
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
        value: '{0}'
      }
    ],
  };

  public validationFields: Array<any> = [
    {name: 'peopleId', validation: true, msg: 'Informe um cliente!'},
    {name: 'userId', validation: true, msg: 'Informe um Usuário!'},
  ];

  @Output() public pageHeader: PageHeader = {
    title: `Nova Ordem de Serviço`,
    description: 'Preencha os campos abaixo para criar uma nova ordem de serviço.',
    button: {
      text: 'Voltar',
      routerLink: '/os',
      icon: 'arrow_back',
    },
  };

  @Output() public navigation: BasicFormNavigation = {
    items: [
      { text: 'Informações Gerais', index: 0, icon: 'info' },
      { text: 'Equipamento', index: 1, icon: 'info' },
      { text: 'Observações', index: 2, icon: 'shopping_cart' },
    ],
    selectedItem: 0
  }

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

  constructor(
    private activatedRoute: ActivatedRoute,
    private osService: OsService,
    private notificationService: NotificationService,
    private router: Router,
    private libraryService: LibraryService,
    private datePipe: DatePipe
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
    this.pageHeader.title = this.formId === 'new' ? 'Nova Os' : 'Editar Os';
  }

  ngOnInit(): void {
    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.osService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['os']);
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
      this.searchPeople.searchFieldOn = value.people;
      this.searchPeople.searchField.setValue(value.people.name);
      this.searchUser.searchFieldOn = value.user;
      this.searchUser.searchField.setValue(value.user.name);
      this.myForm.patchValue(value);
      this.myForm.controls['date_start'].setValue(this.datePipe.transform(value.date_start, 'yyyy-MM-dd'));
      this.myForm.controls['date_finish'].setValue(this.datePipe.transform(value.date_finish, 'yyyy-MM-dd'));
    }
  }

  validateForm(): void {
    this.searchPeople.validation = !!this.myForm.value.peopleId;
    this.validationFields.find(v => v.name === 'peopleId').validation = !!this.myForm.value.peopleId;
    this.searchUser.validation = !!this.myForm.value.userId;
    this.validationFields.find((v) => v.name === 'userId').validation =
      !!this.myForm.value.userId;
  }

  save(): void {
    this.loadingFull.active = true;

    this.myForm.value.peopleId = this.searchPeople?.searchFieldOn?.id;
    this.myForm.value.userId = this.searchUser?.searchFieldOn?.id;
    this.myForm.value.status = parseInt(this.myForm.value.status, 0);

    this.validateForm();

    if (!(this.validationFields.filter(v => v.validation === false).length > 0)) {
      this.osService.save(this.formId, this.myForm.value).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn(error.error);
          return throwError(error);
        }),
        map((res) => {
          this.notificationService.success('Salvo com sucesso.');
          this.formId = res.id;
        })
      ).subscribe();
    } else {
      this.loadingFull.active = false;
      this.notificationService.error(this.validationFields.filter(v => v.validation === false)[0].msg);
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
