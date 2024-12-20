import { DatePipe } from '@angular/common';
import { Component, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map, throwError } from 'rxjs';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { TaskService } from 'src/app/shared/services/task.service';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';
import { FirebaseService } from 'src/app/shared/services/firebase.service';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
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
    files: new FormControl(''),
  });

  public filesUpload: Array<any> = [];

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

  @Output() public pageHeader: PageHeader = {
    title: `Tarefa`,
    description: 'Cadastro de Tarefa',
    button: {
      text: 'Voltar',
      routerLink: '/task',
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
      }
    ]
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private taskService: TaskService,
    private notificationService: NotificationService,
    private router: Router,
    private firebaseService: FirebaseService,
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
    this.pageHeader.title = this.formId === 'new' ? 'Nova Tarefa' : 'Editar Tarefa';
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
          let firebaseFiles: Array<string> = [];

          for (let index = 0; index < this.filesUpload.length; index++) {
            await this.firebaseService.uploadStorageTasks(`tasks/${res.id}`,this.filesUpload[index]).then(res => {
              firebaseFiles.push({
                size: this.filesUpload[index].size,
                ...res
              })
            })
          }

          const body = {
            id: res.id,
            files: firebaseFiles
          }

          this.taskService.upload(body).pipe(
            finalize(() => this.loadingFull.active = false),
            catchError((error) => {
              this.notificationService.warn(error.error?.message);
              return throwError(error);
            }),
            map(() => {
              this.notificationService.success('Salvo com sucesso.');
              this.router.navigate(['task']);
            })
          ).subscribe();
        })
      ).subscribe();
    } else {
      this.loadingFull.active = false;
      this.notificationService.error(
        this.validationFields.filter((v) => v.validation === false)[0].msg
      );
    }
  }

  getFile(event) {
    const file = event.target.files[0];

    if (file) {
      this.filesUpload.push(file);
    }
  }

  openFile(file) {
    this.loadingFull.active = true;
    this.firebaseService.getStorageURL(file).then((res) => {
      window.open(res, '_blank');
      this.loadingFull.active = false;
    }).catch(() => {
      this.loadingFull.active = false;
      this.notificationService.warn('Arquivo inexistente.');
    })
  }

  deleteFileForm(index) {
    this.myForm.value.files.splice(index, 1);
  }

  deleteFile(index) {
    this.filesUpload.splice(index, 1);
  }

  formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }
}
