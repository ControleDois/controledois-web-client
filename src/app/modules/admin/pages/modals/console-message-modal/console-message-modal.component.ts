import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-console-message-modal',
  templateUrl: './console-message-modal.component.html',
  styleUrls: ['./console-message-modal.component.scss']
})
export class ConsoleMessageModalComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ConsoleMessageModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
  }

  formatErrorMessage(): string[] {
    return this.data?.message.split(/TAG:/).map((line, index) => index === 0 ? line : 'TAG:' + line) || '';
  }
}
