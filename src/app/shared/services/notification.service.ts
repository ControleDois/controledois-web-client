import { Injectable } from '@angular/core';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private snackBar: MatSnackBar
  ) {
  }

  config: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'center',
    verticalPosition: 'bottom'
  };

  success(msg: string): void {
    this.config['panelClass'] = ['notification', 'success'];
    this.snackBar.open('😊 ' + msg, '', this.config);
  }

  warn(msg: string): void {
    this.config['panelClass'] = ['notification', 'warn'];
    this.snackBar.open('🤔 ' + msg, '', this.config);
  }

  error(msg: string): void {
    this.config['panelClass'] = ['notification', 'error'];
    this.snackBar.open('😵 ' + msg, '', this.config);
  }
}
