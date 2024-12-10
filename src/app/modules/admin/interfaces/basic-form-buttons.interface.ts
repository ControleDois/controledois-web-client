export interface BasicFormButtons {
  buttons: {
    text: string;
    icon: string;
    action: () => void;
    class: string;
  }[];
}
