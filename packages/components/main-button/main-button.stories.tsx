import React from "react";
import MainButton from ".";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/catalog.fold... Remove this comment to see the full error message
import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/catalog.folder.react.svg?url";

export default {
  title: "Components/MainButton",
  component: MainButton,
  parameters: { docs: { description: { component: "Components/MainButton" } } },
  onAction: { action: "onAction" },
  clickItem: { action: "clickItem", table: { disable: true } },
};

const Template = ({
  onAction,
  clickItem,
  ...args
}: any) => {
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
      separator: true,
    },
    {
      key: 8,
      label: "Upload",
      icon: CatalogFolderReactSvgUrl,
    },
  ];

  return (
    <div style={{ width: "280px" }}>
      <MainButton {...args} model={itemsModel}></MainButton>
    </div>
  );
};

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '({ onActio... Remove this comment to see the full error message
Default.args = {
  isDisabled: false,
  isDropdown: true,
  text: "Actions",
};
