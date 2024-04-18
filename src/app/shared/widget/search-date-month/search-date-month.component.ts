import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-search-date-month',
  templateUrl: './search-date-month.component.html',
  styleUrls: ['./search-date-month.component.scss']
})
export class SearchDateMonthComponent implements OnInit {
  @Input()
  public date!: Date;
  @Output() public eventEmit = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
  }

  setDateFilter(add: any): void {
    if (add) {
      const month = this.date.getMonth() === 11 ? 0 : this.date.getMonth() + 1;
      const fullYear =
        this.date.getMonth() === 11
          ? this.date.getFullYear() + 1
          : this.date.getFullYear();
      this.date.setMonth(month);
      this.date.setFullYear(fullYear);
    } else {
      const month = this.date.getMonth() === 0 ? 11 : this.date.getMonth() - 1;
      const fullYear =
        this.date.getMonth() === 0
          ? this.date.getFullYear() - 1
          : this.date.getFullYear();
      this.date.setMonth(month);
      this.date.setFullYear(fullYear);
    }

    this.eventEmit.emit(this.date);
  }

  getMonthNameBr(date: any): string {
    const month = date.getMonth();

    switch (month) {
      case 0: return 'Janeiro';
      case 1: return 'Fevereiro';
      case 2: return 'Março';
      case 3: return 'Abril';
      case 4: return 'Maio';
      case 5: return 'Junho';
      case 6: return 'Julho';
      case 7: return 'Agosto';
      case 8: return 'Setembro';
      case 9: return 'Outubro';
      case 10: return 'Novembro';
      case 11: return 'Dezembro';
      default: return 'Janeiro'
    }
  }
}
