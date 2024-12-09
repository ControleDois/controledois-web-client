export interface PageHeader {
  title: string;
  description?: string;
  button: {
    text: string;
    routerLink: string;
    icon: string;
  };
}
