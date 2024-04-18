import * as CryptoJS from 'crypto-js';

export class EncryptService {

  private static key = '6201de23c7ceb366b024d639ec160438de89ccc1';

  public static encrypt(value: string): string {
    return CryptoJS.AES.encrypt(value, EncryptService.key).toString();
  }

  public static decrypt(value: string): string {
    return CryptoJS.AES.decrypt(value, EncryptService.key).toString(CryptoJS.enc.Utf8);
  }
}
