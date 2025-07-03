import { Component, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleService } from 'src/app/shared/services/vehicle.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { catchError, finalize, map, throwError } from 'rxjs';

@Component({
  selector: 'app-vehicle-form',
  templateUrl: './vehicle-form.component.html',
})
export class VehicleFormComponent implements OnInit {

  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    company_id: new FormControl(0),
    role: new FormControl(1, Validators.required),
    brand: new FormControl('', Validators.required),
    model: new FormControl('', Validators.required),
    year: new FormControl('', Validators.required),
    license_plate: new FormControl('', Validators.required),
    color: new FormControl('', Validators.required),
    vin_number: new FormControl('', Validators.required),
    engine_number: new FormControl(''),
    mileage: new FormControl(''),
  });

  @Output() public pageHeader: PageHeader = {
    title: `Veículo`,
    description: 'Cadastro de veículo',
    button: {
      text: 'Voltar',
      routerLink: '/vehicle',
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
      },
    ]
  }

  public roleList = [
    { name: '⦿ Moto', type: 0 },
    { name: '⦿ Carro', type: 1 },
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private vehicleService: VehicleService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.vehicleService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['vehicle']);
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
    this.vehicleService.save(this.formId, this.myForm.value).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        this.notificationService.warn(error.error);
        return throwError(error);
      }),
      map(() => {
        this.notificationService.success('Salvo com sucesso.');
        this.router.navigate(['vehicle']);
      })
    ).subscribe();
  }

}
