export interface BasicFormNavigation {
  items: {
    text: string;
    index: number;
    icon?: string;
  }[];
  selectedItem: number;
}
