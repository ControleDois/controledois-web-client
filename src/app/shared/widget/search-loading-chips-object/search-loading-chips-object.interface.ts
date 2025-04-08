import {FormControl} from '@angular/forms';
import {EventEmitter} from '@angular/core';

export interface SearchLoadingChipsObject{
  noTitle: boolean; // Caso não queira mostrar o titulo
  title: string; // Titulo que vai em cima no input
  url: string; // Url da api para buscar os dados
  searchFieldOn: any; // Filtro/Objeto da api já setado
  searchFieldOnCollum: string; // Coluna da tabela que mostrara Filtro/Objeto da api já setado
  sortedBy: string;
  orderBy: string;
  paramsArray: Array<Object>;
  searchField: FormControl;
  validation: boolean;
  required: boolean;
}
