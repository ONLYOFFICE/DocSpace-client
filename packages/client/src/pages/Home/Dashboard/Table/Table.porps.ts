import { IRole } from "@docspace/common/Models";

interface TableProps {
  roles: IRole[];
  sectionWidth: number;
  userID: string;
}

export default TableProps;

export type TableRowProps = {
  role: IRole;
};
