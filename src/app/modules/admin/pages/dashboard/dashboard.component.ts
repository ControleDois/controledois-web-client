import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { map } from 'rxjs';
import { DashboardService } from 'src/app/shared/services/dashboard.service';
import { Chart, CategoryScale, BarController, BarElement, PointElement, LinearScale, Title, Legend, Tooltip, DoughnutController, ArcElement} from 'chart.js'
import { StorageService } from 'src/app/shared/services/storage.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { BackupsModalComponent } from '../modals/backups-modal/backups-modal.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild("meuCanvas", { static: true }) elemento: ElementRef | any;
  @ViewChild("chartBackups", { static: true }) chartBackups: ElementRef | any;

  public receviementToday = 0;
  public receviementRemaining = 0;
  public receviementLate = 0;

  public paymentToday = 0;
  public paymentRemaining = 0;
  public paymentLate = 0;

  public banks: Array<any> = [];
  public cashFlow: Array<any> = [];
  public backups = {
    all: 0,
    on: 0,
    alert: 0,
    off: 0,
    error: 0
  }

  private appChartBackup: any;
  public activeRole = '1';

  constructor(
    private dashboardService: DashboardService,
    private storageService: StorageService,
    private dialog: MatDialog,
  ) {
    Chart.register(
      CategoryScale,
      BarController,
      BarElement,
      PointElement,
      LinearScale,
      Title,
      Legend,
      Tooltip,
      DoughnutController,
      ArcElement
    );
   }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    //this.receviementToday = this.storageService.getList(`receviementToday`);
    //this.receviementRemaining = this.storageService.getList(`receviementRemaining`);
    //this.receviementLate = this.storageService.getList(`receviementLate`);

    //this.paymentToday = this.storageService.getList(`paymentToday`);
    //this.paymentRemaining = this.storageService.getList(`paymentRemaining`);
    //this.paymentLate = this.storageService.getList(`paymentLate`);


    //this.banks = this.storageService.getList(`DashBanks`);

    this.dashboardService.receviementAndPayment().pipe(
      map(res => {
        //this.storageService.setList(`receviementToday`, res.receviement_today);
        this.receviementToday = res.receviement_today;
        //this.storageService.setList(`receviementRemaining`, res.receviement_remaining);
        this.receviementRemaining = res.receviement_remaining;
        //this.storageService.setList(`receviementLate`, res.receviement_late);
        this.receviementLate = res.receviement_late;

        //this.storageService.setList(`paymentToday`, res.payment_today);
        this.paymentToday = res.payment_today;
        //this.storageService.setList(`paymentRemaining`, res.payment_remaining);
        this.paymentRemaining = res.payment_remaining;
        //this.storageService.setList(`paymentLate`, res.payment_late);
        this.paymentLate = res.payment_late;
      })
    ).subscribe();

    this.dashboardService.banksAccounts().pipe(
      map(res => {
        //this.storageService.setList(`DashBanks`, res);
        this.banks = res;
      })
    ).subscribe();

    this.dashboardService.cashFlow().pipe(
      map(res => {
        this.cashFlow = res;
        this.showCharts();
      })
    ).subscribe();

    this.dashboardService.backups('1').pipe(
      map(res => {
        this.backups = res;
        if (this.backups.all > 0) {
          this.showBackups();
        }
      })
    ).subscribe();

  }

  loadBackups(role: string): void {
    this.activeRole = role;
    this.dashboardService.backups(role).pipe(
      map(res => {
        this.backups = res;
        this.showBackups();
      })
    ).subscribe();
  }

  showBackups() {
    if (this.appChartBackup) {
      this.appChartBackup.destroy();
    }

    this.appChartBackup = new Chart(this.chartBackups.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Todos', 'Operacional', 'Alerta', 'Inoperante', 'Erro'],
        datasets: [
          {
            data: [this.backups.all, this.backups.on, this.backups.alert, this.backups.off, this.backups.error],
            backgroundColor: ['#3ba9eee5', '#97fda4', '#f5d678c2', '#607D8B', '#fb859c'],
            borderColor: ['#1587ce', '#4AB858', '#FFC107', '#607D8B', '#F43E61', ],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        }
      },
    });
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

  showBackupsModel(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = false;
    dialogConfig.width = '920px';
    dialogConfig.maxHeight = '550px';
    this.dialog.open(BackupsModalComponent, dialogConfig);
  }
}
