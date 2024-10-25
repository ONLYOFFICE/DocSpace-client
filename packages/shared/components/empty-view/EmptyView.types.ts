import type { To } from "react-router-dom";

import type { Nullable } from "../../types";
import type { ContextMenuModel } from "../context-menu";

export type EmptyViewLinkType = {
  key: React.Key;
  to: To;
  state?: unknown;
  icon: React.ReactElement;
  description: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  className?: string;
};

export type EmptyViewItemType = {
  key: React.Key;
  title: string;
  description: React.ReactNode;
  icon: React.ReactElement;
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  disabled?: boolean;
  model?: Nullable<ContextMenuModel[]>;
};

export type EmptyViewOptionsType = (EmptyViewItemType | EmptyViewLinkType)[];

export interface EmptyViewItemProps extends Omit<EmptyViewItemType, "key"> {}

export type EmptyViewOptionProps = {
  option: EmptyViewOptionsType[number];
};
export interface EmptyViewProps
  extends Omit<EmptyViewItemType, "key" | "onClick" | "disabled" | "model"> {
  options: Nullable<EmptyViewOptionsType>;
}
