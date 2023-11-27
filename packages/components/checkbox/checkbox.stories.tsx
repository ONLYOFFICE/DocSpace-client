import React from "react";

import CheckboxComponent from "./";

export default {
  title: "Components/Checkbox",
  component: CheckboxComponent,
  parameters: {
    docs: {
      description: { component: "Custom checkbox input" },
    },
  },
  argTypes: {
    onChange: {
      action: "onChange",
    },
  },
};

class Checkbox extends React.Component {
  constructor(props: any) {
    super(props);

    this.state = {
      isChecked: false,
    };
  }

  onChange = (e: any) => {
    // @ts-expect-error TS(2339): Property 'onChange' does not exist on type 'Readon... Remove this comment to see the full error message
    this.props.onChange(e);
    // @ts-expect-error TS(2339): Property 'isChecked' does not exist on type 'Reado... Remove this comment to see the full error message
    this.setState({ isChecked: !this.state.isChecked });
  };

  render() {
    return (
      <CheckboxComponent
        {...this.props}
        // @ts-expect-error TS(2339): Property 'isChecked' does not exist on type 'Reado... Remove this comment to see the full error message
        isChecked={this.props.isChecked || this.state.isChecked}
        onChange={this.onChange}
      />
    );
  }
}
const Template = (args: any) => {
  return <Checkbox {...args} />;
};

const AllCheckboxesTemplate = (args: any) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat( auto-fill, minmax(120px, 1fr) )",
        gridGap: "16px",
        alignItems: "center",
      }}
    >
      // @ts-expect-error TS(2322): Type '{ onChange: any; }' is not assignable to typ... Remove this comment to see the full error message
      <Checkbox onChange={args.onChange} />
      // @ts-expect-error TS(2322): Type '{ isChecked: boolean; onChange: any; }' is n... Remove this comment to see the full error message
      <Checkbox isChecked={true} onChange={args.onChange} />
      // @ts-expect-error TS(2322): Type '{ isDisabled: boolean; onChange: any; }' is ... Remove this comment to see the full error message
      <Checkbox isDisabled={true} onChange={args.onChange} />
      // @ts-expect-error TS(2322): Type '{ isIndeterminate: boolean; onChange: any; }... Remove this comment to see the full error message
      <Checkbox isIndeterminate={true} onChange={args.onChange} />
      // @ts-expect-error TS(2322): Type '{ label: string; onChange: any; }' is not as... Remove this comment to see the full error message
      <Checkbox label="Some label" onChange={args.onChange} />
    </div>
  );
};

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
Default.args = {
  label: "Checkbox label",
};
export const AllCheckboxStates = AllCheckboxesTemplate.bind({});
