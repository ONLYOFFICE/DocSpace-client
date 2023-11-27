import React, { useState } from "react";
import Box from "../box";
import ViewSelector from "./";

// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/view-rows.re... Remove this comment to see the full error message
import ViewRowsReactSvg from "PUBLIC_DIR/images/view-rows.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/view-tiles.r... Remove this comment to see the full error message
import ViewTilesReactSvg from "PUBLIC_DIR/images/view-tiles.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/eye.react.sv... Remove this comment to see the full error message
import EyeReactSvg from "PUBLIC_DIR/images/eye.react.svg?url";

export default {
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
};

const Template = ({
  onChangeView,
  viewAs,
  viewSettings,
  isDisabled,
  isFilter,
  ...rest
}: any) => {
  const [view, setView] = useState(viewAs);

  return (
    // @ts-expect-error TS(2322): Type '{ children: Element; paddingProp: string; }'... Remove this comment to see the full error message
    <Box paddingProp="16px">
      <ViewSelector
        {...rest}
        isDisabled={isDisabled}
        viewSettings={viewSettings}
        viewAs={view}
        isFilter={isFilter}
        onChangeView={(view) => {
          onChangeView(view);
          setView(view);
        }}
      />
    </Box>
  );
};

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '({ onChang... Remove this comment to see the full error message
Default.args = {
  viewSettings: [
    {
      value: "row",
      icon: ViewRowsReactSvg,
    },
    {
      value: "tile",
      icon: ViewTilesReactSvg,
      callback: () => console.log("callback tile click"),
    },
    {
      value: "some",
      icon: EyeReactSvg,
      callback: () => console.log("callback some click"),
    },
  ],
  viewAs: "row",
  isDisabled: false,
  isFilter: false,
};
