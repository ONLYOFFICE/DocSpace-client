import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";

import ViewRowsReactSvg from "PUBLIC_DIR/images/view-rows.react.svg?url";
import ViewTilesReactSvg from "PUBLIC_DIR/images/view-tiles.react.svg?url";
import EyeReactSvg from "PUBLIC_DIR/images/eye.react.svg?url";

import { Box } from "../box";
import { ViewSelector } from "./ViewSelector";
import { ViewSelectorProps } from "./ViewSelector.types";

const meta = {
  title: "Components/ViewSelector",
  component: ViewSelector,
  parameters: {
    docs: {
      description: {
        component: "Actions with a button.",
      },
    },
  },
  argTypes: {
    onChangeView: {
      action: "onChangeView",
    },
  },
} satisfies Meta<typeof ViewSelector>;
type Story = StoryObj<typeof meta>;

export default meta;

const Template = ({
  onChangeView,
  viewAs,
  viewSettings,
  isDisabled,
  isFilter,
  ...rest
}: ViewSelectorProps) => {
  const [view, setView] = useState(viewAs);

  return (
    <Box paddingProp="16px">
      <ViewSelector
        {...rest}
        isDisabled={isDisabled}
        viewSettings={viewSettings}
        viewAs={view}
        isFilter={isFilter}
        onChangeView={(v) => {
          onChangeView(v);
          setView(v);
        }}
      />
    </Box>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    viewSettings: [
      {
        value: "row",
        icon: ViewRowsReactSvg,
      },
      {
        value: "tile",
        icon: ViewTilesReactSvg,
        callback: () => {},
      },
      {
        value: "some",
        icon: EyeReactSvg,
        callback: () => {},
      },
    ],
    viewAs: "row",
    isDisabled: false,
    isFilter: false,
  },
};
