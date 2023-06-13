import IconProps from "../Icon/Icon.props";

interface TableProps {
  roles: TableRowProps[];
}

export default TableProps;

export type TableRowProps = Omit<IconProps, "size"> & {
  id: number;
  queue: string;
  title: string;
};
