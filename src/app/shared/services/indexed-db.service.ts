import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';

@Injectable({
  providedIn: 'root'
})
export class IndexedDbService {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = openDB('controledois_web_pdv', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('people')) {
          const peopleStore = db.createObjectStore('people', { keyPath: 'id', autoIncrement: true });

          peopleStore.createIndex('name', 'name', { unique: false });
          peopleStore.createIndex('document', 'document', { unique: false });
          peopleStore.createIndex('social_name', 'social_name', { unique: false });
          peopleStore.createIndex('city', 'address.city', { unique: false });
          peopleStore.createIndex('state', 'address.state', { unique: false });
        }
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });

          productStore.createIndex('name', 'name', { unique: false });
        }
        if (!db.objectStoreNames.contains('sales')) {
          const saleStore = db.createObjectStore('sales', { keyPath: 'id', autoIncrement: true });

          saleStore.createIndex('code', 'code', { unique: false });
          saleStore.createIndex('date_sale', 'date_sale', { unique: false });
          saleStore.createIndex('name', 'people.name', { unique: false });
          saleStore.createIndex('document', 'people.document', { unique: false });
          saleStore.createIndex('social_name', 'people.social_name', { unique: false });
        }
        if (!db.objectStoreNames.contains('terminal')) {
          db.createObjectStore('terminal', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('nfes')) {
          db.createObjectStore('nfes', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }

  async addData(data: any, storeName: string) {
    const db = await this.dbPromise;
    return db.transaction(storeName, 'readwrite').objectStore(storeName).add(data);
  }

  async getData(id: string, storeName: string): Promise<any | undefined> {
    const db = await this.dbPromise;
    return db.transaction(storeName).objectStore(storeName).get(id);
  }

  async updateData(data: any, storeName: string) {
    const db = await this.dbPromise;
    return db.transaction(storeName, 'readwrite').objectStore(storeName).put(data);
  }

  async getAllData(storeName: string): Promise<any[]> {
    const db = await this.dbPromise;
    return db.transaction(storeName).objectStore(storeName).getAll();
  }

  async deleteData(id: number, storeName: string) {
    const db = await this.dbPromise;
    return db.transaction(storeName, 'readwrite').objectStore(storeName).delete(id);
  }

  async clearData(storeName: string) {
    const db = await this.dbPromise;
    return db.transaction(storeName, 'readwrite').objectStore(storeName).clear();
  }

  async batchInsert(dataArray: any[], storeName: string, batchSize: number): Promise<void> {
    const db = await this.dbPromise;

    // Divide os dados em lotes de batchSize
    for (let i = 0; i < dataArray.length; i += batchSize) {
      const batch = dataArray.slice(i, i + batchSize);

      // Inicia a transação
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      // Processa cada dado no lote
      const promises = batch.map(async (data) => {
        try {
          // Usa 'put' para evitar conflito de chaves duplicadas
          await store.put(data);
        } catch (err) {
          console.warn(`Erro ao adicionar/atualizar o item com id ${data.id}:`, err);
        }
      });

      // Aguarda todas as operações do lote antes de passar para o próximo
      await Promise.all(promises);

      // Aguarda a finalização da transação
      await tx.done;
    }
  }

  getCountStore(storeName: string): Promise<number> {
    return this.getAllData(storeName).then(data => data.length);
  }

  async filterPeopleByText(searchText: string): Promise<any[]> {
    const db = await this.dbPromise;
    const transaction = db.transaction('people', 'readonly');
    const store = transaction.objectStore('people');

    const allPeople = await store.getAll();

    // Filtrar os dados pelos campos name, document, social_name, city e state
    const filteredPeople = allPeople.filter(person => {
      const nameMatch = person.name?.toLowerCase().includes(searchText.toLowerCase());
      const documentMatch = person.document?.toLowerCase().includes(searchText.toLowerCase());
      const socialNameMatch = person.social_name?.toLowerCase().includes(searchText.toLowerCase());

      const cityMatch = person.address?.city?.toLowerCase().includes(searchText.toLowerCase());
      const stateMatch = person.address?.state?.toLowerCase().includes(searchText.toLowerCase());

      return nameMatch || documentMatch || socialNameMatch || cityMatch || stateMatch;
    });

    return filteredPeople;
  }

  async filterProductBy(searchText: string): Promise<any[]> {
    const db = await this.dbPromise;
    const transaction = db.transaction('products', 'readonly');
    const store = transaction.objectStore('products');

    const allProducts = await store.getAll();
    let product = null;
    product = allProducts.find(p => {
      return p.code == searchText;
    });

    if (!product) {
      product = allProducts.find(p => {
        return p.barcode?.toLowerCase() === searchText.toLowerCase();
      });
    }

    if (!product) {
      // Aqui pode retornar vários
      return allProducts.filter(product =>
        product.name?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return product ? [product] : [];
  }

  async filterSaleByText(
    searchText: string,
    startDate: Date
  ): Promise<any[]> {
    const db = await this.dbPromise;
    const transaction = db.transaction('sales', 'readonly');
    const store = transaction.objectStore('sales');

    const allSales = await store.getAll();

    // Calcular o primeiro e o último dia do mês da data de início
    const firstDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const lastDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59);

    // Filtrar os dados pelos campos name, document, social_name
    const filteredSales = allSales.filter(sale => {
      const nameMatch = sale?.people?.name?.toLowerCase().includes(searchText.toLowerCase());
      const documentMatch = sale?.people?.document?.toLowerCase().includes(searchText.toLowerCase());
      const socialNameMatch = sale?.people?.social_name?.toLowerCase().includes(searchText.toLowerCase());

      // Converter a data de venda corretamente
      const dateSale = new Date(sale.date_sale);
      if (isNaN(dateSale.getTime())) {
        console.warn('Data inválida encontrada:', sale.date_sale);
        return false; // Ignora datas inválidas
      }

      const dateInRange = dateSale >= firstDayOfMonth && dateSale <= lastDayOfMonth;

      if (!sale?.people) {
        return dateInRange
      } else {
        return (nameMatch || documentMatch || socialNameMatch) && dateInRange;
      }
    });

    return filteredSales;
  }

  async deleteDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase('controledois_web_pdv');

      request.onsuccess = () => {
        console.log(`Banco de dados controledois_web_pdv deletado com sucesso.`);
        resolve();
      };

      request.onerror = (event) => {
        console.error(`Erro ao deletar o banco de dados controledois_web_pdv:`, event);
        reject(event);
      };

      request.onblocked = () => {
        console.warn(`A exclusão do banco de dados controledois_web_pdv foi bloqueada.`);
      };
    });
  }
}
