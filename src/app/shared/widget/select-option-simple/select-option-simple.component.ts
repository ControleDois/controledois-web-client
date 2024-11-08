import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-select-option-simple',
  templateUrl: './select-option-simple.component.html',
  styleUrls: ['./select-option-simple.component.scss']
})
export class SelectOptionSimpleComponent implements OnInit {

  @Input()
  public option!: FormControl;

  @Input()
  public optionsType!: any[];

  constructor() { }

  ngOnInit(): void {
  }

}
