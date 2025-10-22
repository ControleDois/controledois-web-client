import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-process-nfe',
  templateUrl: './process-nfe.component.html',
  styleUrls: ['./process-nfe.component.scss']
})
export class ProcessNfeComponent implements OnInit {
  @Input() processNfe: any;

  constructor() { }

  ngOnInit(): void {
  }

}
