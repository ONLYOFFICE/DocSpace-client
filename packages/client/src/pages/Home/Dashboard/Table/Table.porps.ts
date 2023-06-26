import { IRole } from "@docspace/common/Models";

interface TableProps {
  roles: IRole[];
}

export default TableProps;

export type TableRowProps = IRole;
