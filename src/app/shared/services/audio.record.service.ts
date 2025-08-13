// audio-recorder.service.ts
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AudioRecorderService {
  private mediaRecorder!: MediaRecorder;
  private audioChunks: Blob[] = [];

  constructor(
    private apiService: ApiService
  ) {}

  async startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioChunks = [];

    // Força gravação no formato OGG Opus para nota de voz
    this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start();
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm;codecs=opus' });
        resolve(audioBlob);
      };
      this.mediaRecorder.stop();
    });
  }

  sendAudioToApi(audioBlob: Blob, dialogId: string) {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm'); // envia como arquivo

    return this.apiService.on(`dialog/${dialogId}/send-audio`, '', 'post-token-no-company-formdata', undefined, formData);
  }
}
