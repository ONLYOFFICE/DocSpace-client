import { ThemeType } from "../types";

interface ListProps {
  roles: any[];
  sectionWidth: number;
}

export default ListProps;

export interface ListRowProps {
  sectionWidth: number;
  isActive: boolean;
  isChecked: boolean;
  role: any;
  theme?: ThemeType;
}
