import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-splash-change',
  templateUrl: './splash-change.component.html',
  styleUrls: ['./splash-change.component.scss']
})
export class SplashChangeComponent implements OnInit {
  @Input() paymentChange: number = 0;

  constructor() { }

  ngOnInit(): void {
  }

}
