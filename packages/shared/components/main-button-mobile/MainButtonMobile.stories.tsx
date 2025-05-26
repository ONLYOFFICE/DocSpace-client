// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React, { useEffect, useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import classNames from "classnames";

import MobileActionsDocumentReactSvgUrl from "PUBLIC_DIR/images/actions.documents.react.svg?url";
import MobileActionsPresentationReactSvgUrl from "PUBLIC_DIR/images/actions.presentation.react.svg?url";
import MobileActionsSpreadsheetReactSvgUrl from "PUBLIC_DIR/images/spreadsheet.react.svg?url";
import MobileActionsFolderReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url";
import MobileUploadReactSvgUrl from "PUBLIC_DIR/images/actions.upload.react.svg?url";

import { MainButtonMobile } from ".";
import styles from "./MainButtonMobile.stories.module.scss";

const meta = {
  title: "Interactive Elements/MainButtonMobile",
  component: MainButtonMobile,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A mobile-friendly floating action button with dropdown menu and progress indicators",
      },
    },
  },
  argTypes: {
    percent: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Upload progress percentage",
    },
    opened: {
      control: "boolean",
      description: "Controls whether the dropdown menu is open",
    },
    alert: {
      control: "boolean",
      description: "Shows an alert indicator on the button",
    },
    withMenu: {
      control: "boolean",
      description: "Whether to show the dropdown menu",
      defaultValue: true,
    },
  },
} satisfies Meta<typeof MainButtonMobile>;

type Story = StoryObj<typeof meta>;

export default meta;

const actionOptions = [
  {
    key: "1",
    label: "New document",
    icon: MobileActionsDocumentReactSvgUrl,
  },
  {
    key: "2",
    label: "New presentation",
    icon: MobileActionsPresentationReactSvgUrl,
  },
  {
    key: "3",
    label: "New spreadsheet",
    icon: MobileActionsSpreadsheetReactSvgUrl,
  },
  {
    key: "4",
    label: "New folder",
    icon: MobileActionsFolderReactSvgUrl,
  },
];

const Template = ({ ...args }) => {
  const maxUploads = 10;
  const maxOperations = 7;

  const [isOpenButton, setIsOpenButton] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [state, setState] = useState({ uploads: 0, operations: 0 });

  useEffect(() => {
    if (!isUploading) return;

    const interval = setInterval(() => {
      setState((prev) => ({
        uploads: prev.uploads < maxUploads ? prev.uploads + 1 : prev.uploads,
        operations:
          prev.operations < maxOperations
            ? prev.operations + 1
            : prev.operations,
      }));

      if (state.uploads === maxUploads && state.operations === maxOperations) {
        setIsUploading(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isUploading, state]);

  const buttonOptions = [
    {
      key: "1",
      label: "Import files",
      icon: MobileUploadReactSvgUrl,
      onClick: () => setIsOpenButton(false),
    },
    {
      key: "2",
      label: "Import folder",
      icon: MobileUploadReactSvgUrl,
      onClick: () => setIsOpenButton(false),
    },
    {
      key: "3",
      label: "",
      isSeparator: true,
    },
    {
      key: "4",
      label: "Upload from cloud",
      icon: MobileUploadReactSvgUrl,
      onClick: () => setIsOpenButton(false),
    },
  ];

  const isAutoDocs =
    typeof window !== "undefined" && window?.location?.href.includes("docs");

  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.isAutoDocs]: isAutoDocs,
      })}
    >
      <MainButtonMobile
        {...args}
        style={{
          position: "absolute",
          bottom: "26px",
          insetInlineEnd: "44px",
        }}
        actionOptions={actionOptions}
        dropdownStyle={{
          position: "absolute",
          bottom: "25px",
          insetInlineEnd: "60px",
        }}
        buttonOptions={buttonOptions}
        withButton
        isOpenButton={isOpenButton}
        opened={false}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    title: "Upload",
    opened: false,
    alert: false,
    withMenu: true,
    actionOptions,
  },
};

export const WithProgress: Story = {
  render: (args) => <MainButtonMobile {...args} />,
  args: {
    ...Default.args,
    percent: 45,
  },
};
