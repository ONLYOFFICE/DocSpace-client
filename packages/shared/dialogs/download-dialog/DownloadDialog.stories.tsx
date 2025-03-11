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

import { useEffect, useState } from "react";
import { Meta, StoryFn } from "@storybook/react";

import { Button } from "../../components/button";
import i18nextStoryDecorator from "../../.storybook/decorators/i18nextStoryDecorator";

import type { DownloadDialogProps } from "./DownloadDialog.types";
import { extsConvertible, sortedFiles, files } from "./mockData";
import DownloadDialog from "./index";
import { iconSize32 } from "../../utils/image-helpers";

export default {
  title: "Dialogs/DownloadDialog",
  component: DownloadDialog,
  parameters: {
    docs: {
      description: {
        component:
          "Modal dialog for downloading files with password protection support.",
      },
    },
  },
  argTypes: {
    visible: {
      control: "boolean",
      description: "Controls the visibility of the modal dialog",
      defaultValue: false,
    },
    setDownloadDialogVisible: {
      action: "setDownloadDialogVisible",
      description: "Callback function called when the modal visibility changes",
    },
    decorators: [i18nextStoryDecorator],
  },
} as Meta;

const Template: StoryFn<DownloadDialogProps> = (args) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isVisible ? "hidden" : "auto";
  }, [isVisible]);

  return (
    <>
      <Button
        primary
        label="Open Download Dialog"
        onClick={() => setIsVisible(true)}
      />
      <DownloadDialog
        {...args}
        visible={isVisible}
        setDownloadDialogVisible={setIsVisible}
      />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  visible: false,
  setDownloadDialogVisible: () => {},
  sortedFiles,
  downloadItems: [],
  setDownloadItems: () => {},
  downloadFiles: () => {},
  getDownloadItems: () => [[], [], null],
  sortedPasswordFiles: [],
  updateDownloadedFilePassword: () => {},
  sortedDownloadFiles: {
    other: [],
    password: [],
    remove: [],
    original: [],
  },
  resetDownloadedFileFormat: () => {},
  discardDownloadedFile: () => {},
  setSortedPasswordFiles: () => {},
  getIcon: (_, exst?: string) =>
    iconSize32.get(exst ? `${exst.replace(/^\./, "")}.svg` : "file.svg") || "",
  getFolderIcon: () => "",
  extsConvertible,
};

export const MultiplePasswordView = Template.bind({});
MultiplePasswordView.storyName =
  "Multiple files to download, some require password";
MultiplePasswordView.args = {
  ...Default.args,
  visible: false,
  downloadItems: files,
  sortedPasswordFiles: [files[1], files[5]],
  sortedDownloadFiles: {
    other: [files[1], files[5]],
    password: [],
    remove: [],
    original: [],
  },
};

export const OnePasswordView = Template.bind({});
OnePasswordView.storyName = "Single file to download and it requires password";
OnePasswordView.args = {
  ...Default.args,
  visible: false,
  downloadItems: [files[0]],
  sortedPasswordFiles: [files[0]],
  sortedDownloadFiles: {
    other: [],
    password: [files[0]],
    remove: [],
    original: [],
  },
};
