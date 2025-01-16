import { Component, ElementRef, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { NFeTaxationRuleService } from 'src/app/shared/services/nfe-taxation-rule.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { catchError, finalize, map, Observable, startWith, throwError } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';
import { BasicFormNavigation } from '../../../interfaces/basic-form-navigation.interface';

@Component({
  selector: 'app-nfe-taxation-rule-form',
  templateUrl: './nfe-taxation-rule-form.component.html',
})
export class NfeTaxationRuleFormComponent implements OnInit {
  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    nfe_taxation_id: new FormControl(0),
    states: new FormControl([], Validators.required),
    nfeTaxationRulesResale: new FormGroup({
      icms_situacao_tributaria: new FormControl('00'),

      icms_adiciona_frete: new FormControl(false),
      icms_adiciona_seguro: new FormControl(false),
      icms_adiciona_ipi: new FormControl(false),
      icms_adiciona_outras_despesas: new FormControl(false),

      icms_modalidade_base_calculo: new FormControl(0),
      icms_reducao_base_calculo: new FormControl(0),
      icms_aliquota: new FormControl(0),
      icms_percentual_diferimento: new FormControl(0),

      icms_modalidade_base_calculo_st: new FormControl(0),
      icms_margem_valor_adicionado_st: new FormControl(0),
      icms_reducao_base_calculo_st: new FormControl(0),
      icms_aliquota_st: new FormControl(0),

      pis_adiciona_frete: new FormControl(false),
      pis_adiciona_seguro: new FormControl(false),
      pis_adiciona_ipi: new FormControl(false),
      pis_adiciona_outras_despesas: new FormControl(false),

      pis_situacao_tributaria: new FormControl(''),
      pis_aliquota_porcentual: new FormControl(0),

      cofins_adiciona_frete: new FormControl(false),
      cofins_adiciona_seguro: new FormControl(false),
      cofins_adiciona_ipi: new FormControl(false),
      cofins_adiciona_outras_despesas: new FormControl(false),

      cofins_situacao_tributaria: new FormControl(''),
      cofins_aliquota_porcentual: new FormControl(0),

      ipi_adiciona_frete: new FormControl(false),
      ipi_adiciona_seguro: new FormControl(false),
      ipi_adiciona_outras_despesas: new FormControl(false),

      ipi_situacao_tributaria: new FormControl(''),
      ipi_aliquota: new FormControl(0),

      informacoes_nfe: new FormControl(''),
      informacoes_ibpt: new FormControl(false),
    }),
    nfeTaxationRulesFinalConsumer: new FormGroup({
      icms_situacao_tributaria: new FormControl('00'),

      icms_adiciona_frete: new FormControl(false),
      icms_adiciona_seguro: new FormControl(false),
      icms_adiciona_ipi: new FormControl(false),
      icms_adiciona_outras_despesas: new FormControl(false),

      icms_modalidade_base_calculo: new FormControl(0),
      icms_reducao_base_calculo: new FormControl(0),
      icms_aliquota: new FormControl(0),
      icms_percentual_diferimento: new FormControl(0),

      icms_modalidade_base_calculo_st: new FormControl(0),
      icms_margem_valor_adicionado_st: new FormControl(0),
      icms_reducao_base_calculo_st: new FormControl(0),
      icms_aliquota_st: new FormControl(0),

      pis_adiciona_frete: new FormControl(false),
      pis_adiciona_seguro: new FormControl(false),
      pis_adiciona_ipi: new FormControl(false),
      pis_adiciona_outras_despesas: new FormControl(false),

      pis_situacao_tributaria: new FormControl(''),
      pis_aliquota_porcentual: new FormControl(0),

      cofins_adiciona_frete: new FormControl(false),
      cofins_adiciona_seguro: new FormControl(false),
      cofins_adiciona_ipi: new FormControl(false),
      cofins_adiciona_outras_despesas: new FormControl(false),

      cofins_situacao_tributaria: new FormControl(''),
      cofins_aliquota_porcentual: new FormControl(0),

      ipi_adiciona_frete: new FormControl(false),
      ipi_adiciona_seguro: new FormControl(false),
      ipi_adiciona_outras_despesas: new FormControl(false),

      ipi_situacao_tributaria: new FormControl(''),
      ipi_aliquota: new FormControl(0),

      informacoes_nfe: new FormControl(''),
      informacoes_ibpt: new FormControl(false),
    })
  });

  @Output() public pageHeader: PageHeader = {
    title: `Regra de Tributação`,
    description: 'Cadastro de Regra de Tributação',
    button: {
      text: 'Voltar',
      routerLink: '/nfe-taxation-rule',
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

  @Output() public navigation: BasicFormNavigation = {
    items: [
      { text: 'Dados Da Regra', index: 0, icon: 'info' },
      { text: 'Cliente Revenda', index: 1, icon: 'info' },
      { text: 'Cliente Consumidor Final', index: 2, icon: 'info' },
    ],
    selectedItem: 0
  }

  @Output() searchTaxation: SearchLoadingUnique = {
    noTitle: false,
    title: 'Tributação',
    url: 'nfe-taxation',
    searchFieldOn: null,
    searchFieldOnCollum: 'name',
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [],
  };

  separatorKeysCodes: number[] = [ENTER, COMMA];
  stateCtrl = new FormControl('');
  filteredStates: Observable<any[]>;
  states: any[] = [];
  allStates = [
    { name: 'Acre', uf: 'AC' },
    { name: 'Alagoas', uf: 'AL' },
    { name: 'Amapá', uf: 'AP' },
    { name: 'Amazonas', uf: 'AM' },
    { name: 'Bahia', uf: 'BA' },
    { name: 'Ceará', uf: 'CE' },
    { name: 'Distrito Federal', uf: 'DF' },
    { name: 'Espírito Santo', uf: 'ES' },
    { name: 'Goiás', uf: 'GO' },
    { name: 'Maranhão', uf: 'MA' },
    { name: 'Mato Grosso', uf: 'MT' },
    { name: 'Mato Grosso do Sul', uf: 'MS' },
    { name: 'Minas Gerais', uf: 'MG' },
    { name: 'Pará', uf: 'PA' },
    { name: 'Paraíba', uf: 'PB' },
    { name: 'Paraná', uf: 'PR' },
    { name: 'Pernambuco', uf: 'PE' },
    { name: 'Piauí', uf: 'PI' },
    { name: 'Rio de Janeiro', uf: 'RJ' },
    { name: 'Rio Grande do Norte', uf: 'RN' },
    { name: 'Rio Grande do Sul', uf: 'RS' },
    { name: 'Rondônia', uf: 'RO' },
    { name: 'Roraima', uf: 'RR' },
    { name: 'Santa Catarina', uf: 'SC' },
    { name: 'São Paulo', uf: 'SP' },
    { name: 'Sergipe', uf: 'SE' },
    { name: 'Tocantins', uf: 'TO' },
  ];

  public icmsModalidadeBaseCalculo = [
    { name: '⦿ 0 - Margem de valor agregado (%)', type: 0 },
    { name: '⦿ 1 - Pauta (valor)', type: 1 },
    { name: '⦿ 2 - Preço tabelado máximo (valor)', type: 2 },
    { name: '⦿ 3 - Valor da operação', type: 3 },
  ];

  public icmsModalidadeBaseCalculoSt = [
    { name: '⦿ 0 - Preço tabelado ou máximo sugerido', type: 0 },
    { name: '⦿ 1 - Lista negativa (valor)', type: 1 },
    { name: '⦿ 2 - Lista positiva (valor)', type: 2 },
    { name: '⦿ 3 - Lista neutra (valor)', type: 3 },
    { name: '⦿ 4 - Margem de valor agregado (%)', type: 4 },
    { name: '⦿ 5 - Pauta (valor)', type: 5 },
    { name: '⦿ 6 - Valor da operação (ICMS=70 e ICMS=90)', type: 6 },
  ]

  public pisSituacaoTributaria = [
    { name: '⦿ 01 - Operação tributável: base de cálculo = valor da operação<br>' +
            '(alíquota normal - cumulativo/não cumulativo)', type: '01' },
    { name: '⦿ 02 - Operação tributável: base de cálculo = valor da operação<br>' +
            '(alíquota diferenciada)', type: '02' },
    { name: '⦿ 03 - Operação tributável: base de cálculo = quantidade vendida ×<br>' +
            'alíquota por unidade de produto', type: '03' },
    { name: '⦿ 04 - Operação tributável: tributação monofásica (alíquota zero)', type: '04' },
    { name: '⦿ 05 - Operação tributável: substituição tributária', type: '05' },
    { name: '⦿ 06 - Operação tributável: alíquota zero', type: '06' },
    { name: '⦿ 07 - Operação isenta da contribuição', type: '07' },
    { name: '⦿ 08 - Operação sem incidência da contribuição', type: '08' },
    { name: '⦿ 09 - Operação com suspensão da contribuição', type: '09' },
    { name: '⦿ 49 - Outras operações de saída', type: '49' },
    { name: '⦿ 50 - Operação com direito a crédito: vinculada exclusivamente a<br>' +
            'receita tributada no mercado interno', type: '50' },
    { name: '⦿ 51 - Operação com direito a crédito: vinculada exclusivamente a<br>' +
            'receita não tributada no mercado interno', type: '51' },
    { name: '⦿ 52 - Operação com direito a crédito: vinculada exclusivamente a<br>' +
            'receita de exportação', type: '52' },
    { name: '⦿ 53 - Operação com direito a crédito: vinculada a receitas<br>' +
            'tributadas e não-tributadas no mercado interno', type: '53' },
    { name: '⦿ 54 - Operação com direito a crédito: vinculada a receitas<br>' +
            'tributadas no mercado interno e de exportação', type: '54' },
    { name: '⦿ 55 - Operação com direito a crédito: vinculada a receitas<br>' +
            'não-tributadas no mercado interno e de exportação', type: '55' },
    { name: '⦿ 56 - Operação com direito a crédito: vinculada a receitas<br>' +
            'tributadas e não-tributadas no mercado interno e de exportação', type: '56' },
    { name: '⦿ 60 - Crédito presumido: operação de aquisição vinculada<br>' +
            'exclusivamente a receita tributada no mercado interno', type: '60' },
    { name: '⦿ 61 - Crédito presumido: operação de aquisição vinculada<br>' +
            'exclusivamente a receita não-tributada no mercado interno', type: '61' },
    { name: '⦿ 62 - Crédito presumido: operação de aquisição vinculada<br>' +
            'exclusivamente a receita de exportação', type: '62' },
    { name: '⦿ 63 - Crédito presumido: operação de aquisição vinculada a<br>' +
            'receitas tributadas e não-tributadas no mercado interno', type: '63' },
    { name: '⦿ 64 - Crédito presumido: operação de aquisição vinculada a<br>' +
            'receitas tributadas no mercado interno e de exportação', type: '64' },
    { name: '⦿ 65 - Crédito presumido: operação de aquisição vinculada a<br>' +
            'receitas não-tributadas no mercado interno e de exportação', type: '65' },
    { name: '⦿ 66 - Crédito presumido: operação de aquisição vinculada a<br>' +
            'receitas tributadas e não-tributadas no mercado interno e de exportação', type: '66' },
    { name: '⦿ 67 - Crédito presumido: outras operações', type: '67' },
    { name: '⦿ 70 - Operação de aquisição sem direito a crédito', type: '70' },
    { name: '⦿ 71 - Operação de aquisição com isenção', type: '71' },
    { name: '⦿ 72 - Operação de aquisição com suspensão', type: '72' },
    { name: '⦿ 73 - Operação de aquisição a alíquota zero', type: '73' },
    { name: '⦿ 74 - Operação de aquisição sem incidência da contribuição', type: '74' },
    { name: '⦿ 75 - Operação de aquisição por substituição tributária', type: '75' },
    { name: '⦿ 98 - Outras operações de entrada', type: '98' },
    { name: '⦿ 99 - Outras operações', type: '99' }
  ];

  public cofinsSituacaoTributaria = [
    { name: '⦿ 01 - Operação tributável: base de cálculo = valor da operação<br>' +
            '(alíquota normal - cumulativo/não cumulativo)', type: '01' },
    { name: '⦿ 02 - Operação tributável: base de cálculo = valor da operação<br>' +
            '(alíquota diferenciada)', type: '02' },
    { name: '⦿ 03 - Operação tributável: base de cálculo = quantidade vendida ×<br>' +
            'alíquota por unidade de produto', type: '03' },
    { name: '⦿ 04 - Operação tributável: tributação monofásica (alíquota zero)', type: '04' },
    { name: '⦿ 05 - Operação tributável: substituição tributária', type: '05' },
    { name: '⦿ 06 - Operação tributável: alíquota zero', type: '06' },
    { name: '⦿ 07 - Operação isenta da contribuição', type: '07' },
    { name: '⦿ 08 - Operação sem incidência da contribuição', type: '08' },
    { name: '⦿ 09 - Operação com suspensão da contribuição', type: '09' },
    { name: '⦿ 49 - Outras operações de saída', type: '49' },
    { name: '⦿ 50 - Operação com direito a crédito: vinculada exclusivamente a<br>' +
            'receita tributada no mercado interno', type: '50' },
    { name: '⦿ 51 - Operação com direito a crédito: vinculada exclusivamente a<br>' +
            'receita não tributada no mercado interno', type: '51' },
    { name: '⦿ 52 - Operação com direito a crédito: vinculada exclusivamente a<br>' +
            'receita de exportação', type: '52' },
    { name: '⦿ 53 - Operação com direito a crédito: vinculada a receitas<br>' +
            'tributadas e não-tributadas no mercado interno', type: '53' },
    { name: '⦿ 54 - Operação com direito a crédito: vinculada a receitas<br>' +
            'tributadas no mercado interno e de exportação', type: '54' },
    { name: '⦿ 55 - Operação com direito a crédito: vinculada a receitas<br>' +
            'não-tributadas no mercado interno e de exportação', type: '55' },
    { name: '⦿ 56 - Operação com direito a crédito: vinculada a receitas<br>' +
            'tributadas e não-tributadas no mercado interno e de exportação', type: '56' },
    { name: '⦿ 60 - Crédito presumido: operação de aquisição vinculada<br>' +
            'exclusivamente a receita tributada no mercado interno', type: '60' },
    { name: '⦿ 61 - Crédito presumido: operação de aquisição vinculada<br>' +
            'exclusivamente a receita não-tributada no mercado interno', type: '61' },
    { name: '⦿ 62 - Crédito presumido: operação de aquisição vinculada<br>' +
            'exclusivamente a receita de exportação', type: '62' },
    { name: '⦿ 63 - Crédito presumido: operação de aquisição vinculada a<br>' +
            'receitas tributadas e não-tributadas no mercado interno', type: '63' },
    { name: '⦿ 64 - Crédito presumido: operação de aquisição vinculada a<br>' +
            'receitas tributadas no mercado interno e de exportação', type: '64' },
    { name: '⦿ 65 - Crédito presumido: operação de aquisição vinculada a<br>' +
            'receitas não-tributadas no mercado interno e de exportação', type: '65' },
    { name: '⦿ 66 - Crédito presumido: operação de aquisição vinculada a<br>' +
            'receitas tributadas e não-tributadas no mercado interno e de exportação', type: '66' },
    { name: '⦿ 67 - Crédito presumido: outras operações', type: '67' },
    { name: '⦿ 70 - Operação de aquisição sem direito a crédito', type: '70' },
    { name: '⦿ 71 - Operação de aquisição com isenção', type: '71' },
    { name: '⦿ 72 - Operação de aquisição com suspensão', type: '72' },
    { name: '⦿ 73 - Operação de aquisição a alíquota zero', type: '73' },
    { name: '⦿ 74 - Operação de aquisição sem incidência da contribuição', type: '74' },
    { name: '⦿ 75 - Operação de aquisição por substituição tributária', type: '75' },
    { name: '⦿ 98 - Outras operações de entrada', type: '98' },
    { name: '⦿ 99 - Outras operações', type: '99' }
  ];

  public icmsSituacaoTributaria = [
    { name: '⦿ 00 - Tributada integralmente', type: '00' },
    { name: '⦿ 02 - Tributação monofásica própria sobre combustíveis', type: '02' },
    { name: '⦿ 10 - Tributada e com cobrança do ICMS por substituição tributária', type: '10' },
    { name: '⦿ 10_partilha - Tributada e com cobrança do ICMS por substituição tributária.<br>' +
            'Operação interestadual para consumidor final com partilha do ICMS devido<br>' +
            'na operação entre a UF de origem e a do destinatário, ou a UF definida<br>' +
            'na legislação.', type: '10_partilha' },
    { name: '⦿ 15 - Tributação monofásica própria e com responsabilidade pela retenção<br>' +
            'sobre combustíveis', type: '15' },
    { name: '⦿ 20 - Tributada com redução de base de cálculo', type: '20' },
    { name: '⦿ 30 - Isenta ou não tributada e com cobrança do ICMS por substituição<br>' +
            'tributária', type: '30' },
    { name: '⦿ 40 - Isenta', type: '40' },
    { name: '⦿ 41 - Não tributada', type: '41' },
    { name: '⦿ 41_st - Não tributada com ICMS ST devido para a UF de destino, nas<br>' +
            'operações interestaduais de produtos que tiveram retenção antecipada<br>' +
            'de ICMS por ST na UF do remetente.', type: '41_st' },
    { name: '⦿ 50 - Suspensão', type: '50' },
    { name: '⦿ 51 - Diferimento (a exigência do preenchimento das informações<br>' +
            'do ICMS diferido fica a critério de cada UF)', type: '51' },
    { name: '⦿ 53 - Tributação monofásica sobre combustíveis com recolhimento<br>' +
            'diferido', type: '53' },
    { name: '⦿ 60 - Cobrado anteriormente por substituição tributária', type: '60' },
    { name: '⦿ 60_st - Cobrado anteriormente por substituição tributária com ICMS ST<br>' +
            'devido para a UF de destino, nas operações interestaduais de produtos<br>' +
            'que tiveram retenção antecipada de ICMS por ST na UF do remetente.', type: '60_st' },
    { name: '⦿ 61 - Tributação monofásica sobre combustíveis cobrada anteriormente', type: '61' },
    { name: '⦿ 70 - Tributada com redução de base de cálculo e com cobrança do ICMS<br>' +
            'por substituição tributária', type: '70' },
    { name: '⦿ 90 - Outras (regime Normal)', type: '90' },
    { name: '⦿ 90_partilha - Outras (regime Normal). Operação interestadual para consumidor<br>' +
            'final com partilha do ICMS devido na operação entre a UF de origem e<br>' +
            'a do destinatário.', type: '90_partilha' },
    { name: '⦿ 101 - Tributada pelo Simples Nacional com permissão de crédito', type: '101' },
    { name: '⦿ 102 - Tributada pelo Simples Nacional sem permissão de crédito', type: '102' },
    { name: '⦿ 103 - Isenção do ICMS no Simples Nacional para faixa de receita bruta', type: '103' },
    { name: '⦿ 201 - Tributada pelo Simples Nacional com permissão de crédito e com<br>' +
            'cobrança do ICMS por substituição tributária', type: '201' },
    { name: '⦿ 202 - Tributada pelo Simples Nacional sem permissão de crédito e com<br>' +
            'cobrança do ICMS por substituição tributária', type: '202' },
    { name: '⦿ 203 - Isenção do ICMS no Simples Nacional para faixa de receita bruta<br>' +
            'e com cobrança do ICMS por substituição tributária', type: '203' },
    { name: '⦿ 300 - Imune', type: '300' },
    { name: '⦿ 400 - Não tributada pelo Simples Nacional', type: '400' },
    { name: '⦿ 500 - ICMS cobrado anteriormente por substituição tributária<br>' +
            '(substituído) ou por antecipação', type: '500' },
    { name: '⦿ 900 - Outras (regime Simples Nacional)', type: '900' }
  ];

  public ipiSituacaoTributaria = [
    { name: '⦿ 00 - Entrada com recuperação de crédito', type: '00' },
    { name: '⦿ 01 - Entrada tributada com alíquota zero', type: '01' },
    { name: '⦿ 02 - Entrada isenta', type: '02' },
    { name: '⦿ 03 - Entrada não-tributada', type: '03' },
    { name: '⦿ 04 - Entrada imune', type: '04' },
    { name: '⦿ 05 - Entrada com suspensão', type: '05' },
    { name: '⦿ 49 - Outras entradas', type: '49' },
    { name: '⦿ 50 - Saída tributada', type: '50' },
    { name: '⦿ 51 - Saída tributada com alíquota zero', type: '51' },
    { name: '⦿ 52 - Saída isenta', type: '52' },
    { name: '⦿ 53 - Saída não-tributada', type: '53' },
    { name: '⦿ 54 - Saída imune', type: '54' },
    { name: '⦿ 55 - Saída com suspensão', type: '55' },
    { name: '⦿ 99 - Outras saídas', type: '99' }
  ];

  @ViewChild('stateInput') stateInput!: ElementRef<HTMLInputElement>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private nfeTaxationRuleService: NFeTaxationRuleService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
    this.pageHeader.title = this.formId === 'new' ? 'Nova Regra de Tributação' : 'Editar Regra de Tributação';

    this.filteredStates = this.stateCtrl.valueChanges.pipe(
      startWith(null),
      map((state: string | null) => (state ? this._filter(state) : this.allStates)),
    );
  }

  removeState(state: string): void {
    const index = this.states.indexOf(state);

    if (index >= 0) {
      this.states.splice(index, 1);
    }
  }

  selectedState(event: MatAutocompleteSelectedEvent): void {
    if (this.states.filter((tag: any) => tag.uf === event.option.value.uf.trim()).length > 0) {
      this.notificationService.warn('Estado já selecionado!');
      this.stateInput.nativeElement.value = '';
      this.stateCtrl.setValue('');
    } else {
      this.states.push(event.option.value);
      this.stateInput.nativeElement.value = '';
      this.stateCtrl.setValue('');
    }
  }

  private _filter(value: any): any[] {
    if (value?.name) {
      return this.allStates
    }

    const filterValue = value.toLowerCase();

    return this.allStates.filter(state => state.name.toLowerCase().includes(filterValue));
  }

  ngOnInit(): void {
    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.nfeTaxationRuleService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['nfe-taxation-rule']);
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
      this.searchTaxation.searchFieldOn = value.nfeTaxationRule || null;
      this.searchTaxation.searchField.setValue(value.nfeTaxationRule?.name || '');

      this.states = value.states.map((state) => {
        return this.allStates.find((fState) => fState.uf === state)
      })

      this.myForm.patchValue(value);
    }
  }

  save(): void {
    this.loadingFull.active = true;

    this.myForm.value.nfe_taxation_id = this.searchTaxation?.searchFieldOn?.id;
    this.myForm.value.states = this.states.map((state) => state.uf);

    this.nfeTaxationRuleService.save(this.formId, this.myForm.value).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        this.notificationService.warn(error.error.errors[0].message);
        return throwError(error);
      }),
      map(() => {
        this.notificationService.success('Salvo com sucesso.');
        this.router.navigate(['nfe-taxation-rule']);
      })
    ).subscribe();
  }

}
