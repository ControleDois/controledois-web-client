import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { map } from 'rxjs';
import { DashboardService } from 'src/app/shared/services/dashboard.service';
import { Chart, CategoryScale, BarController, BarElement, PointElement, LinearScale, Title, Legend, Tooltip} from 'chart.js'
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild("meuCanvas", { static: true }) elemento: ElementRef | any;

  public receviementToday = 0;
  public receviementRemaining = 0;
  public receviementLate = 0;

  public paymentToday = 0;
  public paymentRemaining = 0;
  public paymentLate = 0;

  public banks: Array<any> = [];
  public cashFlow: Array<any> = [];

  constructor(
    private dashboardService: DashboardService,
    private storageService: StorageService,
  ) {
    Chart.register(CategoryScale, BarController, BarElement, PointElement, LinearScale, Title, Legend, Tooltip);
   }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.receviementToday = this.storageService.getList(`receviementToday`);
    this.receviementRemaining = this.storageService.getList(`receviementRemaining`);
    this.receviementLate = this.storageService.getList(`receviementLate`);

    this.paymentToday = this.storageService.getList(`paymentToday`);
    this.paymentRemaining = this.storageService.getList(`paymentRemaining`);
    this.paymentLate = this.storageService.getList(`paymentLate`);


    this.banks = this.storageService.getList(`DashBanks`);

    this.dashboardService.receviementAndPayment().pipe(
      map(res => {
        this.storageService.setList(`receviementToday`, res.receviement_today);
        this.receviementToday = res.receviement_today;
        this.storageService.setList(`receviementRemaining`, res.receviement_remaining);
        this.receviementRemaining = res.receviement_remaining;
        this.storageService.setList(`receviementLate`, res.receviement_late);
        this.receviementLate = res.receviement_late;

        this.storageService.setList(`paymentToday`, res.payment_today);
        this.paymentToday = res.payment_today;
        this.storageService.setList(`paymentRemaining`, res.payment_remaining);
        this.paymentRemaining = res.payment_remaining;
        this.storageService.setList(`paymentLate`, res.payment_late);
        this.paymentLate = res.payment_late;
      })
    ).subscribe();

    this.dashboardService.banksAccounts().pipe(
      map(res => {
        this.storageService.setList(`DashBanks`, res);
        this.banks = res;
      })
    ).subscribe();

    this.dashboardService.cashFlow().pipe(
      map(res => {
        this.cashFlow = res;
        this.showCharts();
      })
    ).subscribe();
  }

  showCharts() {
    new Chart(this.elemento.nativeElement, {
      type: 'bar',
      data: {
        labels: this.cashFlow.map(vBill => vBill.Day),
        datasets: [
          {
            label: 'Pagamentos',
            data: this.cashFlow.map(vBill => vBill.bill_payment * -1),
            borderColor: '#F43E61',
            backgroundColor: '#fb859c',
            borderWidth: 2,
            borderRadius: 2,
            borderSkipped: false,
          },
          {
            label: 'Recebimentos',
            data: this.cashFlow.map(vBill => vBill.bill_recebiment),
            borderColor: '#4AB858',
            backgroundColor: '#97fda4',
            borderWidth: 2,
            borderRadius: 2,
            borderSkipped: false,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            display: true,
          },
          title: {
            display: true,
            text: 'Fluxo de Caixa Diário'
          }
        },
      },
    });
  }

  getTotalBanks(): string {
    const total = this.banks.reduce((acc, t) => (parseFloat(acc) || 0) + (parseFloat(t.total) || 0), 0);
    return parseFloat(total).toFixed(2);
  }
}
