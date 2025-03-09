/* eslint-disable react/destructuring-assignment */

import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import ShareFormDialog from "./ShareFormDialog";
import { ShareFormDialogProps } from "./ShareFormDialog.types";
import { Button } from "../../components/button";

export default {
  title: "Dialogs/ShareFormDialog",
  component: ShareFormDialog,
  parameters: {
    docs: {
      description: {
        component:
          "Dialog component for sharing forms to fill out in different room types",
      },
    },
  },
} as Meta;

const Template: StoryFn<ShareFormDialogProps> = (args) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button primary label="Open Dialog" onClick={() => setVisible(true)} />
      <ShareFormDialog
        {...args}
        visible={visible}
        onClose={() => {
          setVisible(false);
          args.onClose();
        }}
      />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  visible: true,
  onClose: () => console.log("Dialog closed"),
  onClickFormRoom: () => console.log("Form room clicked"),
  onClickVirtualDataRoom: () => console.log("Virtual data room clicked"),
};

export const Hidden = Template.bind({});
Hidden.args = {
  ...Default.args,
  visible: false,
};
