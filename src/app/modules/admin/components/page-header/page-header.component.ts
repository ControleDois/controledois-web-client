import { Component, Input, OnInit } from '@angular/core';
import { PageHeader } from '../../interfaces/page-header.interface';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent implements OnInit {
  @Input() public header!: PageHeader;
  constructor() { }

  ngOnInit(): void {
  }

}
