import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, Subscription } from 'rxjs';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';
import { AudioRecorderService } from 'src/app/shared/services/audio.record.service';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { DropboxService } from 'src/app/shared/services/dropbox.service';
import { LibraryService } from 'src/app/shared/services/library.service';
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
  public dialogsAttending: any[] = [];
  public dialogSelected: any;
  public selectedTab: number = 0 // 0: Aguardando, 1: Atendimento, 2: Grupos;
  public QtdDialogsWaiting: number = 0;
  public QtdDialogsAttending: number = 0;
  public QtdDialogsGroups: number = 0;

  @Output() search = new FormControl('');

  private messageSubscription!: Subscription;
  public scrollHeight: number = 0;

  @ViewChild('messageInput', {static: false}) messageInput!: ElementRef<HTMLInputElement>;

  public audio: HTMLAudioElement | null = null;

  $player?: HTMLAudioElement;

  public isRecording = false;

  @ViewChild('notification') set playerRef(ref: ElementRef<HTMLAudioElement>) {
    this.$player = ref.nativeElement;
  }

  constructor(
    private dialogService: DialogService,
    private ws: WebsocketService,
    private datePipe: DatePipe,
    private dropboxService: DropboxService,
    private cdr: ChangeDetectorRef,
    public libraryService: LibraryService,
    private audioService: AudioRecorderService
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
        const dialogIndex = this.dialogs.findIndex(dialog => dialog.id === response.data.dialog.id);
        if (dialogIndex === -1 && response.data.dialog.status === 0) {
          // Se não existir, adiciona o novo diálogo
          this.dialogs.push({
            ...response.data.dialog,
            messages: [response.data.message]
          });
        } else if (dialogIndex >= 0 && response.data.dialog.status === 0) {
          //se existir e status for 0 adiciona
          this.dialogs[dialogIndex].messages.push(response.data.message)

          //Necessário fazer som de notificação

          //Ativa notificação
          this.notification(response.data);
        }

        // Verifica se o diálogo está na lista de atendimentos
        const attendingIndex = this.dialogsAttending.findIndex(dialog => dialog.id === response.data.dialog.id);
        if (attendingIndex === -1 && response.data.dialog.status === 1) {
          // Se não existir, adiciona o novo diálogo
          this.dialogsAttending.push({
            ...response.data.dialog,
            messages: [response.data.message]
          });
        } else if (attendingIndex >= 0 && response.data.dialog.status === 1) {
          //se existir e status for 1 adiciona
          this.dialogsAttending[attendingIndex].messages.push(response.data.message)

          //Necessário fazer som de notificação

          //Ativa notificação
          this.notification(response.data);
        }

        if (this.dialogSelected && this.dialogSelected.id === response.data.dialog.id) {
          this.dialogSelected.messages.push(response.data.message);
          this.scroll();
        }

        this.dialogs.sort((a, b) => {
          const lastMessageA = a.messages[a.messages.length - 1]?.created_at ?? '';
          const lastMessageB = b.messages[b.messages.length - 1]?.created_at ?? '';
          return new Date(lastMessageB).getTime() - new Date(lastMessageA).getTime();
        });

        this.dialogsAttending.sort((a, b) => {
          const lastMessageA = a.messages[a.messages.length - 1]?.created_at ?? '';
          const lastMessageB = b.messages[b.messages.length - 1]?.created_at ?? '';
          return new Date(lastMessageB).getTime() - new Date(lastMessageA).getTime();
        });

        this.sumDialogsCount();
      }

      if (response && response.type === 'whatsapp-ack') {
        if (this.dialogSelected && this.dialogSelected.id === response.data.dialog.id) {
          // Atualiza o status da mensagem no diálogo selecionado
          this.dialogSelected.messages = this.dialogSelected.messages.map(msg => {
            if (msg.id === response.data.message.id) {
              return {
                ...msg,
                status: response.data.message.status
              };
            }
            return msg;
          });
        }
      }

      if (response && response.type === 'dialog-start') {
        // Atualiza o status do diálogo selecionado
        if (this.dialogSelected && this.dialogSelected.id === response.data.id) {
          //Nada a fazer no momento
        }

        // Remove o diálogo da lista de aguardando e adiciona na lista de atendendo
        this.dialogs = this.dialogs.filter(dialog => dialog.id !== response.data.id);

        //Verificar se o diálogo já está na lista de atendimentos
        const attendingIndex = this.dialogsAttending.findIndex(dialog => dialog.id === response.data.id);
        if (attendingIndex === -1) {
          this.dialogSelected = {
            ...response.data.dialog,
            messages: [response.data.message]
          };
        }
        this.sumDialogsCount();
      }
    });
  }

  sumDialogsCount(): void {
    this.QtdDialogsWaiting = this.dialogs.length;
    this.QtdDialogsAttending = this.dialogsAttending.length;
    this.QtdDialogsGroups = 0; // Grupos não implementados
  }

  load(): void {
    this.dialogService.index(this.search.value ? this.search.value : '',
      'name', 'name', '1', '100', [
        { param: 'status', value: '0' }
      ]).subscribe((response) => {
        this.dialogs = response.data;
        this.dialogs.sort((a, b) => {
          const lastMessageA = a.messages[a.messages.length - 1]?.created_at ?? '';
          const lastMessageB = b.messages[b.messages.length - 1]?.created_at ?? '';
          return new Date(lastMessageB).getTime() - new Date(lastMessageA).getTime();
        });
        this.sumDialogsCount();
      });

    this.dialogService.index(this.search.value ? this.search.value : '',
      'name', 'name', '1', '100', [
        { param: 'status', value: '1' }
      ]).subscribe((response) => {
        this.dialogsAttending = response.data;
        this.dialogsAttending.sort((a, b) => {
          const lastMessageA = a.messages[a.messages.length - 1]?.created_at ?? '';
          const lastMessageB = b.messages[b.messages.length - 1]?.created_at ?? '';
          return new Date(lastMessageB).getTime() - new Date(lastMessageA).getTime();
        });
        this.sumDialogsCount();
      });

  }

  getSelectedTabClass(): any[] {
    switch (this.selectedTab) {
      case 0: return this.dialogs;
      case 1: return this.dialogsAttending;
      case 2: return []; // Grupos não implementados
      default: return this.dialogs
    }
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
    this.cdr.detectChanges();

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
      //remove dialog from waiting list and add to attending list
      this.dialogs = this.dialogs.filter(dialog => dialog.id !== this.dialogSelected.id);
      this.dialogSelected.status = 1;
      this.dialogsAttending.push(this.dialogSelected);
      this.scroll();
      this.loadingFull.active = false;
      this.sumDialogsCount();
    });
  }

  desconsiderDialog(): void {
    this.loadingFull.active = true;
    this.dialogService.disconsiderDialog(this.dialogSelected.id).subscribe((response) => {
      if (response){
        //Remover dialogo da lista de aguardando atendimento
        this.dialogs = this.dialogs.filter(dialog => dialog.id !== this.dialogSelected.id);
        this.dialogSelected = null; // Limpa o diálogo selecionado
        this.sumDialogsCount();
      }

      this.loadingFull.active = false;
    });
  }

  closeDialog(): void {
    this.loadingFull.active = true;
    this.dialogService.closeDialog(this.dialogSelected.id).subscribe((response) => {
      if (response){
        //Remover dialogo da lista de aguardando atendimento
        this.dialogsAttending = this.dialogsAttending.filter(dialog => dialog.id !== this.dialogSelected.id);
        this.dialogSelected = null; // Limpa o diálogo selecionado
        this.sumDialogsCount();
      }

      this.loadingFull.active = false;
    });
  }

  getStartedUser(): any {
    const user = this.dialogSelected.users.find(user => user.roles && user.roles.includes(0));
    return user ? user : null;
  }

  updateDate(date) {
    return this.datePipe.transform(date, 'HH:mm (dd/MM/yyyy)');
  }

  getLinkPath(message: any) {
    if (!message.file_url) {
      return;
    }

    if (message?.temporaryLink) {
      this.playAudio(message.temporaryLink);
      return;
    }

    this.dropboxService.getTemporaryLink(message.file_url).subscribe({
      next: (response: any) => {
        this.dialogSelected.messages = this.dialogSelected.messages.map(msg => {
          if (msg.id === message.id) {
            if (msg.type == 2 ) {
              this.playAudio(response.link);
            }
            return {
              ...msg,
              temporaryLink: response.link,
            };
          }
          return msg;
        });
      },
      error: (error) => {
        console.error('Erro ao mostrar:', error)
      },
    });
  }

  playAudio(url: string): void {
    // Criar o elemento de áudio
    this.audio = new Audio(url);
    this.audio.load();

    // Quando estiver carregado, toca
    this.audio.addEventListener('canplaythrough', () => {
      this.audio?.play();
    });

    // Tratar erros
    this.audio.addEventListener('error', () => {
      console.error('Erro ao carregar o áudio');
      alert('Erro ao carregar o áudio.');
    });
  }

  show_live_preview(text) {
    if (!text) {
      return text;
    }

    var format = text;
    format = this.whatsappStyles(format, '_', '<i>', '</i>');
    format = this.whatsappStyles(format, '*', '<b>', '</b>');
    format = this.whatsappStyles(format, '~', '<s>', '</s>');
    format = format.replace(/\n/gi, '<br>');

    return format;
  }

  whatsappStyles(format, wildcard, opTag, clTag) {
    var indices: number[] = [];
    for (var i = 0; i < format.length; i++) {
      if (format[i] === wildcard) {
        if (indices.length % 2) {
          format[i - 1] == ' '
            ? null
            : typeof format[i + 1] == 'undefined'
            ? indices.push(i)
            : this.is_aplhanumeric(format[i + 1])
              ? null
              : indices.push(i);
        } else {
          typeof format[i + 1] == 'undefined'
            ? null
            : format[i + 1] == ' '
            ? null
            : typeof format[i - 1] == 'undefined'
              ? indices.push(i)
              : this.is_aplhanumeric(format[i - 1])
                ? null
                : indices.push(i);
        }
      } else {
        format[i].charCodeAt() == 10 && indices.length % 2
          ? indices.pop()
          : null;
      }
    }
    indices.length % 2 ? indices.pop() : null;
    var e = 0;
    indices.forEach(function(v: any, i: any) {
      var t = i % 2 ? clTag : opTag;
      v += e;
      format = format.substr(0, v) + t + format.substr(v + 1);
      e += t.length - 1;
    });

    return format;
  }

  is_aplhanumeric(c) {
    var x = c.charCodeAt();
    return (x >= 65 && x <= 90) || (x >= 97 && x <= 122) || (x >= 48 && x <= 57)
      ? true
      : false;
  }

  getStatusIconMessage(status) {
    switch (status) {
      case 0:
        return 'timer';
      case 1:
        return 'done';
      case 2:
        return 'done_all';
      case 3:
        return 'done_all';
      default:
        return 'error';
    }
  }

  getLastInteration(dialog: any): any {
    if (dialog && dialog.messages.length > 0) {
      // Ordena as mensagens pelo campo "code"
      const sortedMessages = [...dialog.messages].sort((a, b) => a.code - b.code);

      // Pega a última mensagem com maior "code"
      const message = sortedMessages[sortedMessages.length - 1];

      // Se o dialogo for de grupo
      if (dialog.contact.is_group) {
        const contactName = message.contact
          ? message.contact.name
          : message.user
          ? message.user.name
          : "Bot";

        return {
          last_date: `${this.updateDate(message.created_at)}`,
          last_body: `${contactName}: ${this.libraryService.getMaxString(message.body, 32)}`,
          last_type: message.type
        };
      } else {
        return {
          last_date: `${this.updateDate(message.created_at)}`,
          last_body: this.libraryService.getMaxString(message.body, 32),
          last_type: message.type
        };
      }
    } else {
      return {
        last_date: `Sem mensagens`,
        last_body: `Nenhuma mensagem enviada ainda.`,
        last_type: 1
      };
    }
  }

  getUnreadCount(dialog: any): number {
    if (!dialog || !dialog.messages || dialog.messages.length === 0) {
      return 0;
    }

    let count = 0;

    // Percorre de trás para frente
    for (let i = dialog.messages.length - 1; i >= 0; i--) {
      const message = dialog.messages[i];

      if (message.from_me) {
        // Parou no primeiro envio seu
        break;
      }

      count++;
    }

    return count;
  }

  notification(notification: any): void {
    let body = notification.message.body;
    if (notification.message.type !== 0) {
      body = 'Enviou um documento';
    }

    if ((this.dialogSelected && this.dialogSelected.id !== notification.dialog.id) || !this.dialogSelected) {
      if (Notification.permission !== 'granted') {
        Notification.requestPermission();
      } else {
        var notif = new Notification(notification.message?.contact?.name || '', {
          icon: notification.message?.contact?.file_url || '',
          body,
        });
        notif.onclick = () => {
          window.focus();
          setTimeout(() => {
            this.showDialog(notification.dialog.id);
          }, 500);
        };
      }

      if (this.$player) {
        this.$player.currentTime = 0.1;
        this.$player.play();
      }
    }
  }

  async start() {
    this.isRecording = true;
    await this.audioService.startRecording();
  }

  async stopAndSend() {
    this.isRecording = false;
    const audioBlob = await this.audioService.stopRecording();

    this.audioService.sendAudioToApi(audioBlob, this.dialogSelected.id).subscribe({
      next: (res) => console.log('✅ Áudio enviado:', res),
      error: (err) => console.error('❌ Erro ao enviar áudio:', err)
    });
  }
}
