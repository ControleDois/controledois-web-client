import { Component, Input, OnInit } from '@angular/core';
import { BasicFormNavigation } from '../../interfaces/basic-form-navigation.interface';

@Component({
  selector: 'app-basic-form-navigation',
  templateUrl: './basic-form-navigation.component.html',
  styleUrls: ['./basic-form-navigation.component.scss']
})
export class BasicFormNavigationComponent implements OnInit {
  @Input() public navigation!: BasicFormNavigation;

  constructor() { }

  ngOnInit(): void {
  }

}
