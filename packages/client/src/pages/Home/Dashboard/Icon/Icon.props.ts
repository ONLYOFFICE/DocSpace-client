export interface IconOwn {
  size: "small" | "medium";
  roleType: RoleType;
}

export interface IconDefaultProps extends IconOwn {
  color: string;
}

export interface IconDoneProps extends IconOwn {
  color?: never;
}
export interface IconInterruptedProps extends IconOwn {
  color?: never;
}

export type DefaultIconProps = Pick<IconDefaultProps, "color" | "size">;
export type RoleType = "default" | "done" | "interrupted";

type IconProps = IconDefaultProps | IconDoneProps | IconInterruptedProps;

export default IconProps;
