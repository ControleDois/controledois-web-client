import { Component, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map, throwError } from 'rxjs';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { TransportVehicleService } from 'src/app/shared/services/transport-vehicle.service';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';

@Component({
  selector: 'app-transport-vehicle-form',
  templateUrl: './transport-vehicle-form.component.html',
})
export class TransportVehicleFormComponent implements OnInit {
  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    company_id: new FormControl(''),
    transporter_id: new FormControl(''),
    vehicle_type: new FormControl('', Validators.required),
    transport_type: new FormControl('', Validators.required),
    plate: new FormControl('', Validators.required),
    name: new FormControl(''),
    renavam: new FormControl('', Validators.required),
    tara: new FormControl('', Validators.required),
    capacity_in_kg: new FormControl(''),
    capacity_in_m3: new FormControl(''),
    licensing_uf: new FormControl('', Validators.required),
    wheeled_type: new FormControl('', Validators.required),
    body_type: new FormControl('', Validators.required),
  });

  public stateList = [
    { name: 'Acre', type: 'AC' },
    { name: 'Alagoas', type: 'AL' },
    { name: 'Amapá', type: 'AP' },
    { name: 'Amazonas', type: 'AM' },
    { name: 'Bahia', type: 'BA' },
    { name: 'Ceará', type: 'CE' },
    { name: 'Distrito Federal', type: 'DF' },
    { name: 'Espírito Santo', type: 'ES' },
    { name: 'Goiás', type: 'GO' },
    { name: 'Maranhão', type: 'MA' },
    { name: 'Mato Grosso', type: 'MT' },
    { name: 'Mato Grosso do Sul', type: 'MS' },
    { name: 'Minas Gerais', type: 'MG' },
    { name: 'Pará', type: 'PA' },
    { name: 'Paraíba', type: 'PB' },
    { name: 'Paraná', type: 'PR' },
    { name: 'Pernambuco', type: 'PE' },
    { name: 'Piauí', type: 'PI' },
    { name: 'Rio de Janeiro', type: 'RJ' },
    { name: 'Rio Grande do Norte', type: 'RN' },
    { name: 'Rio Grande do Sul', type: 'RS' },
    { name: 'Rondônia', type: 'RO' },
    { name: 'Roraima', type: 'RR' },
    { name: 'Santa Catarina', type: 'SC' },
    { name: 'São Paulo', type: 'SP' },
    { name: 'Sergipe', type: 'SE' },
    { name: 'Tocantins', type: 'TO' }
  ];

  typeTransportList = [
    { name: 'Transporte Próprio', type: 0 },
    { name: 'Transporte Terceirizado', type: 1 },
  ];

  typeVehicleList = [
    { name: 'Tração/Cavalo', type: 0 },
    { name: 'Reboque/Carreta', type: 1 },
  ];

  typeWheeledList = [
    { name: 'Truck', type: '01' },
    { name: 'Toco', type: '02' },
    { name: 'Cavalo Mecânico', type: '03' },
    { name: 'Van', type: '04' },
    { name: 'Utilitário', type: '05' },
    { name: 'Outros', type: '06' },
  ];

  typeBodyList = [
    { name: 'Não Aplicável', type: '00' },
    { name: 'Aberto', type: '01' },
    { name: 'Fechado/Baú', type: '02' },
    { name: 'Graneleiro', type: '03' },
    { name: 'Porta Container', type: '04' },
    { name: 'Sider', type: '05' },
  ];

  @Output() searchTransporter: SearchLoadingUnique = {
    noTitle: false,
    title: 'Transportadora',
    url: 'people',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [
      {
        param: 'isTransporter',
        value: true,
      },
    ],
  };

  @Output() public pageHeader: PageHeader = {
    title: `Veículo de Transporte`,
    description: 'Cadastro de Veículo',
    button: {
      text: 'Voltar',
      routerLink: '/transport-vehicle',
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
    private transportVehicleService: TransportVehicleService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.transportVehicleService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['transport-vehicle']);
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

      if (value.transporter_id) {
        this.searchTransporter.searchFieldOn = value.transporter;
        this.searchTransporter.searchField.setValue(value.transporter.name);
      }

      this.myForm.patchValue(value);
    }
  }

  save(): void {
    this.loadingFull.active = true;

    this.myForm.value.transporter_id = this.searchTransporter?.searchFieldOn?.id;

    this.transportVehicleService.save(this.formId, this.myForm.value).pipe(
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
