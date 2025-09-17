import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LibraryService } from 'src/app/shared/services/library.service';

@Component({
  selector: 'app-grid-products',
  templateUrl: './grid-products.component.html',
  styleUrls: ['./grid-products.component.scss']
})
export class GridProductsComponent implements OnInit, OnChanges  {
  @Input() products: any;
  public displayedColumns: string[] = [
    'item',
    'barcode',
    'description',
    'cost_value',
    'amount',
    'subtotal',
  ];
  public dataSource = new MatTableDataSource<any>();
  public tableLength!: number;
  @ViewChild(MatSort)
  public sort!: MatSort;

  @ViewChild('listContainer') listContainer!: ElementRef;

  constructor(
    public libraryService: LibraryService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['products']) {
      this.dataSource.data = this.products;
      this.scrollToBottom();
    }
  }

  ngOnInit(): void {
  }

  scrollToBottom() {
    try {
      const el = this.listContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
