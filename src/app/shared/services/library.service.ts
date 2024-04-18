import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LibraryService {

  constructor() {
  }

  getMaxString(str: any, size: any): string {
    if (str === null) {
      return str;
    }

    if (
      str === undefined ||
      str === 'undefined' ||
      str === '' ||
      size === undefined ||
      size === 'undefined' ||
      size === ''
    ) {
      return str;
    }

    let shortText = str;
    if (str.length >= size + 3) {
      shortText = str.substring(0, size).concat('...');
    }
    return shortText;
  }

  getFormatData(isDate: any, hourMinute = false): string {

    if (hourMinute) {
      const data = new Date(isDate);
      return (
        (data.getDate() <= 9 ? '0' + data.getDate() : data.getDate()) +
        '/' +
        (data.getMonth() + 1 <= 9
          ? '0' + (data.getMonth() + 1)
          : data.getMonth() + 1) +
        '/' +
        data.getFullYear() +
        ' ' +
        (data.getHours() <= 9 ? '0' + data.getHours() : data.getHours()) +
        ':' +
        (data.getMinutes() <= 9 ? '0' + data.getMinutes() : data.getMinutes())
      );
    } else {
      const data = isDate.substring(0, 10).split('-');
      return data[2] + '/' + data[1] + '/' + data[0];
    }
  }

  getFormatSOData(data: string): string {
    if (!data) {
      return '';
    }

    const vData = data.substring(0, 10).replace(/\D+/g, '');
    return (
      vData.substring(6, 8) + vData.substring(4, 6) + vData.substring(0, 4)
    );
  }

  getFormatEs(data: string): Date {
    const vData = data.substring(0, 10).replace(/\D+/g, '');
    return new Date(vData.substring(4, 8) + '-' + vData.substring(2, 4) + '-' + vData.substring(0, 2) + 'T12:00:00Z');
  }

  calcularParcelas(parcelas: any, stringData: any): any {
    const ano = stringData.substring(0, 4);
    const mes = stringData.substring(5, 7);
    let dia = stringData.substring(8, 10);

    if (dia === '29' && this.leapYear(ano)) {
      dia = '28';
    }

    const dataInicial = new Date(ano, mes, dia);
    const dataParcela = new Date();
    let resultado: string = '';
    let novoMes = 0;
    let novoAno = 0;

    const resultados: string[] = [];
    for (let p = 0; p < parcelas; p++) {
      novoMes = (dataInicial.getMonth() + p) % 12;
      novoMes = novoMes === 0 ? 0 : novoMes;
      novoAno = dataInicial.getFullYear() + (((dataInicial.getMonth() + p) - novoMes) / 12);

      dataParcela.setDate(dia);
      dataParcela.setMonth(novoMes);
      dataParcela.setFullYear(novoAno);

      resultado = this.correcaoDia(dataParcela.getDate());
      resultado += '/';
      resultado += this.correcaoMes(dataParcela.getMonth() + 1);
      resultado += '/';
      resultado += dataParcela.getFullYear();

      resultados.push(resultado);
    }

    return resultados;
  }

  correcaoDia(dia: any): any {
    if (isNaN(dia)) {
      return false;
    }

    return dia < 10 ? '0' + dia : dia;
  }

  correcaoMes(mes: any): any {
    if (isNaN(mes)) {
      return false;
    }

    return mes < 10 ? '0' + mes : mes;
  }


  leapYear(year: any): any {
    return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
  }

  removeSpecialCaracters(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/([^\w]+|\s+)/g, '-') // Substitui espaço e outros caracteres por hífen
      .replace(/\-\-+/g, '-') // Substitui multiplos hífens por um único hífen
      .replace(/(^-+|-+$)/, '')
      .toLowerCase(); // Remove hífens extras do final ou do inicio da string
  }
}
