import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-selected-product',
  templateUrl: './selected-product.component.html',
  styleUrls: ['./selected-product.component.scss']
})
export class SelectedProductComponent implements OnInit {
  @Input() public product!: any;

  constructor() { }

  ngOnInit(): void {
  }

}
