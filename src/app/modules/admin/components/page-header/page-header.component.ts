import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { PageHeader } from '../../interfaces/page-header.interface';
import { BasicFormButtonsIcons } from '../../interfaces/basic-form-buttons-icons.interface';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent implements OnInit, OnChanges {
  @Input() public header!: PageHeader;
  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['header']) {
      //
    }
  }

  getButtonsIcons(show: boolean): BasicFormButtonsIcons["buttons"] {
    if (this.header.buttonsIcons) {
      return this.header.buttonsIcons.filter(button => button.showButton === show);
    } else {
      return []
    }
  }
}
