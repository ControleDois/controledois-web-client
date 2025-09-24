export interface PageHeader {
  title: string;
  description?: string;
  button?: {
    text?: string;
    routerLink?: string;
    icon?: string;
    action?: () => void;
  };
  buttonsIcons?: {
    tooltip: string;
    icon: string;
    action: () => void;
    class: string;
    style?: string;
    showButton: boolean;
  }[];
}
