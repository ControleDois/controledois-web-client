import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {SearchLoadingChipsObject} from "./search-loading-chips-object.interface";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatChipInputEvent} from "@angular/material/chips";
import {MatAutocomplete, MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {debounceTime, distinctUntilChanged, finalize, map} from "rxjs/operators";
import {NotificationService} from "../../services/notification.service";
import { SearchLoadingUniqueService } from '../../services/search-loading-unique.service';

@Component({
  selector: 'app-search-loading-chips-object',
  templateUrl: './search-loading-chips-object.component.html',
  styleUrls: ['./search-loading-chips-object.component.scss']
})
export class SearchLoadingChipsObjectComponent implements OnInit {
  @Input()
  public search!: SearchLoadingChipsObject;
  @Output() public eventEmit = new EventEmitter<any>();
  separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('searchInput', { static: false })
  searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false })
  matAutocompleteSearch!: MatAutocomplete;

  public loading = false;
  public list: any[] = [];

  constructor(
    private searchLoadingUniqueService: SearchLoadingUniqueService,
    private notificationService: NotificationService,
  ) {
  }

  ngOnInit(): void {
    this.search.searchField.setValue('');
    this.search.searchField.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        map(() => {
          this.load();
        })
      )
      .subscribe();
  }

  load(): void {
    this.loading = true;
    this.searchLoadingUniqueService.index(
      this.search.url,
      this.search.searchField.value,
      this.search.sortedBy,
      this.search.orderBy,
      1,
      10,
      this.search.paramsArray
    )
      .pipe(
        map((res) => {
          this.list = res.data;
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe();
  }

  //Seleciona e valida o objeto inteiro, tem que validatr se o objeto já não está na lista
  selectedItem(event: MatAutocompleteSelectedEvent): void {
    const index = this.search.searchFieldOn.indexOf(event.option.value);
    if (index < 0) {
      this.search.searchFieldOn.push(event.option.value);
    }
    this.search.searchField.setValue('');
    this.searchInput.nativeElement.value = '';
    this.eventEmit.emit(this.search.searchFieldOn);
  }

  //remove o objeto da lista
  removeItem(item: any): void {
    const index = this.search.searchFieldOn.indexOf(item);
    if (index >= 0) {
      this.search.searchFieldOn.splice(index, 1);
    }
    this.eventEmit.emit(this.search.searchFieldOn);
  }
}
