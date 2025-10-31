import { DatePipe } from '@angular/common';
import { Component, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';
import { SearchLoadingChips } from 'src/app/shared/widget/search-loading-chips/search-loading-chips.interface';
import { MdfeService } from 'src/app/shared/services/mdfe.service';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { SearchLoadingChipsObject } from 'src/app/shared/widget/search-loading-chips-object/search-loading-chips-object.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';
import { BasicFormNavigation } from '../../../interfaces/basic-form-navigation.interface';

@Component({
  selector: 'app-mdfe-form',
  templateUrl: './mdfe-form.component.html',
})
export class MdfeFormComponent implements OnInit {
  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    company_id: new FormControl(''),
    people_id: new FormControl(''),
    transport_route_id: new FormControl(''),
    transport_vehicle_id: new FormControl(''),
    issuer: new FormControl(''),
    uf_origin: new FormControl(''),
    uf_destination: new FormControl(''),
    post_load: new FormControl(''),
    loading_zip_code: new FormControl(''),
    unloading_zip_code: new FormControl(''),
    charge_type: new FormControl(''),
    description_product: new FormControl(''),
    code_unit_measure_gross_weight: new FormControl(''),
    total_amount: new FormControl(''),
    total_load_value: new FormControl(''),
    vehicle_combination_category: new FormControl(''),
    additional_tax_information: new FormControl(''),
    complementary_information: new FormControl(''),
    municipalitiesLoadings: new FormArray([]),
    documents: new FormArray([]),
    vehicles: new FormArray([]),
    drivers: new FormArray([]),
  });

  public documents = this.myForm.get('documents') as FormArray;
  @Output() public documentsOutPut: Array<SearchLoadingUnique>;

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

  chargeTypeList = [
    { name: 'Granel sólido', type: '01' },
    { name: 'Granel líquido', type: '02' },
    { name: 'Frigorificada', type: '03' },
    { name: 'Conteinerizada', type: '04' },
    { name: 'Carga Geral', type: '05' },
    { name: 'Neogranel', type: '06' },
    { name: 'Perigosa (granel sólido)', type: '07' },
    { name: 'Perigosa (granel líquido)', type: '08' },
    { name: 'Perigosa (carga frigorificada)', type: '09' },
    { name: 'Perigosa (conteinerizada)', type: '10' },
    { name: 'Perigosa (carga geral)', type: '11' },
  ]

  codeUnitMeasureGrossWeightList = [
    { name: 'KG', type: '01' },
    { name: 'TON', type: '02' },
  ]

  @Output() searchRoute: SearchLoadingUnique = {
    noTitle: false,
    title: 'Percurso',
    url: 'transport-route',
    searchFieldOn: null,
    searchFieldOnCollum: ['routes'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [],
  };

  @Output() searchPeople: SearchLoadingUnique = {
    noTitle: false,
    title: 'Contratante/Tomadores',
    url: 'people',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [],
  };

  @Output() searchCounties: SearchLoadingChipsObject = {
    noTitle: false,
    title: 'Municipios de Carregamento',
    url: 'br-conties',
    searchFieldOn: [],
    searchFieldOnCollum: 'nome',
    sortedBy: 'name',
    orderBy: 'name',
    paramsArray: [],
    searchField: new FormControl(''),
    validation: true,
    required: true,
  };

  @Output() searchVehicle: SearchLoadingUnique = {
    noTitle: false,
    title: 'Veículo de Tração (Cavalo)',
    url: 'transport-vehicle',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [
      {
        param: 'role',
        value: '0',
      }
    ],
  };

  @Output() searchVehicleCarts: SearchLoadingChips = {
    noTitle: false,
    title: 'Veículos de Tração (Carreta)',
    url: 'transport-vehicle',
    searchFieldOn: [],
    searchFieldOnCollum: 'name',
    sortedBy: 'name',
    orderBy: 'name',
    paramsArray: [
      {
        param: 'role',
        value: '1',
      }
    ],
    searchField: new FormControl(''),
    validation: true,
  };

  @Output() searchDrivers: SearchLoadingChipsObject = {
    noTitle: false,
    title: 'Condutores/Motoristas',
    url: 'people',
    searchFieldOn: [],
    searchFieldOnCollum: 'name',
    sortedBy: 'name',
    orderBy: 'name',
    paramsArray: [
      {
        param: 'isDriver',
        value: true,
      }
    ],
    searchField: new FormControl(''),
    validation: true,
    required: true,
  };

  public validationFields: Array<any> = [
    { name: 'uf_origin', validation: true, msg: 'Necessário informar estado de Origem!' },
    { name: 'uf_destination', validation: true, msg: 'Necessário informar estado de Destino!' },
    { name: 'municipalitiesLoadings', validation: true, msg: 'Necessário informar pelo menos 1 municipio de carregamento!' },
    { name: 'loading_zip_code', validation: true, msg: 'Necessário informar o cep de carregamento!' },
    { name: 'unloading_zip_code', validation: true, msg: 'Necessário informar o cep de descarregamento!' },
  ];

  @Output() public pageHeader: PageHeader = {
    title: `MDF-e`,
    description: 'Cadastro de MDF-e',
    button: {
      text: 'Voltar',
      routerLink: '/mdfe',
      icon: 'arrow_back',
    },
  };

  @Output() public navigationButtons: BasicFormButtons = {
    buttons: [
      {
        text: '',
        icon: 'arrow_back',
        action: () => this.setNavigation(false),
        class: 'c2-btn c2-btn-bg-no-color',
        navigation: true,
      },
      {
        text: '',
        icon: 'arrow_forward',
        action: () => this.setNavigation(true),
        class: 'c2-btn c2-btn-bg-no-color',
        navigation: true,
      },
      {
        text: 'Salvar',
        icon: 'save',
        action: () => this.save(),
        class: 'c2-btn c2-btn-green',
        navigation: false
      }
    ]
  }

  @Output() public navigation: BasicFormNavigation = {
    items: [
      { text: 'Dados da MDF-e', index: 0, icon: 'info' },
      { text: 'Documentos', index: 1, icon: 'info' },
      { text: 'Info. Carga', index: 2, icon: 'info' },
    ],
    selectedItem: 0
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private mdfeService: MdfeService,
    private datePipe: DatePipe,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
    this.documentsOutPut = [];
  }

  ngOnInit(): void {
    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.mdfeService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['mdfe']);
          return throwError(error);
        }),
        map((res) => {
          this.setForm(res);
        })
      ).subscribe();
    } else {
      this.addDocument(null);
    }
  }

  setForm(value: any): void {
    if (value) {
      if (value.municipalitiesLoadings && value.municipalitiesLoadings.length > 0) {
        value.municipalitiesLoadings.forEach((element: any) => {
          this.searchCounties.searchFieldOn.push({
            id: element.ibge_code,
            nome: element.name,
            uf_sigla: element.uf,
            uf_id: element.uf_ibge_code,
          });
        });
      }

      if (value.drivers && value.drivers.length > 0) {
        value.drivers.forEach((element: any) => {
          this.searchDrivers.searchFieldOn.push(element);
        });
      }

      if (value.documents && value.documents.length > 0) {
        value.documents.forEach((element: any) => {
          this.addDocument(element);
        });
      }

      this.searchVehicle.searchFieldOn = value?.transportVehicle;
      this.searchVehicle.searchField.setValue(value?.transportVehicle?.name);

      this.searchRoute.searchFieldOn = value?.transportRoute;
      this.searchRoute.searchField.setValue(value?.transportRoute?.routes);

      this.searchPeople.searchFieldOn = value?.people;
      this.searchPeople.searchField.setValue(value?.people?.name);

      this.myForm.patchValue(value);
    }
  }

  save(): void {
    this.loadingFull.active = true;

    this.myForm.value.transport_route_id = this.searchRoute?.searchFieldOn?.id;
    this.myForm.value.transport_vehicle_id = this.searchVehicle?.searchFieldOn?.id;
    this.myForm.value.people_id = this.searchPeople?.searchFieldOn?.id;

    this.myForm.value.municipalitiesLoadings = this.searchCounties?.searchFieldOn;
    this.myForm.value.vehicles = this.searchVehicleCarts?.searchFieldOn;
    this.myForm.value.drivers = this.searchDrivers?.searchFieldOn;

    this.validateForm();

    if (
      !(this.validationFields.filter((v) => v.validation === false).length > 0)
    ) {
      this.mdfeService.save(this.formId, this.myForm.value).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          console.log(error);
          this.notificationService.warn(error.error.messages.errors[0].message);
          return throwError(error);
        }),
        map((res) => {
          this.notificationService.success('Salvo com sucesso.');
          this.formId = res.id;
        })
      ).subscribe();
    } else {
      this.loadingFull.active = false;
      this.notificationService.error(
        this.validationFields.filter((v) => v.validation === false)[0].msg
      );
    }
  }

  validateForm(): void {
    this.validationFields.find((v) => v.name === 'uf_origin').validation =
      !!this.myForm.value.uf_origin;

    this.validationFields.find((v) => v.name === 'uf_destination').validation =
      !!this.myForm.value.uf_destination;

    this.searchCounties.validation = this.myForm.value.municipalitiesLoadings.length <= 0;
    this.validationFields.find((v) => v.name === 'municipalitiesLoadings').validation = this.myForm.value.municipalitiesLoadings.length > 0;

    this.validationFields.find((v) => v.name === 'loading_zip_code').validation = !!this.myForm.value.loading_zip_code;
    this.validationFields.find((v) => v.name === 'unloading_zip_code').validation = !!this.myForm.value.unloading_zip_code;
  }

  updateFilterConties(): void {
    this.searchCounties.paramsArray = [{
        param: 'uf',
        value: this.myForm.get('uf_origin')?.value || '',
    }];
  }

  updateFulterContiesUnloading(): void {
    this.documentsOutPut.forEach((element: any) => {
      element.paramsArray = [{
        param: 'uf',
        value: this.myForm.get('uf_destination')?.value || '',
      }];
    });
  }

  addDocument(value: any): void {
    const control = new FormGroup({
      document_type: new FormControl(value?.document_type || null),
      document_key: new FormControl(value?.document_key || ''),
      municipality_unloading_ibge_code: new FormControl(value?.municipality_unloading_ibge_code || ''),
      municipality_unloading_name: new FormControl(value?.municipality_unloading_name || ''),
      municipality_unloading_uf: new FormControl(value?.municipality_unloading_uf || ''),
      municipality_unloading_uf_ibge_code: new FormControl(value?.municipality_unloading_uf_ibge_code || ''),
      products: new FormArray([]),
    });

    this.documents.push(control);

    let searchFieldOn: any = null;
    if (value?.municipality_unloading_ibge_code) {
      searchFieldOn = {
        id: value?.municipality_unloading_ibge_code || '',
        nome: value?.municipality_unloading_name || '',
        uf_sigla: value?.municipality_unloading_uf || '',
        uf_id: value?.municipality_unloading_uf_ibge_code || '',
      }
    }

    this.documentsOutPut.push({
      noTitle: true,
      title: 'Mun. de Descarregamento',
      url: 'br-conties',
      searchFieldOn,
      searchFieldOnCollum: ['nome'],
      sortedBy: 'name',
      orderBy: 'name',
      searchField: new FormControl(''),
      validation: true,
      paramsArray: [
        {
          param: 'uf',
          value: this.myForm.get('uf_destination')?.value || '',
        }
      ],
    });
  }

  removeDocument(index: any): void {
    this.documents.controls.splice(index, 1);
    this.documentsOutPut.splice(index, 1);
  }

  selectDocument(event: any, i: any): void {
    this.documents.at(i).setValue({
      document_type: 1,
      document_key: this.documents.at(i).value.document_key,
      municipality_unloading_ibge_code: event.id,
      municipality_unloading_name: event.nome,
      municipality_unloading_uf: event.uf_sigla,
      municipality_unloading_uf_ibge_code: event.uf_id,
      products: this.documents.at(i).value.products,
    });
  }

  addProduct(value: any, document: any): void {
    const products = this.documents.at(document).get('products') as FormArray;

    const control = new FormGroup({
      onu_number: new FormControl(value?.onu_number || ''),
      product_name: new FormControl(value?.product_name || ''),
      risk_class: new FormControl(value?.risk_class || ''),
      packing_class: new FormControl(value?.packing_class || ''),
      total_quantity_per_product: new FormControl(value?.total_quantity_per_product || ''),
      quantity_and_type_of_volumes: new FormControl(value?.quantity_and_type_of_volumes || ''),
    });

    products.push(control);
  }

  removeProduct(index: any, document: any): void {
    const products = this.documents.at(document).get('products') as FormArray;
    products.controls.splice(index, 1);
  }

  getProdutsDocument(index: any): FormArray {
    return this.documents.at(index).get('products') as FormArray;
  }

  setNavigation(nextOrBack: boolean): void {
    if (nextOrBack) {
      this.navigation.selectedItem++;
    } else {
      this.navigation.selectedItem--;
    }

    if (this.navigation.selectedItem < 0) {
      this.navigation.selectedItem = 0;
    } else if (this.navigation.selectedItem >= this.navigation.items.length) {
      this.navigation.selectedItem = this.navigation.items.length - 1;
    }
  }
}
