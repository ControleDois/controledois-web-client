import { DatePipe } from '@angular/common';
import { Component, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map, throwError } from 'rxjs';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { PostService } from 'src/app/shared/services/post.service';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';

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
      map(() => {
        this.notificationService.success('Salvo com sucesso.');
        this.router.navigate(['post']);
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
}
