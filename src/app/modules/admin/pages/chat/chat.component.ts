import { Component, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DialogService } from 'src/app/shared/services/dialog.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  public dialogs: any[] = [];
  public dialogSelected: any;

  @Output() search = new FormControl('');

  constructor(
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.load();
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
    this.dialogService.show(id).subscribe((response) => {
      this.dialogSelected = response;
    });
  }
}
