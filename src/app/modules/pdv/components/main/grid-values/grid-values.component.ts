import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-grid-values',
  templateUrl: './grid-values.component.html',
  styleUrls: ['./grid-values.component.scss']
})
export class GridValuesComponent implements OnInit {
  @Input() public values!: any;

  constructor() { }

  ngOnInit(): void {
  }

}
