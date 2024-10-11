import type { To } from "react-router-dom";

import { Nullable } from "../../types/index";

import type { ContextMenuModel } from "../context-menu";

export type EmptyViewLinkType = {
  to: To;
  state?: unknown;
  icon: React.ReactElement;
  description: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export type EmptyViewItemType = {
  key: React.Key;
  title: string;
  description: React.ReactNode;
  icon: React.ReactElement;
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  disabled?: boolean;
  model?: ContextMenuModel[];
};

export type EmptyViewOptionsType = EmptyViewItemType[] | EmptyViewLinkType;

export interface EmptyViewItemProps extends Omit<EmptyViewItemType, "key"> {}

export interface EmptyViewProps
  extends Omit<EmptyViewItemType, "key" | "onClick" | "disabled" | "model"> {
  options: Nullable<EmptyViewOptionsType>;
}
