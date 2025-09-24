export interface BasicFormButtonsIcons {
  buttons: {
    tooltip: string;
    icon: string;
    action: () => void;
    class: string;
    style?: string;
    showButton: boolean
  }[];
}
