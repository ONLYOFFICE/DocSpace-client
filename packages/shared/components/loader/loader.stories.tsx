import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import { Loader } from ".";
import { LoaderTypes } from "./Loader.enums";

const meta = {
  title: "Components/Loader",
  component: Loader,
  parameters: {
    docs: {
      description: {
        component:
          "Loader component is used for displaying loading actions on a page",
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=419-1989&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
  argTypes: {
    color: { control: "color" },
  },
} satisfies Meta<typeof Loader>;
type Story = StoryObj<typeof Loader>;

export default meta;

export const Default: Story = {
  render: (args) => (
    <div style={{ height: "100px" }}>
      <Loader {...args} />
    </div>
  ),
  args: {
    type: LoaderTypes.base,
    color: "#63686a",
    size: "18px",
    label: "Loading content, please wait...",
  },
};

export const Examples = {
  render: () => {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
          height: "100px",
        }}
      >
        <Loader
          type={LoaderTypes.base}
          color="#63686a"
          size="18px"
          label="Loading content, please wait..."
        />
        <Loader
          type={LoaderTypes.dualRing}
          color="#63686a"
          size="40px"
          label="Loading content, please wait."
        />
        <Loader
          type={LoaderTypes.oval}
          color="#63686a"
          size="40px"
          label="Loading content, please wait."
        />
        <Loader type={LoaderTypes.rombs} color="" size="40px" />
        <Loader type={LoaderTypes.track} color="" style={{ width: "30px" }} />
      </div>
    );
  },
};
