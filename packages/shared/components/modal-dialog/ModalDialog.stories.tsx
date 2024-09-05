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

import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";

import { Button, ButtonSize } from "../button";

import { ModalDialog } from "./ModalDialog";
import { ModalDialogType } from "./ModalDialog.enums";
import { ModalDialogProps } from "./ModalDialog.types";
import { globalColors } from "../../themes";

const meta = {
  title: "Components/ModalDialog",
  component: ModalDialog,
  parameters: {
    docs: {
      description: {
        component: "ModalDialog is used for displaying modal dialogs",
      },
    },
  },
} satisfies Meta<typeof ModalDialog>;
type Story = StoryObj<typeof meta>;

export default meta;

const Template = ({ ...args }: ModalDialogProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const openModal = () => setIsVisible(true);
  const closeModal = () => setIsVisible(false);

  return (
    <>
      <Button
        label="Show"
        primary
        size={ButtonSize.medium}
        onClick={openModal}
      />
      <ModalDialog {...args} visible={isVisible} onClose={closeModal}>
        <ModalDialog.Header>Change password</ModalDialog.Header>

        <ModalDialog.Body>
          <span>
            Send the password change instruction to the{" "}
            <a
              style={{ color: globalColors.lightSecondMain }}
              href="mailto:asc@story.book"
            >
              asc@story.book
            </a>{" "}
            email address
          </span>
        </ModalDialog.Body>

        <ModalDialog.Footer>
          <Button
            key="SendBtn"
            label="Send"
            primary
            scale
            size={ButtonSize.normal}
            onClick={() => {
              closeModal();
            }}
          />
          <Button
            key="CloseBtn"
            label="Cancel"
            scale
            size={ButtonSize.normal}
            onClick={closeModal}
          />
        </ModalDialog.Footer>

        <ModalDialog.Container>
          <div style={{ width: "100%", height: "100%", background: "red" }}>
            123
          </div>
        </ModalDialog.Container>
      </ModalDialog>
    </>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    displayType: ModalDialogType.aside,
    // displayTypeDetailed: {
    //   desktop: ModalDialogType.aside,
    //   tablet: ModalDialogType.aside,
    //   mobile: ModalDialogType.aside,
    // },
    children: <>123</>,
  },
};
