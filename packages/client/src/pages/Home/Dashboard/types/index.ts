import DashboardStore from "src/store/DashboardStore";

export type DashboardInjectType = {
  dashboardStore: DashboardStore;
};

export type TableColumnType = {
  key: string;
  title: any;
  resizable: boolean;
  enable: boolean;
  sortBy: string;
  default?: boolean;
  minWidth?: number;
  onChange?: (key: string) => void;
  onClick: (sortBy: any) => void;
  onIconClick?: () => void;
};
