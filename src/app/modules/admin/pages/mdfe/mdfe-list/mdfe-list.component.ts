import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, merge, tap, throwError } from 'rxjs';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { LibraryService } from 'src/app/shared/services/library.service';
import { MdfeService } from 'src/app/shared/services/mdfe.service';
import { WidgetService } from 'src/app/shared/services/widget.service';
import { PageHeader } from '../../../interfaces/page-header.interface';

@Component({
  selector: 'app-mdfe-list',
  templateUrl: './mdfe-list.component.html',
})
export class MdfeListComponent implements OnInit {

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public displayedColumns: string[] = ['number', 'vehicle','uf_origin', 'uf_destination', 'amount', 'value', 'status', 'actions'];
  public dataSource = new MatTableDataSource<any>();
  public tableLength!: number;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  public sort!: MatSort;
  @Output() search = new FormControl('');

  @Output() public pageHeader: PageHeader = {
    title: 'MDF-e',
    description: 'Listagem de MDF-e',
    button: {
      text: 'Nova MDF-e',
      routerLink: '/mdfe/new',
      icon: 'add',
    },
  };

  constructor(
    private mdfeService: MdfeService,
    private widGetService: WidgetService,
    public libraryService: LibraryService
  ) {}

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
    this.mdfeService.index(this.search.value ? this.search.value : '', 'name', 'name', this.paginator?.page ? (this.paginator?.pageIndex + 1).toString() : '1').pipe(
      map(res => {
        this.dataSource.data = res.data;
        this.tableLength = res.meta.total;
      })
    ).subscribe();
  }

  getStatus(element: any): string {
    switch (element.status) {
      case 0:
        return 'Não enviado';
      case 1:
        return 'Processando';
      case 2:
        return 'Pendencias';
      case 3:
        return 'Autorizado';
      case 4:
        return 'cancelado';
      default:
        return 'Não enviado'
    }
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 0:
        return '#B98E00';
      case 1:
        return '#2687E9';
      case 2:
        return '#F45E61';
      case 3:
        return '#4ab858';
      case 4:
        return '#F43E61';
      default:
        return '#B98E00'
    }
  }

  getStatusColorBack(status: number): string {
    switch (status) {
      case 0:
        return '#FFF4CE';
      case 1:
        return '#DBE6FE';
      case 2:
        return '#FCD9E0';
      case 3:
        return '#ddf1de';
      case 4:
        return '#FCD9E0';
      default:
        return '#FFF4CE'
    }
  }

  delete(id: string): void {
    this.widGetService.modalQuestion({
      deleted: true
    }).afterClosed().subscribe(res => {
      if (res === true) {
        this.loadingFull.active = true;
        this.mdfeService.destroy(id).pipe(
          finalize(() => this.loadingFull.active = false),
          catchError((error) => {
            return throwError(error);
          }),
          map(() => {
            this.load();
          })
        ).subscribe();
      }
    });
  }

  getStatusMDFe(id: string): void {
    this.loadingFull.active = true;
    this.mdfeService.getStatus(id).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        return throwError(error);
      }),
      map((res) => {
        if (res?.mensagem_sefaz) {
          this.widGetService.modalQuestion({
            isMessage: true,
            json: res,
            message: res?.mensagem_sefaz,
            message_title: res.status
          });
        }

        this.load();
      })
    ).subscribe();
  }

  openXML(element: any): void {
    window.open(element.url_xml, '_blank');
  }

  openPDF(element: any): void {
    //abrir link
    window.open(element.url_damdfe, '_blank');
  }

  sendMDfe(id: string): void {
    this.loadingFull.active = true;
    this.mdfeService.sendMdfe(id).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        return throwError(error);
      }),
      map(() => {
        this.load();
      })
    ).subscribe();
  }

  cancelMDfe(id: string): void {
    this.loadingFull.active = true;
    this.mdfeService.cancelMdfe(id).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        return throwError(error);
      }),
      map(() => {
        this.load();
      })
    ).subscribe();

  }
}
