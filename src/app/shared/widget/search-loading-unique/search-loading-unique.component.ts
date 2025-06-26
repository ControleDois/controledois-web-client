import {Component, ElementRef, Input, OnInit, ViewChild, EventEmitter, Output} from '@angular/core';
import {SearchLoadingUnique} from './search-loading-unique.interface';
import {MatAutocomplete, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {debounceTime, distinctUntilChanged, finalize, map} from 'rxjs/operators';
import {SearchLoadingUniqueService} from '../../services/search-loading-unique.service';

@Component({
  selector: 'app-search-loading-unique',
  templateUrl: './search-loading-unique.component.html',
})
export class SearchLoadingUniqueComponent implements OnInit {
  @Input()
  public search!: SearchLoadingUnique;
  @Output() public eventEmit = new EventEmitter<any>();

  selectable = true;

  public list: any[] = [];
  public loading = false;

  @ViewChild('searchInput', { static: false })
  searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false })
  matAutocompleteSearch!: MatAutocomplete;

  constructor(
    private searchLoadingUniqueService: SearchLoadingUniqueService,
  ) { }

  ngOnInit(): void {
    if (this.search.searchFieldOn) {
      this.search.searchField.setValue(this.getDisplayValue(this.search.searchFieldOn));
    }

    this.search.searchField.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        map(() => {
          if (!this.search.searchFieldOn?.[this.search.searchFieldOnCollum.join(' - ')]) {
            this.load();
          }
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

  selectedItem(event: MatAutocompleteSelectedEvent): void {
    this.search.searchFieldOn = this.list.find(
      (item) => item.id === event.option.value.id
    );

    this.search.searchField.setValue(event.option.viewValue);
    this.eventEmit.emit(this.search.searchFieldOn);
  }

  removeItem(): void {
    this.search.searchFieldOn = null;
    this.search.searchField.setValue(null);
  }

  getDisplayValue(item: any): string {
    return this.search.searchFieldOnCollum
      .map(field => item[field] || '') // Obtem os valores das chaves
      .filter(value => !!value) // Remove valores nulos ou indefinidos
      .join(' - '); // Concatena com " - "
  }
}
