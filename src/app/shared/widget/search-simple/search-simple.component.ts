import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-search-simple',
  templateUrl: './search-simple.component.html',
  styleUrls: ['./search-simple.component.scss']
})
export class SearchSimpleComponent implements OnInit {
  @Input()
  public search!: FormControl;

  constructor() { }

  ngOnInit(): void {
  }
}
