import { Component, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { TransportRouteService } from 'src/app/shared/services/transport-route.service';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';

@Component({
  selector: 'app-transport-route-form',
  templateUrl: './transport-route-form.component.html',
})
export class TransportRouteFormComponent implements OnInit {
  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    company_id: new FormControl(0),
    uf_origin: new FormControl('', Validators.required),
    uf_destination: new FormControl('', Validators.required),
    routes: new FormControl('', Validators.required),
    routeList: new FormArray([]),
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

  // Defina a ordem geográfica dos estados
  public ordemGeografica: string[] = [
    'AC', 'AM', 'RR', 'PA', 'AP', 'TO', 'RO', 'MT', 'GO', 'DF', 'MA', 'PI', 'CE', 'RN', 'PB', 'PE', 'AL', 'SE', 'BA', 'RJ', 'ES', 'MG', 'SP', 'PR', 'SC', 'RS', 'MS'
  ];

  // Crie um grafo representando as conexões entre estados
  public conexoes: { [key: string]: string[] } = {
    AC: ['AM'],
    AM: ['AC', 'RR', 'PA', 'MT'],
    RR: ['AM', 'PA'],
    PA: ['AM', 'RR', 'AP', 'TO', 'MA'],
    AP: ['PA'],
    TO: ['PA', 'MT', 'GO', 'MA'],
    RO: ['AM', 'MT'],
    MT: ['AM', 'RO', 'PA', 'TO', 'GO', 'MS'],
    GO: ['MT', 'TO', 'DF', 'MS', 'MG', 'BA'],
    DF: ['GO'],
    MA: ['PA', 'TO', 'PI'],
    PI: ['MA', 'CE', 'BA'],
    CE: ['PI', 'RN', 'PB', 'PE'],
    RN: ['CE', 'PB'],
    PB: ['CE', 'RN', 'PE'],
    PE: ['CE', 'PB', 'AL'],
    AL: ['PE', 'SE', 'BA'],
    SE: ['AL', 'BA'],
    BA: ['SE', 'AL', 'PE', 'PI', 'TO', 'GO', 'MG', 'ES'],
    RJ: ['ES', 'MG', 'SP'],
    ES: ['MG', 'RJ', 'BA'],
    MG: ['ES', 'RJ', 'SP', 'GO', 'BA'],
    SP: ['MG', 'RJ', 'MS', 'PR'],
    PR: ['SC', 'RS', 'SP'],
    SC: ['PR', 'RS'],
    RS: ['SC', 'PR'],
    MS: ['MT', 'GO'],
  };

  public routes = this.myForm.get('routeList') as FormArray;

  @Output() public pageHeader: PageHeader = {
    title: `Rota de Transporte`,
    description: 'Cadastro de Rota',
    button: {
      text: 'Voltar',
      routerLink: '/transport-route',
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
    private transportRouteService: TransportRouteService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.transportRouteService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['transport-route']);
          return throwError(error);
        }),
        map((res) => {
          this.setForm(res);
        })
      ).subscribe();
    } else {
      this.addRoute(null);
    }
  }

  //Busca Estado pela uf
  getState(uf: string): string {
    const state = this.stateList.find((state) => state.type === uf);
    return state ? state.name : '';
  }

  setForm(value: any): void {
    if (value) {
      //Pegar a lista de rotas e transformar em array
      const routeList = value.routes.split(',');
      routeList.map((route: any) => {
        this.addRoute({ name: this.getState(route), uf: route });
      });

      this.myForm.patchValue(value);
    }
  }

  save(): void {
    this.loadingFull.active = true;

    const routeList = this.getRoutes();

    //validar uf de origin
    if (!this.myForm.value.uf_origin) {
      this.notificationService.warn('UF de origem inválida!');
      this.loadingFull.active = false;
      return;
    }

    //validar uf de destination
    if (!this.myForm.value.uf_destination) {
      this.notificationService.warn('UF de destino inválida!');
      this.loadingFull.active = false;
      return;
    }

    //Validar pelo menos uma rota e se tem uf selecionada
    if (routeList.length === 0) {
      this.notificationService.warn('Informe pelo menos uma rota!');
      this.loadingFull.active = false;
      return;
    }

    //Validar trajetória
    const validacaoTrajetoria = this.validarTrajetoria(routeList, this.myForm.value.uf_origin, this.myForm.value.uf_destination);
    switch (validacaoTrajetoria) {
      case 1:
        this.notificationService.warn('A trajetória deve conter pelo menos dois estados (início e destino).');
        this.loadingFull.active = false;
        return;
      case 2:
        this.notificationService.warn('A trajetória deve começar no estado de início.');
        this.loadingFull.active = false;
        return;
      case 3:
        this.notificationService.warn('Verifica se cada estado subsequente está conectado ao estado anterior.');
        this.loadingFull.active = false;
        return;
      case 4:
        this.notificationService.warn('A trajetória deve terminar no estado de destino.');
        this.loadingFull.active = false;
        return;
      default:
        break;
    }

    //Pegar a lista de rotas e transformar em string separado por virgula
    const routes = routeList.join(',');
    this.myForm.value.routes = routes;

    this.transportRouteService.save(this.formId, this.myForm.value).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        this.notificationService.warn(error.error);
        return throwError(error);
      }),
      map(() => {
        this.notificationService.success('Salvo com sucesso.');
        this.router.navigate(['transport-route']);
      })
    ).subscribe();
  }

  addRoute(value: any): void {
    const control = new FormGroup({
      name: new FormControl(value?.name || ''),
      uf: new FormControl(value?.uf || ''),
    });

    this.routes.push(control);
  }

  removeRoute(index: any): void {
    this.routes.controls.splice(index, 1);
  }

  // Função para validar a trajetória de estados
  validarTrajetoria(trajetoria: string[], estadoInicio: string, estadoDestino: string): number {
    if (trajetoria.length < 2) {
        return 1; // A trajetória deve conter pelo menos dois estados (início e destino).
    }

    if (trajetoria[0] !== estadoInicio) {
        return 2; // A trajetória deve começar no estado de início.
    }

    for (let i = 1; i < trajetoria.length; i++) {
        const estadoAnterior = trajetoria[i - 1];
        const estadoAtual = trajetoria[i];

        if (!this.conexoes[estadoAnterior] || !this.conexoes[estadoAnterior].includes(estadoAtual)) {
            return 3; // Verifica se cada estado subsequente está conectado ao estado anterior.
        }
    }

    if (trajetoria[trajetoria.length - 1] !== estadoDestino) {
        return 4; // A trajetória deve terminar no estado de destino.
    }

    return 0;
  }

  //Lop nos routes e traz separado as UF em array
  getRoutes(): any {
    const routesArray: any = []

    this.routes.value.map((route: any) => {
      if (route.uf) {
        routesArray.push(route.uf);
      }
    });

    return routesArray;
  }
}
