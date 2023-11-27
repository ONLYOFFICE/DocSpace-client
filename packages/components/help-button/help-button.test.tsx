import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount, shallow } from "enzyme";
import HelpButton from ".";

const tooltipContent = "You tooltip content";
// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<HelpButton />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("HelpButton renders without error", () => {
    // @ts-expect-error TS(2322): Type '{ tooltipContent: string; }' is not assignab... Remove this comment to see the full error message
    const wrapper = mount(<HelpButton tooltipContent={tooltipContent} />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("HelpButton componentWillUnmount  test", () => {
    // @ts-expect-error TS(2322): Type '{ tooltipContent: string; }' is not assignab... Remove this comment to see the full error message
    const wrapper = mount(<HelpButton tooltipContent={tooltipContent} />);
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const componentWillUnmount = jest.spyOn(
      wrapper.instance(),
      "componentWillUnmount"
    );
    wrapper.unmount();
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(componentWillUnmount).toHaveBeenCalled();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("HelpButton test afterHide function", () => {
    const wrapper = shallow(
      // @ts-expect-error TS(2322): Type '{ tooltipContent: string; }' is not assignab... Remove this comment to see the full error message
      <HelpButton tooltipContent={tooltipContent} />
    ).instance();
    wrapper.afterHide();
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state.hideTooltip).toEqual(false);

    wrapper.setState({ hideTooltip: false });
    wrapper.afterHide();
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state.hideTooltip).toEqual(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts id", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ tooltipContent: string; id: string; }' is ... Remove this comment to see the full error message
      <HelpButton tooltipContent={tooltipContent} id="testId" />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ tooltipContent: string; className: string;... Remove this comment to see the full error message
      <HelpButton tooltipContent={tooltipContent} className="test" />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts style", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ tooltipContent: string; style: { color: st... Remove this comment to see the full error message
      <HelpButton tooltipContent={tooltipContent} style={{ color: "red" }} />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  });
});
