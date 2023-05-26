import React, { ChangeEvent, useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import DownloadReactSvgUrl from "PUBLIC_DIR/images/download.react.svg?url";
import RenameReactSvgUrl from "PUBLIC_DIR/images/rename.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/trash.react.svg?url";

import Card from "./Card";
import CardProps from "./Card.props";

type CardType = typeof Card;

export default {
  title: "Components/Card",
  component: Card,
  parameters: {
    docs: {
      description: {
        component: "",
      },
    },
  },
} as ComponentMeta<CardType>;

export const Default = (args: CardProps) => {
  const [isSelected, setIsSelected] = useState(args.isSelected);

  const handleSelected = (event: ChangeEvent<HTMLInputElement>) => {
    setIsSelected(event.target.checked);
  };

  return (
    <Card
      isForMe={args.isForMe}
      avatarUrl={args.avatarUrl}
      username={args.username}
      isSelected={isSelected}
      getOptions={args.getOptions}
      onSelected={handleSelected}
      isLoading={args.isLoading}
      filename={args.filename}
    />
  );
};

Default.args = {
  avatarUrl: "",
  username: "Leo Dokidis",
  filename: "Заявление на отпуск",
  isSelected: false,
  isForMe: false,
  getOptions() {
    return [
      {
        key: "download",
        label: "Download",
        icon: DownloadReactSvgUrl,
        onClick: () => console.log("onClick Download"),
        disabled: false,
      },
      {
        key: "rename",
        label: "Rename",
        icon: RenameReactSvgUrl,
        onClick: () => console.log("onClick Rename"),
        disabled: false,
      },
      {
        key: "separator0",
        isSeparator: true,
        disabled: false,
      },
      {
        key: "delete",
        label: "Delete",
        icon: TrashReactSvgUrl,
        onClick: () => console.log("onClick Delete"),
        disabled: false,
      },
    ];
  },
};
