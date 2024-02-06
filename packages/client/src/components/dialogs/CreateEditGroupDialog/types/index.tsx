export type GroupParams = {
  groupName: string;
  groupManager: object | null;
  groupMembers: object[];
};

export type EditGroupParams = {
  groupName: string;
  groupManager: object | null;
  groupMembers: object[] | null;
};
