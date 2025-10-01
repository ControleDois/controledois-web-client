import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, filter, finalize, interval, map, switchMap, throwError } from 'rxjs';
import { IndexedDbService } from 'src/app/shared/services/indexed-db.service';
import { DatePipe } from '@angular/common';
import { Auth } from 'src/app/shared/interfaces/auth.interface';
import { StorageService } from 'src/app/shared/services/storage.service';
import { InternetService } from 'src/app/shared/services/internet.service';
import { SaleService } from 'src/app/shared/services/sale.service';
import { EncryptService } from 'src/app/shared/services/encrypt.service';
import { ServerLocalhostService } from 'src/app/shared/services/server-localhost.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit  {
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

  public products = this.myForm.get('products') as FormArray;
  public plots = this.myForm.get('plots') as FormArray;

  public statusProcess: Number = 0;
  public statusProcessChange: number = 0;
  public searchStatus = new FormControl('');
  public skeletonOn: boolean = false;

  //Produto selecionado
  public productSelected: any = null;
  public productAmount: number = 1;

  //Pagamento selecionado
  public paymentSelected: number = 0;

  //Pagamento parcelado
  public paymentInstallments: number = 1;

  //Item selecionado para remoção
  public itemSelectedRemove: number = 0;

  public auth!: Auth;

  private timerChange: any;

  constructor(
    private indexedDbService: IndexedDbService,
    private datePipe: DatePipe,
    private storageService: StorageService,
    private internetService: InternetService,
    private saleService: SaleService,
    private serverLocalhostService: ServerLocalhostService
  ) {
    this.auth = storageService.getAuth();
   }

  ngOnInit(): void {
    this.searchStatus.valueChanges
    .pipe(
      debounceTime(100),
      distinctUntilChanged(),
      map(() => {
        this.changeInput();
      })
    )
    .subscribe();

    interval(10000)
      .pipe(
        switchMap(() => this.internetService.hasGoodConnection(this.statusProcess === 0)),
        filter((isGoodConnection) => isGoodConnection)
      )
      .subscribe(() => this.syncSales());
  }

  public changeInput(): void {
    if (this.statusProcess === 1) {
      //Se estiver vazio o texto limpa o produto selecionado
      if ((this.searchStatus.value || '').trim() === '') {
        this.productSelected = null;
        this.productAmount = 1;
        return;
      }

      //Verifica se existe - que indica que quer deletar um item
      // que vem depois do - é o número do item
      const searchText = this.searchStatus.value || '';
      const parts = searchText.split('-').map((part: string) => part.trim());

      this.itemSelectedRemove = 0;
      if (parts.length > 1) {
        this.itemSelectedRemove = Number(parts[1]) || 0;
        return
      }

      this.indexedDbService.filterProductBy(this.searchStatus.value || '').then((res) => {
        this.productSelected = res.length > 0 ? res[0] : null;
        this.productSelected.amount = this.productAmount;
      });
    }

    if (this.statusProcess === 2) {
      //Se estiver vazio o texto limpa o produto selecionado
      if ((this.searchStatus.value || '').trim() === '') {
        this.paymentSelected = 0;
        return;
      }

      //Verifica se existe = que indica valor se existir pega o valor
      // que vem depois do =
      // Exemplo 1=50 (1 é o tipo do pagamento e 50 é o valor)
      const searchText = this.searchStatus.value || '';
      const parts = searchText.split('=').map((part: string) => part.trim());

      if (parts.length > 1) {
        this.paymentSelected = Number(parts[0]) || 0;
        return
      }

      this.paymentSelected = Number(this.searchStatus.value);

      if (isNaN(this.paymentSelected)) {
        this.paymentSelected = 0;
      }

      if (this.paymentSelected < 0 || this.paymentSelected > 4) {
        this.paymentSelected = 0;
      }
    }
  }

  public startSale(): void {
    this.statusProcess = 1;
    if (this.timerChange) {
      clearTimeout(this.timerChange);
    }
  }

  public processStatus(): void {
    if (this.statusProcess === 1 ) {
      if (this.itemSelectedRemove > 0) {
        const index = this.products.controls.findIndex((control) => control.value.item === this.itemSelectedRemove);

        if (index !== -1) {
          // Coloca item como removido
          this.products.at(index).get('removed')?.setValue(true);
          this.itemSelectedRemove = 0;
          this.searchStatus.setValue('');
          return;
        }
      }

      // verifica se existe * que indica quantidade se existir pega a quantidade
      // que vem depois do *
      const searchText = this.searchStatus.value || '';
      const parts = searchText.split('*').map((part: string) => part.trim());

      if (parts.length > 1) {
        this.productAmount = Number(parts[1]) || 1;
        this.searchStatus.setValue('');
        return;
      }

      // Se houver um produto selecionado, adiciona o produto
      if (this.productSelected) {
        this.addProduct();
        this.productSelected = null;
        this.searchStatus.setValue('');
        return;
      }

      //Se apertar enter e text for vazio
      if (searchText.trim() === '' && this.products.length > 0) {
        this.statusProcess = 2;
        return;
      }
    }

    if (this.statusProcess === 2 ) {
      if (this.paymentSelected > 0) {
        this.addPortion();
      }

      //Se o pagamento for maior ou igual ao total finaliza a venda
      if (this.sumPayments() >= this.sumProducts().total) {
        //Salva a venda
        this.save();
      }
    }
  }

  addProduct(): void {
    const control = new FormGroup({
      item: new FormControl(this.products.length + 1),
      product_id: new FormControl(this.productSelected?.id || null),
      barcode: new FormControl(this.productSelected?.barcode || ''),
      description: new FormControl(this.productSelected?.name || ''),
      amount: new FormControl(this.productAmount || 0),
      cost_value: new FormControl(this.productSelected?.sale_value || 0),
      subtotal: new FormControl(this.productAmount * this.productSelected?.sale_value || 0),
      removed: new FormControl(false),
      product: new FormControl(this.productSelected)
    });

    this.products.push(control);
  }

  sumProducts(): any {
    //Necessário ignorar os produtos removidos
    return {
      subtotal: this.products.value
        .filter((product: any) => !product.removed)
        .reduce((acc: number, product: any) => acc + (Number(product.subtotal) || 0), 0),
      discount: 0,
      shipping: 0,
      total: this.products.value
        .filter((product: any) => !product.removed)
        .reduce((acc: number, product: any) => acc + (Number(product.subtotal) || 0), 0),
    }
  }

  addPortion(): void {
    const values = this.sumProducts();
    const totalPayments = this.sumPayments();
    let valuePayment = values.total - totalPayments;

    let formPayment = 0;

    switch (this.paymentSelected) {
      case 1:
        formPayment = 9;
        break;
      case 2:
        formPayment = 2;
        break;
      case 3:
        formPayment = 1;
        break;
      case 4:
        formPayment = 10;
        break;
    }

    //Verifica se existe = que indica valor se existir pega o valor
    const searchText = this.searchStatus.value || '';
    const parts = searchText.split('=').map((part: string) => part.trim());

    if (parts.length > 1) {
      valuePayment = parseFloat(parts[1]).toFixed(2)|| values.total;
    }

    const sumTotal = values.total - totalPayments;
    const totalChange = sumTotal > valuePayment ? 0 : sumTotal - valuePayment;

    const control = new FormGroup({
      portion: new FormControl(this.plots.length + 1),
      form_payment: new FormControl(formPayment || 9),
      date_due: new FormControl(
        this.datePipe.transform(new Date(), 'yyyy-MM-dd')
      ),
      amount: new FormControl(values.total - totalPayments|| 0),
      bill_value: new FormControl(valuePayment|| 0),
      change: new FormControl(Math.abs(totalChange)),
      note: new FormControl(''),
      status: new FormControl(1),
    });

    this.plots.push(control);
    this.paymentSelected = 0;
    this.searchStatus.setValue('');
  }

  public sumPayments(): number {
    return this.plots.value.reduce((acc: number, plot: any) => acc + Number(plot.bill_value || 0), 0);
  }

  //Buscar o valor total pago e troco
  public getTotalChange(): any {
    //O troco deve ser calculado somente sobre o pagamento em dinheiro
    const cashPayments = this.plots.value.reduce((acc: number, plot: any) => acc + Number(plot.change || 0), 0);

    return {
      received: this.sumPayments(),
      remaining: this.sumProducts().total - this.sumPayments(),
      change: cashPayments,
    }
  }

  async save() {
    const sumProducts = this.sumProducts();

    this.myForm.value.id = EncryptService.generateMd5Id(new Date().toISOString());
    this.myForm.value.peopleId = this.auth.company.config.sale_people_default_id;
    this.myForm.value.userId = this.auth.user.people.id;
    this.myForm.value.categoryId = this.auth.company.config.sale_category_default_id
    this.myForm.value.bankAccountId = this.auth.company.config.sale_bank_account_default_id;
    this.myForm.value.status = 3;
    this.myForm.value.date_sale = new Date();

    this.myForm.value.amount = sumProducts.subtotal;
    this.myForm.value.discount = sumProducts.discount;
    this.myForm.value.net_total = sumProducts.total;

    this.indexedDbService.addData(this.myForm.value, 'sales');
    this.statusProcessChange = this.getTotalChange().change;

    //Mostrar troco
    this.timerChange = setTimeout(() => {
      this.statusProcessChange = 0;
    }, 60000);

    //Pega o terminal favorito para operação
    const terminal = await this.indexedDbService.getAllData('terminal').then(res => res[0]);

    if (terminal) {

      //Gerar NFCe
      const nfe = this.serverLocalhostService.generateNFCe(this.auth.company,
        terminal?.natureOperation || this.auth.company.config.natureOperation,
        this.auth.company.config.sale_people_default,
        this.products.value,
        this.plots.value
      );

      this.indexedDbService.addData(nfe, 'nfes');

      //Enviar nfe
      this.serverLocalhostService.sendNFe(terminal.api_url, {
        company: this.auth.company,
        nfe: nfe,
        terminal: terminal
      }).pipe(
        finalize(() => (console.log('ue'))),
        catchError((error) => {
          return throwError(error);
        }),
        map(() => {
          console.log('envia nota')
        })
      )
      .subscribe();

      //Imprime venda
      this.serverLocalhostService.printSalePDV(terminal.api_url,this.auth.company.config.token, {
        role: 0,
        company: this.auth.company,
        people: this.auth.company.config.sale_people_default,
        sale: this.myForm.value,
        terminal: terminal
      })
      .pipe(
        finalize(() => (console.log('ue'))),
        catchError((error) => {
          return throwError(error);
        }),
        map(() => {
          console.log('imprime')
        })
      )
      .subscribe();
    }

    this.statusProcess = 0;
    this.products.clear();
    this.plots.clear();
    this.productSelected = null;
    this.productAmount = 1;
    this.paymentSelected = 0;
    this.searchStatus.setValue('');
  }

  syncSales(): void {
    if (this.statusProcess === 0) {
      this.indexedDbService.getAllData('sales').then((res: any) => {
        res.forEach((sale: any) => {
          this.saleService
            .save('new', sale)
            .pipe(
              finalize(() => ( console.log('Venda sincronizada.'))),
              catchError((error) => {
                console.log(error);
                return throwError(error);
              }),
              map((res) => {
                // Deleta o registro antigo
                this.indexedDbService.deleteData(sale.id, 'sales');
              })
            )
            .subscribe();
        });
      })
    }
  }
}
