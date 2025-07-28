import { Component, ElementRef, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, Subscription } from 'rxjs';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { WebsocketService } from 'src/app/shared/services/websocket.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }

  public dialogs: any[] = [];
  public dialogSelected: any;

  @Output() search = new FormControl('');

  private messageSubscription!: Subscription;
  public scrollHeight: number = 0;

  @ViewChild('messageInput', {static: false}) messageInput!: ElementRef<HTMLInputElement>;

  constructor(
    private dialogService: DialogService,
    private ws: WebsocketService,
  ) { }

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

    // Inscreve-se para receber mensagens
    this.messageSubscription = this.ws.getMessage().subscribe((response) => {
      if (response && response.type === 'whatsapp-message') {
        //Verifica se o dialog existe nos dialogs
        const dialogIndex = this.dialogs.findIndex(dialog => dialog.id === response.data.dialog_id);
        if (dialogIndex === -1) {
          // Se não existir, adiciona o novo diálogo
          this.dialogs.push({
            ...response.data.dialog,
            messages: [response.data.message]
          });
        }

        if (this.dialogSelected && this.dialogSelected.id === response.data.message.dialog_id) {
          this.dialogSelected.messages.push(response.data.message);
          this.scroll();
        }
      }
    });
  }

  load(): void {
    this.dialogService.index(this.search.value ? this.search.value : '',
      'name', 'name', '1', '100', [
        { param: 'status', value: '0' }
      ]).subscribe((response) => {
        console.log(response.data);
        this.dialogs = response.data;
      });
  }

  maxBodyMessage(body: string, max: number): string {
    return body.length > max ? body.substring(0, max) + '...' : body;
  }

  showDialog(id: string): void {
    //Se o dialog já estiver selecionado, não faz nada
    if (this.dialogSelected && this.dialogSelected.id === id) {
      return;
    }

    this.loadingFull.active = true;
    this.dialogService.show(id).subscribe((response) => {
      this.dialogSelected = response;
      this.scroll();
      this.loadingFull.active = false;
    });
  }

  scroll() {
    setTimeout(() => {
      const objScrDiv = document.getElementById('messageScroll');
      if (objScrDiv && objScrDiv.scrollHeight > this.scrollHeight) {
        objScrDiv.scrollTop = objScrDiv.scrollHeight + 200;
        this.scrollHeight = objScrDiv.scrollHeight;
      }
    }, 100);
  }

  sendMessage(): void {
    const message = this.messageInput.nativeElement.value.trim();
    this.messageInput.nativeElement.value = '';

    if (message.trim() === '') {
      return;
    }

    this.dialogService.sendMessage(this.dialogSelected.id, { body: message }).subscribe((response) => {
      if (response && response.data) {
        console.log('Mensagem enviada:', response.data);
      }
    });
  }

  startDialog(): void {
    this.loadingFull.active = true;
    this.dialogService.startDialog(this.dialogSelected.id).subscribe((response) => {
      console.log('Dialog started:', response);
      this.dialogSelected.status = 1; // Atualiza o status do diálogo para iniciado
      this.scroll();
      this.loadingFull.active = false;
    });
  }

  desconsiderDialog(): void {
    this.loadingFull.active = true;
    this.dialogService.disconsiderDialog(this.dialogSelected.id).subscribe((response) => {
      if (response){
        //Remover dialogo da lista de aguardando atendimento
        this.dialogs = this.dialogs.filter(dialog => dialog.id !== this.dialogSelected.id);
        this.dialogSelected = null; // Limpa o diálogo selecionado
      }

      this.loadingFull.active = false;
    });
  }
}
