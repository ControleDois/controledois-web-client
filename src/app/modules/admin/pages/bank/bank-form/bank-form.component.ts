import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {catchError, finalize, map} from "rxjs/operators";
import {throwError} from "rxjs";
import { BankService } from 'src/app/shared/services/bank.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { DatePipe } from '@angular/common';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';

@Component({
  selector: 'app-bank-form',
  templateUrl: './bank-form.component.html',
})
export class BankFormComponent implements OnInit {
  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public myForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    company_id: new FormControl(0),
    name: new FormControl('', Validators.required),
    balance: new FormControl(0, Validators.required),
    date_balance: new FormControl(
      this.datePipe.transform(new Date(), 'yyyy-MM-dd')
    )
  });

  constructor(
    private activatedRoute: ActivatedRoute,
    private bankService: BankService,
    private notificationService: NotificationService,
    private router: Router,
    private datePipe: DatePipe,
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.bankService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['bank']);
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

      this.myForm.controls['date_balance'].setValue(value.date_balance.substring(0, 10));
    }
  }

  save(): void {
    this.loadingFull.active = true;
    this.bankService.save(this.formId, this.myForm.value).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        this.notificationService.warn(error.error.errors[0].message);
        return throwError(error);
      }),
      map(() => {
        this.notificationService.success('Salvo com sucesso.');
        this.router.navigate(['bank']);
      })
    ).subscribe();
  }
}
