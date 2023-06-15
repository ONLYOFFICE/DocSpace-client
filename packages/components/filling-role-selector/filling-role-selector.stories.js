import React, { useState } from "react";
import FillingRoleSelector from ".";

export default {
  title: "Components/FillingRoleSelector",
  component: FillingRoleSelector,
  argTypes: {
    onAddUser: { action: "onAddUser" },
    onRemoveUser: { action: "onRemoveUser" },
  },
};

const mockRoles = [
  {
    id: 1,
    title: "Employee",
    color: "#FBCC86",
  },
  { id: 2, title: "Director", color: "#BB85E7" },
  { id: 3, title: "Accountant", color: "#70D3B0" },
];

const mockUsers = [
  {
    id: 1,
    displayName: "Makenna Lipshutz",
    role: "Accountant",
    avatar: "/images/user.avatar.example.react.svg",
  },
  {
    id: 2,
    displayName: "Randy Korsgaard",
    role: "Director",
    avatar: "/images/user.avatar.example.react.svg",
  },
];

const textRoleEveryone =
  "The form is available for filling for all room members.";
const textTooltip =
  "Forms filled by the users of the first role are passed over to the next roles in the list for filling the corresponding fields.";
const textEveryoneTranslation = "Everyone";
const textTitleTooltip = "How it works";
const textListHeader = "Roles in this form";

const Template = ({ onAddUser, ...args }) => {
  const onAddUserHandler = () => {
    onAddUser();
  };

  return (
    <FillingRoleSelector
      {...args}
      style={{ width: "480px", padding: "16px" }}
      onAddUser={onAddUserHandler}
    />
  );
};

export const Default = Template.bind({});

Default.args = {
  roles: mockRoles,
  descriptionEveryone: textRoleEveryone,
  descriptionTooltip: textTooltip,
  everyoneTranslation: textEveryoneTranslation,
  titleTooltip: textTitleTooltip,
  listHeader: textListHeader,
};

const TemplateRolesFilledUsers = ({
  users,
  onAddUser,
  onRemoveUser,
  ...args
}) => {
  const [usersAssigned, setUsersAssigned] = useState(mockUsers);

  const onRemoveUserHandler = (id) => {
    const newUsersAssigned = usersAssigned.filter((item) => item.id !== id);
    setUsersAssigned(newUsersAssigned);
    onRemoveUser();
  };

  const onAddUserHandler = () => {
    onAddUser();
  };

  return (
    <FillingRoleSelector
      {...args}
      style={{ width: "480px", padding: "16px" }}
      users={usersAssigned}
      onRemoveUser={onRemoveUserHandler}
      onAddUser={onAddUserHandler}
    />
  );
};

export const rolesFilledUsers = TemplateRolesFilledUsers.bind({});

rolesFilledUsers.args = {
  roles: mockRoles,
  users: mockUsers,
  descriptionEveryone: textRoleEveryone,
  descriptionTooltip: textTooltip,
  everyoneTranslation: textEveryoneTranslation,
  titleTooltip: textTitleTooltip,
  listHeader: textListHeader,
};
