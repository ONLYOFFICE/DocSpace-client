export interface IconOwn {
  size: "small" | "medium";
}

export interface IconDefaultProps extends IconOwn {
  color: string;
  roleType: RoleType;
}

export interface IconDoneProps extends IconOwn {
  roleType: RoleType;
  color?: never;
}
export interface IconInterruptedProps extends IconOwn {
  roleType: RoleType;
  color?: never;
}

export type DefaultIconProps = Pick<IconDefaultProps, "color" | "size">;
export type RoleType = "default" | "done" | "interrupted";

type IconProps = IconDefaultProps | IconDoneProps | IconInterruptedProps;

export default IconProps;
