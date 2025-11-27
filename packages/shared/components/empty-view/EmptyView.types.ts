import type { To } from "react-router";

import type { Nullable } from "../../types";
import type { ContextMenuModel } from "../context-menu";

export type EmptyViewButtonType = {
  /** Unique identifier for the button */
  key: React.Key;
  /** Title text to display */
  title: string;
  /** Optional click handler for the button */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Optional CSS class name for styling */
  className?: string;
  /** type of option */
  type: "button";
};

export type EmptyViewLinkType = {
  /** Unique identifier for the link */
  key: React.Key;
  /** Target route or URL for the link */
  to: To;
  /** Optional state to pass to the router */
  state?: unknown;
  /** Icon component to display */
  icon: React.ReactElement;
  /** Text description for the link */
  description: string;
  /** Optional click handler for the link */
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  /** Optional CSS class name for styling */
  className?: string;
  isNext?: boolean;
};

export type EmptyViewItemType = {
  /** Unique identifier for the item */
  key: React.Key;
  /** Title text to display */
  title: string;
  /** Description content, can be text or React node */
  description: React.ReactNode;
  /** Icon component to display */
  icon: React.ReactElement;
  /** Optional click handler for the item */
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  /** Optional flag to disable the item */
  disabled?: boolean;
  /** Optional context menu configuration */
  model?: Nullable<ContextMenuModel[]>;
};

/** Array of EmptyViewItemType or EmptyViewLinkType elements */
export type EmptyViewOptionsType = (
  | EmptyViewItemType
  | EmptyViewLinkType
  | EmptyViewButtonType
)[];

export type EmptyViewItemProps = Omit<EmptyViewItemType, "key"> & {
  /** Optional ID for the item */
  id?: string;
};

export type EmptyViewOptionProps = {
  /** Single option of either EmptyViewItemType or EmptyViewLinkType */
  option: EmptyViewOptionsType[number];
};

export type EmptyViewProps = Omit<
  EmptyViewItemType,
  "key" | "onClick" | "disabled" | "model"
> & {
  /** Array of options to display, can be null */
  options: Nullable<EmptyViewOptionsType>;
};
