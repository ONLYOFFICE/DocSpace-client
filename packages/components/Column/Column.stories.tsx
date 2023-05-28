import React from "react";
import { ComponentMeta } from "@storybook/react";

import Column from "./Column";
import Card from "../Card";
import ColumnProps from "./Column.props";

import DownloadReactSvgUrl from "PUBLIC_DIR/images/download.react.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/trash.react.svg?url";
import LinkReactSvgUrl from "PUBLIC_DIR/images/invitation.link.react.svg?url";

type ColumnType = typeof Column;

const settings: ComponentMeta<ColumnType> = {
  title: "Components/Column",
  component: Column,
  argTypes: {
    color: {
      type: "string",
      control: "color",
      defaultValue: "#a3c3fa",
      if: {
        arg: "as",
        exists: false,
      },
    },
    badge: {
      type: "number",
      defaultValue: 1,
    },
    title: {
      type: "string",
      defaultValue: "Сотрудник",
    },
    user: {
      type: "string",
      defaultValue: "@Anyone",
      if: {
        arg: "as",
        exists: false,
      },
    },
    onClickLocation: {
      if: {
        arg: "as",
        exists: false,
      },
    },
    getOptions: {
      if: {
        arg: "as",
        exists: true,
      },
      action: {},
      defaultValue: () => [
        {
          key: "link_for_room_members",
          label: "Link for room members",
          icon: LinkReactSvgUrl,
          onClick: () => console.log("onClick Link for room members"),
          disabled: false,
        },
        {
          key: "download_folder",
          label: "Download folder",
          icon: DownloadReactSvgUrl,
          onClick: () => console.log("onClick Download folder"),
          disabled: false,
        },
        {
          key: "copy_folder",
          label: "Copy folder",
          icon: CopyReactSvgUrl,
          onClick: () => console.log("onClick Copy folder"),
          disabled: false,
        },
        {
          key: "separator0",
          isSeparator: true,
          disabled: false,
        },
        {
          key: "delete_all_forms",
          label: "Delete all forms",
          icon: TrashReactSvgUrl,
          onClick: () => console.log("onClick Delete all forms"),
          disabled: false,
        },
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        component: "",
      },
    },
  },
};
export default settings;

export const Accepted = (args: ColumnProps) => {
  const cards = [
    {
      id: 1,
      username: "Trofimov Alexander",
      filename: "Заявление на отпуск",
    },
    {
      id: 2,
      username: "Louis Howard",
      filename: "Заявление на отпуск",
    },
    {
      id: 3,
      username: "William White",
      filename: "Заявление на отпуск",
    },
  ];

  return (
    <Column {...args}>
      {cards.map((card) => (
        <Card key={card.id} filename={card.filename} username={card.username} />
      ))}
    </Column>
  );
};

Accepted.args = {
  as: "accepted",
};
export const Cancelled = (args: ColumnProps) => {
  const cards = [
    {
      id: 1,
      username: "Trofimov Alexander",
      filename: "Заявление на отпуск",
    },
    {
      id: 2,
      username: "Louis Howard",
      filename: "Заявление на отпуск",
    },
    {
      id: 3,
      username: "William White",
      filename: "Заявление на отпуск",
    },
  ];

  return (
    <Column {...args}>
      {cards.map((card) => (
        <Card key={card.id} filename={card.filename} username={card.username} />
      ))}
    </Column>
  );
};

Cancelled.args = {
  as: "cancelled",
};

export const Default = (args: ColumnProps) => {
  const cards = [
    {
      id: 1,
      username: "Trofimov Alexander",
      filename: "Заявление на отпуск",
    },
    {
      id: 2,
      username: "Louis Howard",
      filename: "Заявление на отпуск",
    },
    {
      id: 3,
      username: "William White",
      filename: "Заявление на отпуск",
    },
  ];

  return (
    <Column {...args}>
      {cards.map((card) => (
        <Card key={card.id} filename={card.filename} username={card.username} />
      ))}
    </Column>
  );
};

Default.args = {};
