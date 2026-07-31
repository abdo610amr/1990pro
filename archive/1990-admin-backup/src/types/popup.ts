export interface PopupConfig {
  enabled: boolean;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonUrl: string;
  showOnce: boolean;
  showEveryVisit: boolean;
}

export type PopupFormData = PopupConfig & {
  imageFile?: File;
};
