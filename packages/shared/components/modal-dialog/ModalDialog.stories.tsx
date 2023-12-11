import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";

import { Button, ButtonSize } from "../button";

import { ModalDialog } from "./ModalDialog";
import { ModalDialogType } from "./ModalDialog.enums";
import { ModalDialogProps } from "./ModalDialog.types";

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
        primary={true}
        size={ButtonSize.medium}
        onClick={openModal}
      />
      <ModalDialog {...args} visible={isVisible} onClose={closeModal}>
        <ModalDialog.Header>Change password</ModalDialog.Header>

        <ModalDialog.Body>
          <span>
            Send the password change instruction to the{" "}
            <a style={{ color: "#5299E0" }} href="mailto:asc@story.book">
              asc@story.book
            </a>{" "}
            email address
          </span>
        </ModalDialog.Body>

        <ModalDialog.Footer>
          <Button
            key="SendBtn"
            label="Send"
            primary={true}
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
    displayTypeDetailed: {
      desktop: ModalDialogType.aside,
      tablet: ModalDialogType.aside,
      mobile: ModalDialogType.aside,
    },
    children: <></>,
  },
};
