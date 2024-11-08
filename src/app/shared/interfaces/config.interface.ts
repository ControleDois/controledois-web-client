export interface Config {
  id: string | number;
  company_id: string | number;
  sale_people_default: any;
  sale_category_default: any;
  sale_bank_account_default: any;
  dropbox_client_id?: string;
  dropbox_client_secret?: string;
  dropbox_refresh_token?: string;
  firebase_api_key?: string;
  firebase_auth_domain?: string;
  firebase_project_id?: string;
  firebase_storage_bucket?: string;
  firebase_messaging_sender_id?: string;
  firebase_app_id?: string;
}
