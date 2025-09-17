import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.scss']
})
export class PaymentMethodsComponent implements OnInit {
  @Input() selectedPayment: number = 0;

  constructor() { }

  ngOnInit(): void {
  }

}
