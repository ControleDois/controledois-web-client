import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map, throwError } from 'rxjs';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { TaskService } from 'src/app/shared/services/task.service';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html'
})
export class TaskFormComponent implements OnInit {
  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl(''),
    status: new FormControl(0),
    priority: new FormControl(0),
  });

  public statusType = [
    { name: '⦿ A Fazer', type: 0 },
    { name: '⦿ Em progresso', type: 1 },
    { name: '⦿ Em Avaliação', type: 2 },
    { name: '⦿ Finalizado', type: 3 },
    { name: '⦿ Cancelado', type: 4 },
  ];

  public priorityType = [
    { name: '⦿ Baixa', type: 0 },
    { name: '⦿ Media', type: 1 },
    { name: '⦿ Alta', type: 2 },
  ];

  public validationFields: Array<any> = [
    { name: 'title', validation: true, msg: 'Necessário informar um titulo' },
    { name: 'description', validation: true, msg: 'Necessário informar uma descrição' },
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private taskService: TaskService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.taskService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['task']);
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

  validateForm(): void {
    this.validationFields.find((v) => v.name === 'title').validation =
      !!this.myForm.value.title;

      this.validationFields.find((v) => v.name === 'description').validation =
      !!this.myForm.value.description;
  }

  save(): void {
    this.loadingFull.active = true;

    this.validateForm();

    if (
      !(this.validationFields.filter((v) => v.validation === false).length > 0)
    ) {
      this.taskService.save(this.formId, this.myForm.value).pipe(
        catchError((error) => {
          this.notificationService.warn(error.error?.message);
          return throwError(error);
        }),
        map(async (res) => {
          this.notificationService.success('Salvo com sucesso.');
          this.router.navigate(['task']);
        })
      ).subscribe();
    } else {
      this.loadingFull.active = false;
      this.notificationService.error(
        this.validationFields.filter((v) => v.validation === false)[0].msg
      );
    }
  }
}
