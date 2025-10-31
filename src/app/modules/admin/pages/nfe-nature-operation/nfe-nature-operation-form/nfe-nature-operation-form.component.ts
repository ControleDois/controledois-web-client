import { Component, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { NFeNatureOperationService } from 'src/app/shared/services/nfe-nature-operation.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { catchError, finalize, map, throwError } from 'rxjs';

@Component({
  selector: 'app-nfe-nature-operation-form',
  templateUrl: './nfe-nature-operation-form.component.html',
})
export class NfeNatureOperationFormComponent implements OnInit {
  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    company_id: new FormControl(0),
    description: new FormControl('', Validators.required),
    finality: new FormControl(1),
    cfop_state: new FormControl('', Validators.required),
    cfop_interstate: new FormControl('', Validators.required),
  });

  public selectFinality = [
    { name: '⦿ Normal', type: 1 },
    { name: '⦿ Complementar', type: 2 },
    { name: '⦿ Ajuste', type: 3 },
    { name: '⦿ Devolução', type: 4 },
  ];

  @Output() public pageHeader: PageHeader = {
    title: `Natureza de Operação`,
    description: 'Cadastro de Natureza',
    button: {
      text: 'Voltar',
      routerLink: '/nfe-nature-operation',
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
    private nfeNatureOperationService: NFeNatureOperationService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
    this.pageHeader.title = this.formId === 'new' ? 'Nova Natureza' : 'Editar Natureza';
  }

  ngOnInit(): void {
    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.nfeNatureOperationService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['nfe-nature-operation']);
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
    }
  }

  save(): void {
    this.loadingFull.active = true;
    this.nfeNatureOperationService.save(this.formId, this.myForm.value).pipe(
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
