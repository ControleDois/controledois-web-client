import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {SearchLoadingChips} from "./search-loading-chips.interface";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatChipInputEvent} from "@angular/material/chips";
import {MatAutocomplete, MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {debounceTime, distinctUntilChanged, finalize, map} from "rxjs/operators";
import {NotificationService} from "../../services/notification.service";
import { SearchLoadingUniqueService } from '../../services/search-loading-unique.service';

@Component({
  selector: 'app-search-loading-chips',
  templateUrl: './search-loading-chips.component.html',
  styleUrls: ['./search-loading-chips.component.scss']
})
export class SearchLoadingChipsComponent implements OnInit {
  @Input()
  public search!: SearchLoadingChips;
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

  add(event: MatChipInputEvent): void {
    if (this.search.searchFieldOn.filter((tag: any) => tag === event.value.trim()).length > 0) {
      this.notificationService.warn('Etiqueta já selecionada!');
    } else {
      if (event.value.trim() !== '') {
        this.search.searchFieldOn.push(event.value.trim());
        this.search.searchField.setValue(null);
      }
    }
  }

  selectedItem(event: MatAutocompleteSelectedEvent): void {
    if (this.search.searchFieldOn.filter((tag: any) => tag === event.option.viewValue.trim()).length > 0) {
      this.notificationService.warn('Etiqueta já selecionada!');
      this.search.searchField.setValue('');
    } else {
      this.search.searchFieldOn.push(event.option.viewValue);
      this.search.searchField.setValue('');
    }
  }

  removeItem(item: string): void {
    const index = this.search.searchFieldOn.indexOf(item);
    if (index >= 0) {
      this.search.searchFieldOn.splice(index, 1);
    }
  }
}
