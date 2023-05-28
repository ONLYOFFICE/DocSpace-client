export type AsType = "accepted" | "cancelled";

interface ColumnOwnProps {
  title: string;
  badge?: number;
  onClickBadge?: VoidFunction;
}

export interface ColumnDefaultProps extends ColumnOwnProps {
  as?: never;
  user?: string;
  color: string;
  onClickLocation?: VoidFunction;
}

export interface ColumnDoneOrRefusal extends ColumnOwnProps {
  as: AsType;
  getOptions: () => [];
}

type ColumnProps = ColumnDefaultProps | ColumnDoneOrRefusal;

export default ColumnProps;
