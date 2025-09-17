import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class InternetService {
  async hasGoodConnection(test: boolean): Promise<boolean> {
    if (!test){
      return false
    }

    try {
      const start = performance.now();
      await fetch('https://google.com.br', { method: 'HEAD', cache: 'no-cache', mode: 'no-cors' });
      const latency = performance.now() - start;
      return latency <= 3000; // Considera boa conexão se a latência for menor que 200ms
    } catch {
      return false; // Sem internet ou conexão ruim
    }
  }
}
