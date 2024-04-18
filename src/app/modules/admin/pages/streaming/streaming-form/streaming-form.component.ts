import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map, throwError } from 'rxjs';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { StreamingService } from 'src/app/shared/services/streaming.service';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';

@Component({
  selector: 'app-streaming-form',
  templateUrl: './streaming-form.component.html'
})
export class StreamingFormComponent implements OnInit {
  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public myForm: FormGroup = new FormGroup({
    filter_tag: new FormControl(0, Validators.required),
    title: new FormControl('', Validators.required),
    message: new FormControl('', Validators.required),
    schedule_date: new FormControl(''),
    tags: new FormArray([]),
  });

  constructor(
    private activatedRoute: ActivatedRoute,
    private streamingService: StreamingService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.streamingService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['streaming']);
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
    this.streamingService.save(this.formId, this.myForm.value).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        this.notificationService.warn(error.error);
        return throwError(error);
      }),
      map(() => {
        this.notificationService.success('Salvo com sucesso.');
        this.router.navigate(['streaming']);
      })
    ).subscribe();
  }
}
