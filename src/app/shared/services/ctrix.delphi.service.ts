import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CTrixDelphiService {

  constructor() {}

  generateKey(passedKey: string, date_due: string): string {
    let correctKey = 0;

    for (let i = 0; i < passedKey.length; i++) {
      const charCode = passedKey.charCodeAt(i);
      const position = i + 1; // Delphi começa em 1

      correctKey =
        correctKey +
        charCode * 4 +
        Math.pow(position, 6) * 7 * (position * 100) +
        String(correctKey).length;

      // força overflow para Int32 igual Delphi
      correctKey = (correctKey | 0);
    }

    // Multiplica por 1024
    correctKey = correctKey * 1024;
    correctKey |= 0; // força overflow Int32

    // Inc(CorrectKey, CorrectKey + 86) => soma (CorrectKey + 86)
    correctKey = correctKey + (correctKey + 86);
    correctKey |= 0;

    // Se for zero, substitui pelo valor calculado
    if (correctKey === 0) {
      const firstCharCode = passedKey.charCodeAt(0); // Delphi começa em [1]
      correctKey = 1024 * 512 * firstCharCode;
      correctKey |= 0;
    }

    // Se for negativo, faz "valor absoluto" (mesma lógica Delphi)
    if (correctKey < 0) {
      correctKey = correctKey - (correctKey * 2);
      correctKey |= 0;
    }

    const correctKeyStr = String(correctKey);
    let newKey = '';
    let tempS = '';
    let tempN = 0;

    // 1) Primeiro loop
    for (let i = 0; i < correctKeyStr.length - 1; i++) {
      const ch = correctKeyStr[i];
      const code = ch.charCodeAt(0);
      newKey += String.fromCharCode(0x41 + code).toUpperCase();
    }

    // 2) SetLength(NewKey, 6) -> truncar se maior que 6
    newKey = newKey.substring(0, 6);

    // 3) Concatena "-" + CorrectKey
    newKey += "-" + correctKeyStr;

    // 4) SetLength(NewKey, 11) -> truncar se maior que 11
    newKey = newKey.substring(0, 11);

    // 5) Segundo loop
    for (let i = 0; i < newKey.length; i++) {
      const ch = newKey[i];
      if (ch === "A" || ch === "a") {
        tempS += "Z";
      } else if (ch === "-") {
        tempS += "-";
      } else if (ch >= "0" && ch <= "9") {
        tempS += String.fromCharCode(ch.charCodeAt(0) + 0x15);
      } else {
        tempS += String.fromCharCode(ch.charCodeAt(0) - 1);
      }
    }

    tempS = tempS.toUpperCase();

    // 6) Concatena "-" + TempS
    newKey += "-" + tempS;

    // 7) Soma ord(NewKey[i]) em TempN
    for (let i = 0; i < newKey.length; i++) {
      tempN += newKey.charCodeAt(i);
    }

    // 8) Enquanto Length(IntToStr(TempN)) < 10 faz TempN := TempN * 2
    while (String(tempN).length < 10) {
      tempN *= 2;
    }

    // 9) Concatena "-" + TempN
    newKey += "-" + String(tempN);

    // 10) SetLength(NewKey, 29) -> truncar para no máximo 29 chars
    newKey = newKey.substring(0, 29);

    newKey = newKey + '-' + this.CripData(date_due);

    return newKey;
  }

  CripData(data: string): string {
    // dateStr no formato "DD/MM/YYYY"
    const [dia, mes, ano] = data.split("/");

    // monta anoMes (antes do '#')
    let anoMes = `${dia}/${mes}/${ano}`;

    // 1) soma dia+mes+ano
    let verificador = parseInt(dia, 10) + parseInt(mes, 10) + parseInt(ano, 10);

    // 2) simula "verificador := (verificador) div Length(anoMes)" (div é divisão inteira)
    verificador = Math.trunc(verificador / anoMes.length);

    // 3) calcula mes+dia concatenado e faz a outra divisão inteira como no Delphi
    const mesDia = parseInt(mes + dia, 10); // "1031"
    const diaInt = parseInt(dia, 10);

    const divResult = Math.trunc((verificador + mesDia) / diaInt); // integer div
    verificador = Math.round(divResult - 3.8);

    // 4) monta resultado final igual ao Delphi
    anoMes = `${dia}/${mes}/${ano}#${verificador}`;

    return this.geraProtecao(anoMes);
  }

  geraProtecao(chave: string): string {
    let key = this.criptografa(chave); // já implementada antes

    if (!key || key.length === 0) {
      throw new Error("Licença inválida!!");
    }

    const mapa = {
      '0': '5',
      '1': 'B',
      '2': 'C',
      '3': '2',
      '4': 'X',
      '5': 'E',
      '6': '3',
      '7': 'Z',
      '8': 'G',
      '9': 'H',
      'A': 'I',
      'B': 'V',
      'C': '8',
      'D': '9',
      'E': 'R',
      'F': 'A',
      '&': 'Y',
      '#': 'T',
      '/': 'K'
    };

    let result = "";

    for (let i = 0; i < key.length; i++) {
      const ch = key[i];
      if (mapa[ch] !== undefined) {
        result += mapa[ch];
      } else {
        throw new Error("Licença inválida!!");
      }
    }

    return result;
  }

  // replica o Round do Delphi (ties-to-even)
  delphiRound(x: number): number {
    const floor = Math.floor(x);
    const frac = x - floor;

    // trata o caso exato de .5 (com tolerância)
    if (Math.abs(frac - 0.5) < 1e-12) {
      // devolve o inteiro par mais próximo (ties-to-even)
      return (floor % 2 === 0) ? floor : floor + 1;
    }

    // casos não empates: usa Math.round normal
    return Math.round(x);
  }

  criptografa(chave: string): string {
    const verifica = chave.length;
    // arrays de chars pra simular acesso por índice (Delphi é 1-based)
    const chaveArr = chave.split("");
    const aux = chaveArr.slice();        // cópia do original
    let valoresArr = chaveArr.slice();   // será preenchido / modificado

    // índices 0-based no JS; Delphi usa round(verifica/2) 1-based
    const meioIdx = this.delphiRound(verifica / 2) - 1; // -1 para 0-based
    const ultimoIdx = verifica - 1;

    // primeiras trocas (usando 'aux' como no Delphi)
    valoresArr[meioIdx] = aux[ultimoIdx];
    valoresArr[ultimoIdx] = aux[meioIdx];

    // também modifica 'chave' (parâmetro) da mesma forma que o Delphi faz
    chaveArr[meioIdx] = aux[ultimoIdx];
    chaveArr[ultimoIdx] = aux[meioIdx];

    // finalmente preenche 'valores' com o reverso de 'chave' (modificada)
    for (let i = 0; i < verifica; i++) {
      valoresArr[i] = chaveArr[verifica - 1 - i];
    }

    return valoresArr.join("");
  }
}
