import { Component, OnInit, Output } from '@angular/core';
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
        if (this.dialogSelected && this.dialogSelected.id === response.data.dialog_id) {
          this.dialogSelected.messages.push(response.data);
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
    this.loadingFull.active = true;
    this.dialogService.show(id).subscribe((response) => {
      this.dialogSelected = response;

      //precisar de um timeout para o scroll funcionar
      setTimeout(() => {
        this.scroll();
      }, 100);

      this.loadingFull.active = false;
    });
  }

  scroll() {
    const objScrDiv = document.getElementById('messageScroll');
    if (objScrDiv && objScrDiv.scrollHeight > this.scrollHeight) {
      objScrDiv.scrollTop = objScrDiv.scrollHeight + 200;
      this.scrollHeight = objScrDiv.scrollHeight;
    }
  }
}
