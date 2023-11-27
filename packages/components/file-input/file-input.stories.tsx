import React from "react";
import FileInput from "./";

export default {
  title: "Components/FileInput",
  component: FileInput,
  argTypes: {
    onInput: { action: "onInput" },
  },
  parameters: {
    docs: {
      description: {
        component: "File entry field",
      },
    },
  },
};

const Template = (args: any) => {
  return (
    <FileInput
      {...args}
      onInput={(file: any) => {
        args.onInput(
          `File: ${file},
          name: ${file.name},
          lastModified: ${file.lastModifiedDate},
          size: ${file.size}`
        );
      }}
    />
  );
};

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
Default.args = {
  placeholder: "Input file",
  size: "base",
  scale: false,
  isDisabled: false,
  id: "file-input-id",
  name: "demoFileInputName",
  hasError: false,
  hasWarning: false,
  accept: [".doc", ".docx"],
};
