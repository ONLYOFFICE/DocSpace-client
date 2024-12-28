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

import { Button, ButtonSize } from "../button";

import { ModalDialog } from ".";
import { ModalDialogType } from "./ModalDialog.enums";
import { ModalDialogProps } from "./ModalDialog.types";

const meta = {
  title: "Layout components/ModalDialog",
  component: ModalDialog,
  parameters: {
    docs: {
      description: {
        component: "Modal dialog component",
      },
    },
  },
  argTypes: {
    displayType: {
      control: "select",
      options: [ModalDialogType.modal, ModalDialogType.aside],
      description: "Type of modal display (modal or aside)",
    },
    withFooterBorder: {
      control: "boolean",
      description: "Adds border to the footer",
      if: { arg: "displayType", eq: ModalDialogType.modal },
    },
    isLarge: {
      control: "boolean",
      description: "Makes the modal larger (only for modal type)",
      if: { arg: "displayType", eq: ModalDialogType.modal },
    },
    isHuge: {
      control: "boolean",
      description:
        "Makes the modal huge size (only for modal type and autoMaxWidth)",
      if: { arg: "displayType", eq: ModalDialogType.modal },
    },
    autoMaxHeight: {
      control: "boolean",
      description: "Automatically adjusts max height",
      if: { arg: "displayType", eq: ModalDialogType.modal },
    },
    autoMaxWidth: {
      control: "boolean",
      description: "Automatically adjusts max width",
      if: { arg: "displayType", eq: ModalDialogType.modal },
    },
    visible: {
      control: "boolean",
      description: "Controls modal visibility",
    },
    withBodyScroll: {
      control: "boolean",
      description: "Enables body scrolling",
      if: { arg: "displayType", eq: ModalDialogType.aside },
    },
    isScrollLocked: {
      control: "boolean",
      description: "Locks scrolling",
      if: { arg: "displayType", eq: ModalDialogType.aside },
    },
    zIndex: {
      control: "number",
      description: "Sets z-index for modal",
    },
  },
} satisfies Meta<typeof ModalDialog>;
type Story = StoryObj<typeof meta>;

export default meta;

const Template = ({ ...args }: ModalDialogProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const openModal = () => setIsVisible(true);
  const closeModal = () => setIsVisible(false);

  const blocksCount = args.displayType === ModalDialogType.modal ? 1 : 20;

  useEffect(() => {
    setIsVisible(!!args.visible);
  }, [args.visible]);

  useEffect(() => {
    document.body.style.overflow = isVisible ? "hidden" : "auto";
  }, [isVisible]);

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
          {Array(blocksCount)
            .fill(null)
            .map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={index}>
                <h3>Section 1</h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              </div>
            ))}
        </ModalDialog.Body>

        <ModalDialog.Footer>
          <Button
            key="SendBtn"
            label="Send"
            primary
            size={ButtonSize.normal}
            onClick={() => {
              closeModal();
            }}
            scale
          />
          <Button
            key="CloseBtn"
            label="Cancel"
            size={ButtonSize.normal}
            onClick={closeModal}
            scale
          />
        </ModalDialog.Footer>
      </ModalDialog>
    </>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    displayType: ModalDialogType.modal,
    children: <>test</>,
  },
};

export const AsideDefault: Story = {
  render: (args) => <Template {...args} />,
  args: {
    displayType: ModalDialogType.aside,
    children: <>test</>,
  },
};

export const Loading: Story = {
  render: (args) => <Template {...args} />,
  args: {
    displayType: ModalDialogType.modal,
    isLoading: true,
    children: <>test</>,
  },
};

export const AsideLoading: Story = {
  render: (args) => <Template {...args} />,
  args: {
    displayType: ModalDialogType.aside,
    isLoading: true,
    children: <>test</>,
  },
};

export const AsideScrollLocked: Story = {
  render: (args) => <Template {...args} />,
  args: {
    displayType: ModalDialogType.aside,
    withBodyScroll: true,
    isScrollLocked: true,
    children: <>test</>,
  },
};

export const AsideWithBodyScroll: Story = {
  render: (args) => <Template {...args} />,
  args: {
    displayType: ModalDialogType.aside,
    withBodyScroll: true,
    children: <>test</>,
  },
};

export const ModalLarge: Story = {
  render: (args) => <Template {...args} />,
  args: {
    displayType: ModalDialogType.modal,
    isLarge: true,
    children: <>test</>,
  },
};

export const ModalHuge: Story = {
  render: (args) => <Template {...args} />,
  args: {
    displayType: ModalDialogType.modal,
    isHuge: true,
    autoMaxWidth: true,
    autoMaxHeight: true,
    children: <>test</>,
  },
};

export const ModalAutoSize: Story = {
  render: (args) => <Template {...args} />,
  args: {
    displayType: ModalDialogType.modal,
    autoMaxWidth: true,
    autoMaxHeight: true,
    children: <>test</>,
  },
};

export const ModalWithFooterBorder: Story = {
  render: (args) => <Template {...args} />,
  args: {
    displayType: ModalDialogType.modal,
    withFooterBorder: true,
    children: <>test</>,
  },
};

export const NonCloseable: Story = {
  render: (args) => <Template {...args} />,
  args: {
    displayType: ModalDialogType.modal,
    isCloseable: false,
    children: <>test</>,
  },
};

export const AsideNonCloseable: Story = {
  render: (args) => <Template {...args} />,
  args: {
    displayType: ModalDialogType.aside,
    isCloseable: false,
    children: <>test</>,
  },
};
