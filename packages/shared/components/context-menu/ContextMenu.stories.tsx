import React, { useRef } from "react";
import { Meta, StoryObj } from "@storybook/react";

import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/catalog.folder.react.svg?url";

import { ContextMenu, ContextMenuModel } from ".";

const meta = {
  title: "Components/ContextMenu",
  component: ContextMenu,
  parameters: {
    docs: {
      description: {
        component: `ContextMenu is used for a call context actions on a page.
        Implemented as part of RowContainer component.

For use within separate component it is necessary to determine active zone and events for calling and transferring options in menu.

In particular case, state is created containing options for particular Row element and passed to component when called.
        `,
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=52-2358&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
} satisfies Meta<typeof ContextMenu>;
type Story = StoryObj<typeof ContextMenu>;

export default meta;

const Template = () => {
  const cm = useRef<{
    show: (e: React.MouseEvent) => void;
    hide: (e: React.MouseEvent) => {};
  }>(null);
  const items: ContextMenuModel[] = [
    {
      key: 0,
      label: "Edit",
      icon: CatalogFolderReactSvgUrl,
    },
    {
      key: 1,
      label: "Preview",
      icon: CatalogFolderReactSvgUrl,
    },
    {
      key: 2,
      isSeparator: true,
      disabled: false,
    },
    {
      key: 3,
      label: "Sharing settings",
      icon: CatalogFolderReactSvgUrl,
    },
    {
      key: 4,
      label: "Link for portal users",
      icon: CatalogFolderReactSvgUrl,
    },
    {
      key: 5,
      label: "Copy external link",
      icon: CatalogFolderReactSvgUrl,
    },
    {
      key: 6,
      label: "Send by e-mail",
      icon: CatalogFolderReactSvgUrl,
    },
    {
      key: 7,
      label: "Version history",
      icon: CatalogFolderReactSvgUrl,
      items: [
        {
          key: 8,
          label: "Show version history",
        },
        {
          key: 9,
          label: "Finalize version",
        },
        {
          key: 10,
          label: "Unblock / Check-in",
        },
      ],
    },
    {
      key: 11,
      isSeparator: true,
      disabled: false,
    },
    {
      key: 12,
      label: "Make as favorite",
      icon: CatalogFolderReactSvgUrl,
    },
    {
      key: 13,
      label: "Download",
      icon: CatalogFolderReactSvgUrl,
    },
    {
      key: 14,
      label: "Download as",
      icon: CatalogFolderReactSvgUrl,
    },
    {
      key: 15,
      label: "Move or copy",
      icon: CatalogFolderReactSvgUrl,
      items: [
        {
          key: 16,
          label: "Move to",
        },
        {
          key: 17,
          label: "Copy",
        },
        {
          key: 18,
          label: "Duplicate",
        },
      ],
    },
    {
      key: 19,
      label: "Rename",
      icon: CatalogFolderReactSvgUrl,
      disabled: true,
    },
    {
      key: 20,
      isSeparator: true,
      disabled: false,
    },
    {
      key: 21,
      label: "Quit",
      icon: CatalogFolderReactSvgUrl,
    },
  ];

  const containerRef = useRef<null | HTMLDivElement>(null);

  return (
    <div ref={containerRef}>
      <ContextMenu model={items} ref={cm} />

      <div
        style={{
          width: "200px",
          height: "200px",
          backgroundColor: "#7dadfa",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          fontSize: "18px",
        }}
        onContextMenu={(e) => {
          cm.current?.show(e);
        }}
      >
        Right click on me
      </div>
    </div>
  );
};

export const Default: Story = {
  render: () => <Template />,
};
