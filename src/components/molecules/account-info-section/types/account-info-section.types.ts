export interface AccountInfo {
  accountType: string;
  status: string;
  expirationDate: string;
  progress: number;
  progressText: string;
  isPromo: boolean;
}

export interface AccountInfoSectionProps {
  accountInfo?: AccountInfo;
  showManageButton?: boolean;
}
