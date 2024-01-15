import { Meta, StoryObj } from "@storybook/react";

import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/catalog.folder.react.svg?url";

import { MainButton } from "./MainButton";

const meta = {
  title: "Components/MainButton",
  component: MainButton,
  parameters: { docs: { description: { component: "Components/MainButton" } } },
  // onAction: { action: "onAction" },
  // clickItem: { action: "clickItem", table: { disable: true } },
} satisfies Meta<typeof MainButton>;

type Story = StoryObj<typeof meta>;

export default meta;

const itemsModel = [
  {
    key: 0,
    label: "New document",
    icon: CatalogFolderReactSvgUrl,
  },
  {
    key: 1,
    label: "New spreadsheet",
    icon: CatalogFolderReactSvgUrl,
  },
  {
    key: 2,
    label: "New presentation",
    icon: CatalogFolderReactSvgUrl,
  },
  {
    key: 3,
    label: "Master form",
    icon: CatalogFolderReactSvgUrl,
    items: [
      {
        key: 4,
        label: "From blank",
      },
      {
        key: 5,
        label: "From an existing text file",
      },
    ],
  },
  {
    key: 6,
    label: "New folder",
    icon: CatalogFolderReactSvgUrl,
  },
  {
    key: 7,
    isSeparator: true,
  },
  {
    key: 8,
    label: "Upload",
    icon: CatalogFolderReactSvgUrl,
  },
];

export const Default: Story = {
  args: {
    isDisabled: false,
    isDropdown: true,
    text: "Actions",
    model: itemsModel,
    style: {
      maxWidth: "210px",
    },
  },
};
