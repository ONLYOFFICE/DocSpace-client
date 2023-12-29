export type TUser = {
  id: string;
  role: string;
  name?: string;
  hasAvatar: boolean;
  avatar?: string;
  displayName: string;
};
export type TRole = {
  everyone?: string;
  order: number;
  name: string;
  color: string;
  id: string;
};

export interface FillingRoleSelectorProps {
  /** Accepts class */
  className?: string;
  /** Role description text Everyone */
  descriptionEveryone: string;
  /** Tooltip text */
  descriptionTooltip: string;
  /** Accepts id */
  id?: string;
  /** The function of adding a user to a role */
  onAddUser: () => void;
  /** Function to remove a user from a role */
  onRemoveUser: (id: string) => void;
  /** Array of roles */
  roles: TRole[];
  /** Accepts CSS style */
  style: React.CSSProperties;
  /** Array of assigned users per role */
  users: TUser[];
}
