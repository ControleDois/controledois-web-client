import {Component, Input, OnInit} from '@angular/core';
import { LoadingFull } from '../../interfaces/loadingFull.interface';

@Component({
  selector: 'app-loading-full',
  templateUrl: './loading-full.component.html',
  styleUrls: ['./loading-full.component.scss']
})
export class LoadingFullComponent implements OnInit {
  @Input() public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  constructor() {
  }

  ngOnInit(): void {
  }

}
