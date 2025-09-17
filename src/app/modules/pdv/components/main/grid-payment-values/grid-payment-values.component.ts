import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-grid-payment-values',
  templateUrl: './grid-payment-values.component.html',
  styleUrls: ['./grid-payment-values.component.scss']
})
export class GridPaymentValuesComponent implements OnInit {
   @Input() public values!: any;

  constructor() { }

  ngOnInit(): void {
  }

}
