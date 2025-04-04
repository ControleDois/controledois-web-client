import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: Socket;
  private messageSubject = new BehaviorSubject<any>(null); // Cria um observable

  constructor() {
    this.socket = io(environment.ws, {
      transports: ['websocket'], // Força uso de WebSocket
    });

    this.socket.on('connect', () => {
      console.log('Conectado ao WebSocket:', this.socket.id);
    });

    this.socket.on('message', (data) => {
      console.log('Nova mensagem recebida:', data);
      this.messageSubject.next(data);
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado do WebSocket');
    });
  }

  sendMessage(data: any) {
    this.socket.emit('message', data);
  }

  // Método para componentes ouvirem as mensagens
  getMessage() {
    return this.messageSubject.asObservable();
  }
}
