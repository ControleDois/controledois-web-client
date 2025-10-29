import { Component, Inject, OnInit, Output } from '@angular/core';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { PageHeader } from '../../../interfaces/page-header.interface';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';
import { SaleService } from 'src/app/shared/services/sale.service';
import { catchError, finalize, interval, map, switchMap, takeWhile, throwError } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { LibraryService } from 'src/app/shared/services/library.service';
import { BasicFormButtons } from '../../../interfaces/basic-form-buttons.interface';
import { IndexedDbService } from 'src/app/shared/services/indexed-db.service';
import { ServerLocalhostService } from 'src/app/shared/services/server-localhost.service';
import { Auth } from 'src/app/shared/interfaces/auth.interface';
import { StorageService } from 'src/app/shared/services/storage.service';
import { DialogMessageService } from 'src/app/shared/services/dialog-message.service';

@Component({
  selector: 'app-received-box-central',
  templateUrl: './received-box-central.component.html',
  styleUrls: ['./received-box-central.component.scss']
})
export class ReceivedBoxCentralComponent implements OnInit {
  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public myForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    companyId: new FormControl(0),
    peopleId: new FormControl('', Validators.required),
    userId: new FormControl('', Validators.required),
    categoryId: new FormControl(''),
    saleId: new FormControl(''),
    bankAccountId: new FormControl('', Validators.required),
    role: new FormControl(1),
    status: new FormControl(0, Validators.required),
    introduction: new FormControl('', Validators.required),
    date_sale: new FormControl(
      this.datePipe.transform(new Date(), 'yyyy-MM-dd')
    ),
    date_budget: new FormControl(
      this.datePipe.transform(new Date(), 'yyyy-MM-dd')
    ),
    date_budget_validity: new FormControl(
      this.datePipe.transform(new Date(), 'yyyy-MM-dd')
    ),
    delivery_forecast_budget: new FormControl(''),
    amount: new FormControl(0),
    discount_type: new FormControl(0, Validators.required),
    discount: new FormControl(0),
    shipping: new FormControl(0),
    net_total: new FormControl(0),
    note: new FormControl('', Validators.required),
    complementary_information: new FormControl('', Validators.required),
    form_payment: new FormControl(9),
    payment_terms: new FormControl(0),
    is_contract: new FormControl(false),
    contract_billing_day: new FormControl(5),
    contract_validity_type: new FormControl(0),
    contract_date_finish: new FormControl(
      this.datePipe.transform(new Date(), 'yyyy-MM-dd')
    ),
    contract_portion: new FormControl(''),
    products: new FormArray([]),
    plots: new FormArray([]),
    checklists: new FormArray([]),
  });

  public formPaymentList = [
    { name: '⦿ Boleto Bancário', type: 0 },
    { name: '⦿ Cartão de Crédito', type: 1 },
    { name: '⦿ Cartão de Débito', type: 2 },
    { name: '⦿ Carteira Digital', type: 3 },
    { name: '⦿ Cashback', type: 4 },
    { name: '⦿ Cheque', type: 5 },
    { name: '⦿ Credito da Loja', type: 6 },
    { name: '⦿ Crédito Virtual', type: 7 },
    { name: '⦿ Depósito Bancário', type: 8 },
    { name: '⦿ Dinheiro', type: 9 },
    { name: '⦿ PIX - Pagamento Instantâneo', type: 10 },
    { name: '⦿ Programa de Fidelidade', type: 11 },
    { name: '⦿ Transferência Bancária', type: 12 },
    { name: '⦿ Vale Alimentação', type: 13 },
    { name: '⦿ Vale Combustível', type: 14 },
    { name: '⦿ Vale Presente', type: 15 },
    { name: '⦿ Vale Refeição', type: 16 },
  ];

  public paymentTermsList = [{ name: '⦿ À vista', type: 0 }];

  @Output() searchPeople: SearchLoadingUnique = {
    noTitle: false,
    title: 'Cliente',
    url: 'people',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [
      {
        param: 'roles',
        value: '{2}'
      }
    ],
  };

  @Output() searchCategory: SearchLoadingUnique = {
    noTitle: false,
    title: 'Categoria',
    url: 'category',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [
      {
        param: 'role',
        value: 1,
      },
    ],
  };

  @Output() searchBank: SearchLoadingUnique = {
    noTitle: false,
    title: 'Conta',
    url: 'bank',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [],
  };

  @Output() searchUser: SearchLoadingUnique = {
    noTitle: false,
    title: 'Usuário',
    url: 'people',
    searchFieldOn: null,
    searchFieldOnCollum: ['name'],
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    validation: true,
    paramsArray: [
      {
        param: 'roles',
        value: '{0}'
      }
    ],
  };

  public plots = this.myForm.get('plots') as FormArray;

  @Output() public pageHeader: PageHeader = {
    title: 'Recebimento de venda na caixa central',
    description: 'Recebimento de venda na caixa central',
    button: {
      text: 'Voltar',
      icon: 'arrow_back',
      action: () => this.closeModal()
    },
  };

  @Output() public navigationButtons: BasicFormButtons = {
    buttons: [
      {
        text: 'Finalizar Venda',
        icon: 'save',
        action: () => this.save(),
        class: 'c2-btn c2-btn-green',
        navigation: false,
      },
    ]
  }

  public validationFields: Array<any> = [
    { name: 'peopleId', validation: true, msg: 'Informe um cliente!' },
    { name: 'categoryId', validation: true, msg: 'Informe uma categoria!' },
    { name: 'userId', validation: true, msg: 'Informe um usuário!' },
    {
      name: 'bankAccountId',
      validation: true,
      msg: 'Informe uma conta bancaria!',
    },
    {
      name: 'products',
      validation: true,
      msg: 'É necessário adicionar produto ou serviço!',
    },
  ];

  //Terminal selecionado
  public terminalSelected: any = null;

  public auth!: Auth;

  public products: any[] = [];

  //Status da NFe
  public statusNFeRequest: any = {
    status: 0,
    message: '',
    number: 0,
    id: '',
    tpEmis: 0,
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: string,
    private datePipe: DatePipe,
    private saleService: SaleService,
    private notificationService: NotificationService,
    private dialogRef: MatDialogRef<ReceivedBoxCentralComponent>,
    private libraryService: LibraryService,
    private indexedDbService: IndexedDbService,
    private serverLocalhostService: ServerLocalhostService,
    private storageService: StorageService,
    private dialogMessageService: DialogMessageService
  ) {
    this.auth = this.storageService.getAuth();
   }

  async ngOnInit(): Promise<void> {
    this.loadingFull.active = true;

    this.terminalSelected = await this.indexedDbService.getAllData('terminal').then(res => res[0]);

    for (let i = 1; i <= 48; i++) {
      this.paymentTermsList.push({
        name: `⦿ ${i}x`,
        type: i,
      });
    }

    this.saleService
        .show(this.data)
        .pipe(
          finalize(() => (this.loadingFull.active = false)),
          catchError((error) => {
            this.notificationService.warn('Dados não encontrados...');
            this.closeModal();
            return throwError(error);
          }),
          map((res) => {
            this.setForm(res);
          })
        )
        .subscribe();
  }

  closeModal() {
    this.dialogRef.close();
  }

  setForm(value: any): void {
    if (value) {
      if (value.products && value.products.length > 0) {
        this.products = value.products;
      }

      if (value.bills && value.bills.length > 0) {
        for (const portion of value.bills) {
          this.addPortion(portion);
        }
      }

      this.searchUser.searchFieldOn = value.user;
      this.searchUser.searchField.setValue(value.user.name);
      this.searchPeople.searchFieldOn = value.people;
      this.searchPeople.searchField.setValue(value.people.name);
      this.searchCategory.searchFieldOn = value.category || null;
      this.searchCategory.searchField.setValue(value.category?.name || '');
      this.searchBank.searchFieldOn = value.bank || null;
      this.searchBank.searchField.setValue(value.bank?.name || '');
      this.myForm.patchValue(value);
      this.myForm.controls['date_sale'].setValue(
        this.datePipe.transform(value.date_sale, 'yyyy-MM-dd')
      );
      this.myForm.controls['date_budget'].setValue(
        this.datePipe.transform(value.date_budget, 'yyyy-MM-dd')
      );
      this.myForm.controls['date_budget_validity'].setValue(
        this.datePipe.transform(value.date_budget_validity, 'yyyy-MM-dd')
      );
      this.myForm.controls['contract_date_finish'].setValue(
        this.datePipe.transform(value.contract_date_finish, 'yyyy-MM-dd')
      );
    }
  }

  addPortion(value: any): void {
    const control = new FormGroup({
      portion: new FormControl(value?.portion || this.plots.length + 1),
      form_payment: new FormControl(value?.form_payment || 9),
      date_due: new FormControl(
        this.datePipe.transform(value?.date_due || new Date(), 'yyyy-MM-dd')
      ),
      amount: new FormControl(parseFloat(value?.amount).toFixed(2) || 0),
      note: new FormControl(value?.note || ''),
    });

    this.plots.push(control);
  }

  changePortion(): void {
    if (this.myForm.value.status == 3) {
      this.plots.clear();
      this.addPortion({
        portion: 1,
        form_payment: 9,
        date_due: this.myForm.value.date_sale,
        amount: parseFloat(this.myForm.value.net_total),
        note: '',
      });
    }

    if (this.myForm.value.payment_terms > 0 && this.myForm.value.status == 3) {
      this.plots.clear();
      const portionCalc = this.libraryService.calcularParcelas(
        this.myForm.value.payment_terms,
        this.myForm.value.date_sale
      );

      for (let i = 1; i <= this.myForm.value.payment_terms; i++) {
        this.addPortion({
          portion: i,
          form_payment: 9,
          date_due: this.libraryService.getFormatEs(portionCalc[i - 1]),
          amount:
            parseFloat(this.myForm.value.net_total) /
            this.myForm.value.payment_terms,
          note: '',
        });
      }
    }
  }

  validateForm(): void {
    this.searchPeople.validation = !!this.myForm.value.peopleId;
    this.validationFields.find((v) => v.name === 'peopleId').validation =
      !!this.myForm.value.peopleId;
    if (
      parseInt(this.myForm.value.status, 0) === 3 &&
      !this.myForm.value.is_contract
    ) {
      this.searchCategory.validation = !!this.myForm.value.categoryId;
      this.validationFields.find((v) => v.name === 'categoryId').validation =
        !!this.myForm.value.categoryId;

      this.searchBank.validation = !!this.myForm.value.bankAccountId;
      this.validationFields.find(
        (v) => v.name === 'bankAccountId'
      ).validation = !!this.myForm.value.bankAccountId;
    }

    this.searchUser.validation = !!this.myForm.value.userId;
    this.validationFields.find((v) => v.name === 'userId').validation =
      !!this.myForm.value.userId;
  }

  public save(): void {
    this.loadingFull.active = true;

    this.myForm.value.peopleId = this.searchPeople?.searchFieldOn?.id;
    this.myForm.value.userId = this.searchUser?.searchFieldOn?.id;
    this.myForm.value.categoryId = this.searchCategory?.searchFieldOn?.id;
    this.myForm.value.bankAccountId = this.searchBank?.searchFieldOn?.id;
    this.myForm.value.status = parseInt(this.myForm.value.status, 0);
    this.myForm.value.status = 4;

    //Vamos passar pelas parcelas colocando o status de 0 para 1
    for (const portion of this.plots.controls) {
      portion.value.status = 1;
      portion.value.bill_value = portion.value.amount;
    }

    this.validateForm();

    if (
      !(this.validationFields.filter((v) => v.validation === false).length > 0)
    ) {
      this.saleService
        .save(this.data, this.myForm.value)
        .pipe(
          catchError((error) => {
            this.notificationService.warn(error.error);
            return throwError(error);
          }),
          map(() => {
            this.statusNFeRequest.status = 0;
            this.statusNFeRequest.tpEmis = 0;
            this.statusNFeRequest.message = '';
            this.generateNFe();
          })
        )
        .subscribe();
    } else {
      this.loadingFull.active = false;
      this.notificationService.error(
        this.validationFields.filter((v) => v.validation === false)[0].msg
      );
    }
  }

  printSale(): void {
    if (this.terminalSelected) {

      //Imprime venda
      this.serverLocalhostService.printSalePDV(this.terminalSelected.api_url,this.auth.company.config.token, {
        role: 0,
        company: this.auth.company,
        people: this.searchPeople?.searchFieldOn || this.auth.company.config.sale_people_default,
        sale: this.myForm.value,
        terminal: this.terminalSelected
      })
      .pipe(
        finalize(() => (console.log('ue'))),
        catchError((error) => {
          return throwError(error);
        }),
        map(() => {
          this.loadingFull.active = false;
          this.notificationService.success('Venda finalizada com sucesso.');
          this.closeModal();
        })
      )
      .subscribe();
    }
  }

  async generateNFe(): Promise<void> {
    if (this.terminalSelected) {
      if (this.terminalSelected.nfce_active > 0 && this.statusNFeRequest.status === 0) {
        this.loadingFull.active = true;
        this.loadingFull.message = 'Aguarde, gerando NFCe...';

        //Gerar NFCe
        const nfe = this.serverLocalhostService.generateNFCe(this.auth.company,
          this.terminalSelected,
          this.searchPeople?.searchFieldOn || this.auth.company.config.sale_people_default,
          this.products,
          this.plots.value,
          this.statusNFeRequest.tpEmis,
        );

        //Adiciona o id da venda na nfe
        nfe.saleId = this.data;

        //Salva a nfe e pega o id colocando no statusNfe
        await this.indexedDbService.addData(nfe, 'nfes').then((res: any) => {
          this.statusNFeRequest.id = res;
        });

        //Enviar nfe
        this.serverLocalhostService.sendNFe(this.terminalSelected.api_url, {
          company: this.auth.company,
          nfe: nfe,
          terminal: this.terminalSelected,
        }).pipe(
          finalize(() => (console.log('ue'))),
          catchError((error) => {
            return throwError(error);
          }),
          map(() => {
            //Atualiza o número da NFCe somando 1
            this.statusNFeRequest.status = 1;
            this.statusNFeRequest.number = this.terminalSelected.nfce_numero;
            this.statusNFeRequest.message = 'Aguarde a emissão do cupom fiscal...';
            this.loadingFull.message = this.statusNFeRequest.message;
            this.checkNFeStatus();
          })
        )
        .subscribe();
      } else {
        //Imprime a venda direto
        this.printSale();
      }
    }
  }

  checkNFeStatus(): void {
    //A cada 5 segundos, faz a chamada à api
    interval(5000)
      .pipe(
        switchMap(() => this.serverLocalhostService.getStatusNFe(this.terminalSelected.api_url)),
        takeWhile(() => this.statusNFeRequest.status === 1),
      )
      .subscribe({
        next: (localhost) => {
          console.log(localhost);
          this.statusNFeRequest.status = parseInt(localhost.status, 0);
          this.statusNFeRequest.message = localhost.mensagem_sefaz;
          this.loadingFull.message = this.statusNFeRequest.message;

          if (this.statusNFeRequest.status === 2) {
            this.statusNFeRequest.message = 'NFCe gerada com sucesso';

            // //Consulta a NFCe pelo numero
            this.indexedDbService.getData(this.statusNFeRequest.id, 'nfes').then((nfe: any) => {
              nfe.chave_nfe = localhost.chave_nfe;
              nfe.protocolo = localhost.protocolo;
              nfe.caminho_xml_nota_fiscal = localhost.caminho_xml_nota_fiscal;
              nfe.serie = localhost.serie;
              nfe.numero = localhost.numero;
              nfe.status = localhost.status;
              nfe.caminho_danfe = localhost.caminho_danfe;
              nfe.mensagem_sefaz = localhost.mensagem_sefaz;
              nfe.status_sefaz = localhost.status_sefaz;

              this.indexedDbService.updateData(nfe, 'nfes');
            });

            this.terminalSelected.nfce_numero = this.statusNFeRequest.number + 1;
            this.indexedDbService.updateData(this.terminalSelected, 'terminal');

            //Imprime a venda
            this.printSale();
          } else if (this.statusNFeRequest.status === 3) {
            //Deleta a NFCe
            this.indexedDbService.deleteData(this.statusNFeRequest.id, 'nfes');

            //Se acontecer o erro e a primeira tentativa for teNormal tentar em contingencia
            if (this.statusNFeRequest.tpEmis === 0) {
              this.statusNFeRequest.status = 0;
              this.statusNFeRequest.tpEmis = 1;
              this.statusNFeRequest.message = '';
              this.generateNFe();
            } else if (this.statusNFeRequest.tpEmis === 1) {
              this.loadingFull.active = false;
              this.dialogMessageService.openDialog({
                icon: 'priority_high',
                iconColor: '#ff5959',
                title: 'Erro ao gerar NFCe',
                message: 'Não foi possível gerar a NFCe, tente novamente mais tarde.',
                message_next: localhost.mensagem_sefaz,
              });
            }
          }
        },
        error: (error) => {
          console.log(error);
          this.statusNFeRequest.status = 2;
          this.statusNFeRequest.message = 'Erro ao gerar NFCe';
        }
      });
  }
}
