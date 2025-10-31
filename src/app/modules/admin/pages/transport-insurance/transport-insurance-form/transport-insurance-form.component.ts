import { DatePipe } from '@angular/common';
import { Component, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { TransportInsuranceService } from 'src/app/shared/services/transport-insurance.service';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';

@Component({
  selector: 'app-transport-insurance-form',
  templateUrl: './transport-insurance-form.component.html',
})
export class TransportInsuranceFormComponent implements OnInit {
  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    company_id: new FormControl(''),
    people_id: new FormControl('', Validators.required),
    number_apolice: new FormControl('', Validators.required),
    validity: new FormControl(
      this.datePipe.transform(new Date(), 'yyyy-MM-dd')
    ),
  });

  @Output() searchPeople: SearchLoadingUnique = {
    noTitle: false,
    title: 'Seguradora',
    url: 'people',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [
      {
        param: 'isInsurance',
        value: true,
      },
    ],
  };

  @Output() public pageHeader: PageHeader = {
    title: `Cadastro de Seguro`,
    description: 'Cadastro de seguro para transporte',
    button: {
      text: 'Voltar',
      routerLink: '/transport-insurance',
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

  constructor(
    private activatedRoute: ActivatedRoute,
    private transportInsuranceService: TransportInsuranceService,
    private datePipe: DatePipe,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.transportInsuranceService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['transport-insurance']);
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

      this.myForm.patchValue(value);

      this.myForm.controls['validity'].setValue(
        this.datePipe.transform(value.validity, 'yyyy-MM-dd')
      );
    }
  }

  save(): void {
    this.loadingFull.active = true;

    this.myForm.value.people_id = this.searchPeople?.searchFieldOn?.id;

    this.transportInsuranceService.save(this.formId, this.myForm.value).pipe(
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
}
