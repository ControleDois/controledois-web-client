import { Component, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { NFeTaxationService } from 'src/app/shared/services/nfe-taxation.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { catchError, finalize, map, throwError } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { NFeTaxationRuleService } from 'src/app/shared/services/nfe-taxation-rule.service';
import { WidgetService } from 'src/app/shared/services/widget.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NfeTaxationRuleFormComponent } from '../../modals/nfe-taxation-rule-form/nfe-taxation-rule-form.component';

@Component({
  selector: 'app-nfe-taxation-form',
  templateUrl: './nfe-taxation-form.component.html',
})
export class NfeTaxationFormComponent implements OnInit {
  public formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    company_id: new FormControl(0),
    name: new FormControl('', Validators.required),
  });

  @Output() public pageHeader: PageHeader = {
    title: `Tributação`,
    description: 'Cadastro de Tributação',
    button: {
      text: 'Voltar',
      routerLink: '/nfe-taxation',
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

  public displayedColumns: string[] = [
    'states',
    'resale',
    'final_consumer',
    'actions'
  ];

  public dataSource = new MatTableDataSource<any>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private nfeTaxationService: NFeTaxationService,
    private notificationService: NotificationService,
    private nfeTaxationRuleService: NFeTaxationRuleService,
    private widGetService: WidgetService,
    private router: Router,
    private dialog: MatDialog,
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
    this.pageHeader.title = this.formId === 'new' ? 'Nova Tributação' : 'Editar Tributação';
  }

  ngOnInit(): void {
    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.nfeTaxationService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['nfe-taxation']);
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

      this.loadRules(this.formId);
    }
  }

  loadRules(id: string): void {
    this.nfeTaxationRuleService.index(id).pipe(
      map(res => {
        this.dataSource.data = res;
      })
    ).subscribe();
  }

  save(): void {
    this.loadingFull.active = true;
    this.nfeTaxationService.save(this.formId, this.myForm.value).pipe(
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

  showRule(id: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = false;
    dialogConfig.width = '920px';
    dialogConfig.maxHeight = '550px';
    dialogConfig.data = {
      taxation_id: this.formId,
      taxation_rule_id: id || 'new'
    };
    this.dialog.open(NfeTaxationRuleFormComponent, dialogConfig);
  }

  deleteRule(id: string): void {
    this.widGetService.modalQuestion({
      deleted: true
    }).afterClosed().subscribe(res => {
      if (res === true) {
        this.loadingFull.active = true;
        this.nfeTaxationRuleService.destroy(id).pipe(
          finalize(() => this.loadingFull.active = false),
          catchError((error) => {
            return throwError(error);
          }),
          map(() => {
            this.loadRules(this.formId);
          })
        ).subscribe();
      }
    });
  }
}
