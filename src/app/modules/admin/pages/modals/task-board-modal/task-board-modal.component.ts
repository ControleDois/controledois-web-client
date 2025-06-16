import { Component, Inject, OnInit, Output } from '@angular/core';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TaskBoard } from '../../../interfaces/task.board.interface';
import { Auth } from 'src/app/shared/interfaces/auth.interface';
import { StorageService } from 'src/app/shared/services/storage.service';
import { TaskBoardService } from 'src/app/shared/services/task-boards.service';
import { catchError, finalize, map, throwError } from 'rxjs';
import { NotificationService } from 'src/app/shared/services/notification.service';

@Component({
  selector: 'app-task-board-modal',
  templateUrl: './task-board-modal.component.html',
  styleUrls: ['./task-board-modal.component.scss']
})
export class TaskBoardModalComponent implements OnInit {
  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    id: new FormControl(''),
    title: new FormControl(''),
    description: new FormControl(''),
  });

  @Output() public pageHeader: PageHeader = {
    title: `Quadro de Tarefas`,
    description: 'Gerenciamento de quadro de tarefas',
    button: {
      text: 'Voltar',
      icon: 'arrow_back',
      action: () => this.closeModal()
    },
  };

  @Output() public navigationButtons: BasicFormButtons = {
    buttons: [
      {
        text: 'Salvar',
        icon: 'save',
        action: () => this.save(),
        class: 'c2-btn c2-btn-green',
      },
    ]
  }

  public validationFields: Array<any> = [
    { name: 'title', validation: true, msg: 'Necessário informar um titulo' },
    { name: 'description', validation: true, msg: 'Necessário informar uma descrição' },
  ];

  private auth: Auth;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TaskBoard,
    private dialogRef: MatDialogRef<TaskBoardModalComponent>,
    private storageService: StorageService,
    private taskBoardService: TaskBoardService,
    private notificationService: NotificationService,
  ) {
    this.pageHeader.title = this.data?.id === 'new' ? 'Novo Quadro' : 'Editar Quadro';
    this.auth = this.storageService.getAuth();
  }

  ngOnInit(): void {
    if (this.data.id !== 'new') {
      this.loadingFull.active = true;
      this.taskBoardService.show(this.data?.id || '').pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.dialogRef.close();
          return throwError(error);
        }),
        map((res) => {
          this.setForm(res);
        })
      ).subscribe();
    }
    this.myForm.patchValue(this.data);
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

  public save(): void {
    this.loadingFull.active = true;


    this.validateForm();

    if (
      !(this.validationFields.filter((v) => v.validation === false).length > 0)
    ) {
      this.taskBoardService.save(this.data.id || '', this.myForm.value).pipe(
        catchError((error) => {
          this.notificationService.warn(error.error?.message);
          return throwError(error);
        }),
        map(async (res) => {
          this.loadingFull.active = false;
          this.notificationService.success('Quadro salvo com sucesso!');
          this.dialogRef.close(res);
        })
      ).subscribe();
    } else {
      this.loadingFull.active = false;
      this.notificationService.error(
        this.validationFields.filter((v) => v.validation === false)[0].msg
      );
    }
  }

  closeModal() {
    this.dialogRef.close();
  }
}
