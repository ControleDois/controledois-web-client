import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-grid-payments',
  templateUrl: './grid-payments.component.html',
  styleUrls: ['./grid-payments.component.scss']
})
export class GridPaymentsComponent implements OnInit {
  @Input() public values!: any;
  @Input() public payments!: any;

  constructor() { }

  ngOnInit(): void {
  }


  getPaymentImage(type: number): string {
    switch (type) {
      case 9:
        return 'assets/pdv/payments/1.png';
      case 2:
        return 'assets/pdv/payments/2.png';
      case 1:
        return 'assets/pdv/payments/3.png';
      case 10:
        return 'assets/pdv/payments/4.png';
      default:
        return 'assets/pdv/payments/1.png';
      }
  }

  getPaymentName(type: number): string {
    switch (type) {
      case 9:
        return 'Dinheiro';
      case 2:
        return 'Cartão de Crédito';
      case 1:
        return 'Cartão de Débito';
      case 10:
        return 'PIX';
      default:
        return 'Dinheiro';
      }
  }
}
