/* eslint-disable no-console */
import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import Navigation from "./Navigation";
import { TNavigationProps } from "./Navigation.types";
import { DeviceType } from "../../enums";

export default {
  title: "Layout Components/Navigation",
  component: Navigation,
  parameters: {
    docs: {
      description: {
        component: "Navigation component for DocSpace application",
      },
    },
  },
} as Meta;

const Template: StoryFn<TNavigationProps> = (args) => <Navigation {...args} />;

export const Default = Template.bind({});
Default.args = {
  showText: true,
  isRootFolder: false,
  title: "My Documents",
  canCreate: true,
  navigationItems: [
    { id: "1", title: "Documents", isRootRoom: false },
    { id: "2", title: "Shared with me", isRootRoom: false },
    { id: "3", title: "Project files", isRootRoom: true },
  ],
  onClickFolder: (id: string | number) => console.log("Folder clicked:", id),
  onBackToParentFolder: () => console.log("Back to parent folder"),
  getContextOptionsFolder: () => [
    { key: "rename", label: "Rename" },
    { key: "delete", label: "Delete" },
  ],
  getContextOptionsPlus: () => [
    { key: "upload", label: "Upload file" },
    { key: "create", label: "Create folder" },
  ],
  isTrashFolder: false,
  isEmptyFilesList: false,
  clearTrash: () => console.log("Clear trash"),
  showFolderInfo: () => console.log("Show folder info"),
  isCurrentFolderInfo: false,
  toggleInfoPanel: () => console.log("Toggle info panel"),
  isInfoPanelVisible: false,
  titles: {
    infoPanel: "Info Panel",
    actions: "Actions",
    contextMenu: "Context Menu",
    warningText: "Warning",
  },
  withMenu: true,
  onPlusClick: () => console.log("Plus clicked"),
  isEmptyPage: false,
  isDesktop: true,
  isRoom: false,
  isFrame: false,
  hideInfoPanel: () => console.log("Hide info panel"),
  withLogo: false,
  burgerLogo: "https://example.com/logo.svg",
  showRootFolderTitle: true,
  isPublicRoom: false,
  titleIcon: "folder",
  currentDeviceType: DeviceType.desktop,
  rootRoomTitle: "Root Room",
  showTitle: true,
  navigationButtonLabel: "Navigation",
  onNavigationButtonClick: () => console.log("Navigation button clicked"),
  tariffBar: <div>Tariff information</div>,
  showNavigationButton: true,
  titleIconTooltip: "Folder tooltip",
  onContextOptionsClick: () => console.log("Context options clicked"),
  onLogoClick: () => console.log("Logo clicked"),
};
