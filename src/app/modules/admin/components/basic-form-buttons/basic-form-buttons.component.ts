import { Component, Input, OnInit } from '@angular/core';
import { BasicFormButtons } from '../../interfaces/basic-form-buttons.interface';

@Component({
  selector: 'app-basic-form-buttons',
  templateUrl: './basic-form-buttons.component.html',
  styleUrls: ['./basic-form-buttons.component.scss']
})
export class BasicFormButtonsComponent implements OnInit {
  @Input() public navigation!: BasicFormButtons;

  constructor() { }

  ngOnInit(): void {
  }

}
