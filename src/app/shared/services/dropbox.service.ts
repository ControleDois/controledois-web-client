import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { DropboxFile } from '../interfaces/dropbox.interface';

@Injectable({
  providedIn: 'root',
})
export class DropboxService {
  private readonly dropboxApiUrl =
    'https://api.dropboxapi.com/2/files/list_folder';
  private readonly dropboxTokenUrl = 'https://api.dropboxapi.com/oauth2/token';
  private readonly clientId = 'midwt55zj3ngec7';
  private readonly clientSecret = 'x0ykm02s6ouhz6n';
  private readonly refreshToken =
    'yRQFUtlIrDEAAAAAAAAAAdbB4ZKfN6UC9E-ivoFz-QB9Apryyj5irpuIMlwzNzsJ';

  constructor(private http: HttpClient) {}

  private getAccessToken(): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: this.refreshToken,
    });

    return this.http
      .post<any>(this.dropboxTokenUrl, body.toString(), { headers })
      .pipe(
        catchError((error) =>
          throwError(() => new Error('Error obtaining access token: ' + error))
        ),
        map((response) => response.access_token)
      );
  }

  private createAuthHeaders(accessToken: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });
  }

  private listFiles(completePath: string): Observable<DropboxFile[]> {
    return this.getAccessToken().pipe(
      switchMap((accessToken) => {
        const headers = this.createAuthHeaders(accessToken);
        const body = {
          path: completePath,
          recursive: false,
          include_media_info: false,
          include_deleted: false,
          include_has_explicit_shared_members: false,
        };

        return this.http
          .post<{ entries: DropboxFile[] }>(this.dropboxApiUrl, body, {
            headers,
          })
          .pipe(
            map((response) => response.entries),
            catchError((error) =>
              throwError(() => new Error('Error listing folder: ' + error))
            )
          );
      })
    );
  }

  listFolder(path: string): Observable<DropboxFile[]> {
    const fullPath = `/CTrix/Backups/${path}`;
    return this.listFiles(fullPath);
  }

  listNfe(path: string): Observable<DropboxFile[]> {
    const currentYear = new Date().getFullYear();
    const fullPath = `/CTrix/XMLS/${path}/NFE/${currentYear}`;
    return this.listFiles(fullPath);
  }

  listNfce(path: string): Observable<DropboxFile[]> {
    const currentYear = new Date().getFullYear();
    const fullPath = `/CTrix/XMLS/${path}/NFCE/${currentYear}`;
    return this.listFiles(fullPath);
  }

  downloadFile(path: string): Observable<Blob> {
    return this.getAccessToken().pipe(
      switchMap((accessToken) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${accessToken}`,
          'Dropbox-API-Arg': JSON.stringify({ path }),
        });

        return this.http
          .post('https://content.dropboxapi.com/2/files/download', null, {
            headers,
            responseType: 'blob',
          })
          .pipe(
            catchError((error) =>
              throwError(() => new Error('Error downloading file: ' + error))
            )
          );
      })
    );
  }
}
