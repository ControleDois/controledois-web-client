import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-media-modal',
  templateUrl: './media-modal.component.html',
  styleUrls: ['./media-modal.component.scss']
})
export class MediaModalComponent implements OnInit {
  public mediaUrl = '';
  public mediaType = 'video';

  constructor(
    public dialogRef: MatDialogRef<MediaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    console.log(this.data);
    this.mediaUrl = this.data.url;
    this.mediaType = this.data.typeSelect;
  }

  close(): void {
    this.dialogRef.close();
  }
}
