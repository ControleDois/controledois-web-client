import { DatePipe } from '@angular/common';
import { Component, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map, throwError } from 'rxjs';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { PostService } from 'src/app/shared/services/post.service';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';
import { BasicFormNavigation } from '../../../interfaces/basic-form-navigation.interface';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
})
export class PostFormComponent implements OnInit {

  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public myForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    company_id: new FormControl(0),
    whatsappId: new FormControl(0),
    title: new FormControl('', Validators.required),
    post: new FormControl(''),
    filter_type: new FormControl('', Validators.required),
    schedule_date: new FormControl(''),
    publish_date: new FormControl(''),
    status: new FormControl(0),
    messages: new FormArray([])
  });

  public messages = this.myForm.get('messages') as FormArray;
  @Output() public contactsOutPut: Array<SearchLoadingUnique> = [];

  @Output() searchWhatsapp: SearchLoadingUnique = {
    noTitle: false,
    title: 'Whatsapp',
    url: 'whatsapp',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [],
  };

  @Output() public pageHeader: PageHeader = {
    title: `Transmissão de Mensagem`,
    description: 'Cadastre uma nova transmissão de mensagem',
    button: {
      text: 'Voltar',
      routerLink: '/post',
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

  @Output() public navigation: BasicFormNavigation = {
    items: [
      { text: 'Dados da Transmissão', index: 0, icon: 'info' },
      { text: 'Contatos', index: 1, icon: 'info' },
    ],
    selectedItem: 0
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private postService: PostService,
    private notificationService: NotificationService,
    private router: Router,
    private datePipe: DatePipe,
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.postService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['post']);
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
      //this.myForm.controls['birth'].setValue(this.datePipe.transform(value.birth, 'yyyy-MM-dd'));

      this.searchWhatsapp.searchFieldOn = value.whatsapp;
      this.searchWhatsapp.searchField.setValue(value.whatsapp.name);

      if (value.messages && value.messages.length > 0) {
        for (const contact of value.messages) {
          this.addContact({ contact });
        }
      }
    }
  }

  save(): void {
    this.loadingFull.active = true;

    this.myForm.value.whatsappId = this.searchWhatsapp?.searchFieldOn?.id;

    this.postService.save(this.formId, this.myForm.value).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        this.notificationService.warn(error.error.errors[0].message);
        return throwError(error);
      }),
      map((res) => {
        this.notificationService.success('Salvo com sucesso.');
        this.formId = res.id;
      })
    ).subscribe();
  }

  selectContact(event: any, i: any): void {
    //se o contato ja existir nao adicionar
    if (this.messages.value.find((v: any) => v.contact_id === event.id)) {
      this.removeContact(i);
      return;
    }

    this.messages.at(i).setValue({
      contactId: event.id,
      email: event.email,
      phone: event.phone
    });
  }

  addContact(value: any): void {
    const control = new FormGroup({
      contactId: new FormControl(value?.contact?.contact?.id || null),
      email: new FormControl(value?.contact?.contact?.email || ''),
      phone: new FormControl(value?.contact?.contact?.phone || ''),
    });

    this.messages.push(control);

    this.contactsOutPut.push({
      noTitle: true,
      title: 'Contatos',
      url: 'contact',
      searchFieldOn: value?.contact?.contact || null,
      searchFieldOnCollum: ['name'],
      sortedBy: 'name',
      orderBy: 'name',
      searchField: new FormControl(''),
      validation: true,
      paramsArray: [],
    });
  }

  removeContact(index: any): void {
    this.messages.removeAt(index);
    this.contactsOutPut.splice(index, 1);
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
