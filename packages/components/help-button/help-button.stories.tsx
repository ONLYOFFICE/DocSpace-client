import React from "react";

import Text from "../text";
import Link from "../link";
import HelpButton from ".";

export default {
  title: "Components/HelpButton",
  component: HelpButton,
  subcomponents: { Text, Link },
  argTypes: {},
  parameters: {
    docs: {
      description: {
        component: "HelpButton is used for a action on a page",
      },
    },
  },
};

const Template = (args: any) => {
  return (
    <div>
      <HelpButton {...args} />
    </div>
  );
};

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
Default.args = {
  offsetTop: 0,
  offsetRight: 0,
  offsetBottom: 0,
  offsetLeft: 0,
  // @ts-expect-error TS(2322): Type '{ children: string; fontSize: string; }' is ... Remove this comment to see the full error message
  tooltipContent: <Text fontSize="13px">Paste you tooltip content here</Text>,
  place: "right",
};

const AutoTemplate = (args: any) => {
  return (
    <div style={{ marginTop: "20px", marginLeft: "100px" }}>
      <HelpButton
        style={{ left: "20px" }}
        helpButtonHeaderContent="Auto position HelpButton"
        tooltipContent={
          <>
            <p>You can put every thing here</p>
            <ul style={{ marginBottom: 0 }}>
              <li>Word</li>
              <li>Chart</li>
              <li>Else</li>
            </ul>
          </>
        }
        {...args}
      />
    </div>
  );
};

export const AutoPosition = AutoTemplate.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
AutoPosition.args = {
  offsetTop: 0,
  offsetRight: 0,
  offsetBottom: 0,
  offsetLeft: 0,
};
