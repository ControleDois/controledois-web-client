import { DatePipe } from '@angular/common';
import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, distinctUntilChanged, map, merge, tap } from 'rxjs';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { LibraryService } from 'src/app/shared/services/library.service';
import { NfeManifestService } from 'src/app/shared/services/nfe-manifest.service';
import { WidgetService } from 'src/app/shared/services/widget.service';
import { PageHeader } from '../../../interfaces/page-header.interface';

@Component({
  selector: 'app-nfe-manifest-list',
  templateUrl: './nfe-manifest-list.component.html',
})
export class NfeManifestListComponent implements OnInit {
  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public vDateFilter = new Date();
  public displayedColumns: string[] = ['fornecedor', 'emissao', 'situacao', 'valor', 'actions'];
  public dataSource = new MatTableDataSource<any>();
  public tableLength!: number;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  public sort!: MatSort;
  @Output() search = new FormControl('');

  @Output() public pageHeader: PageHeader = {
    title: 'Lista de Manifestos de NFe',
    description: 'Visualize e gerencie os manifestos de NFe',
  };

  constructor(
    private nfeManifestService: NfeManifestService,
    private widGetService: WidgetService,
    private datePipe: DatePipe,
    public libraryService: LibraryService
  ) {
   }

  ngOnInit(): void {
    this.search.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        map(() => {
          this.load();
        })
      )
      .subscribe();

    this.load();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.load()))
      .subscribe();
  }

  load(): void {
    this.nfeManifestService.index(this.search.value ? this.search.value : '',
      this.datePipe.transform(this.vDateFilter, 'yyyy-MM-dd'), 'date_sale', 'date_sale',
      this.paginator?.page ? (this.paginator?.pageIndex + 1).toString() : '1',
      this.paginator?.pageSize ? (this.paginator?.pageSize).toString() : '10').pipe(
      map(res => {
        this.dataSource.data = res.data;
        this.tableLength = res.meta.total;
      })
    ).subscribe();
  }

  getStatus(element: any): string {
    switch (element.situacao) {
      case 1:
        return 'Sem Manifesto';
      case 2:
        return 'Ciência';
      case 3:
        return 'Confirmação';
      case 4:
        return 'Desconhecimento';
      case 5:
        return 'Não Realizada';
      default:
        return 'Sem status';
    }
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 1:
        return '#B98E00';
      case 2:
        return '#2687E9';
      case 3:
        return '#4ab858';
      case 4:
        return '#F43E88';
      case 5:
        return '#F43E61';
      default:
        return '#ddd'
    }
  }

  getStatusColorBack(status: number): string {
    switch (status) {
      case 1:
        return '#FFF4CE';
      case 2:
        return '#DBE6FE';
      case 3:
        return '#ddf1de';
      case 4:
        return '#FCD9E0';
      case 5:
        return '#FCD9E0';
      default:
        return '#DBE6FE'
    }
  }
}
