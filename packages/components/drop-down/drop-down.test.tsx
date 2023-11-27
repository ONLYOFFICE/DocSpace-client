import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount, shallow } from "enzyme";
import DropDown from ".";

const baseProps = {
  open: false,
  isOpen: false,
  directionX: "left",
  directionY: "bottom",
  manualWidth: "100%",
  showDisabledItems: true,
  withBackdrop: false,
};

// @ts-expect-error TS(2322): Type '{ label: string; }' is not assignable to typ... Remove this comment to see the full error message
const baseChildren = <div label="1"></div>;

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<DropDown />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("rendered without error", () => {
    const wrapper = mount(<DropDown {...baseProps} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("opened/isOpen", () => {
    // @ts-expect-error TS(2769): No overload matches this call.
    const wrapper = mount(<DropDown {...baseProps} open />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("open")).toEqual(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("showDisabledItems", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2769): No overload matches this call.
      <DropDown {...baseProps} open showDisabledItems={false} />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("showDisabledItems")).toEqual(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("render with backdrop", () => {
    // @ts-expect-error TS(2769): No overload matches this call.
    const wrapper = mount(<DropDown {...baseProps} open withBackdrop={true} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("withBackdrop")).toEqual(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("directionX right", () => {
    // @ts-expect-error TS(2769): No overload matches this call.
    const wrapper = mount(<DropDown {...baseProps} directionX="right" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("directionX")).toEqual("right");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("directionX right manualX", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2769): No overload matches this call.
      <DropDown {...baseProps} directionX="right" manualX="100px" />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("directionX")).toEqual("right");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("directionY top", () => {
    // @ts-expect-error TS(2769): No overload matches this call.
    const wrapper = mount(<DropDown {...baseProps} directionY="top" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("directionY")).toEqual("top");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("directionY top manualY", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2769): No overload matches this call.
      <DropDown {...baseProps} directionY="top" manualY="100%" />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("directionY")).toEqual("top");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("withArrow", () => {
    // @ts-expect-error TS(2769): No overload matches this call.
    const wrapper = mount(<DropDown {...baseProps} withArrow />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("withArrow")).toEqual(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("manualY", () => {
    // @ts-expect-error TS(2769): No overload matches this call.
    const wrapper = mount(<DropDown {...baseProps} manualY="100%" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("manualY")).toEqual("100%");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("manualX", () => {
    // @ts-expect-error TS(2769): No overload matches this call.
    const wrapper = mount(<DropDown {...baseProps} manualX="100%" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("manualX")).toEqual("100%");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("isUserPreview", () => {
    // @ts-expect-error TS(2769): No overload matches this call.
    const wrapper = mount(<DropDown {...baseProps} isUserPreview />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("isUserPreview")).toEqual(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("with children", () => {
    const wrapper = mount(<DropDown {...baseProps}>{baseChildren}</DropDown>);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.children()).toHaveLength(1);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("with maxHeight and children", () => {
    const child = <div>1</div>;
    const wrapper = shallow(
      // @ts-expect-error TS(2769): No overload matches this call.
      <DropDown maxHeight={0}>{child}</DropDown>
    ).instance();

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.props.children).toEqual(child);
  });

  //TODO: Fix final condition checks
  /* it('componentDidUpdate() state lifecycle test', () => {
    const wrapper = shallow(<DropDown {...baseProps} />);
    const instance = wrapper.instance();

    wrapper.setState({ opened: true });

    instance.componentDidUpdate(wrapper.props(), wrapper.state());

    expect(wrapper.state()).toBe(wrapper.state());
  }); */

  //TODO: Fix final condition checks
  /* it('componentDidUpdate() props lifecycle test', () => {
    const wrapper = shallow(<DropDown {...baseProps} />);
    const instance = wrapper.instance();

    instance.componentDidUpdate({ open: true }, wrapper.state());

    expect(wrapper.props()).toBe(wrapper.props());
  }); */

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts id", () => {
    // @ts-expect-error TS(2769): No overload matches this call.
    const wrapper = mount(<DropDown {...baseProps} id="testId" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className", () => {
    // @ts-expect-error TS(2769): No overload matches this call.
    const wrapper = mount(<DropDown {...baseProps} className="test" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts style", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2769): No overload matches this call.
      <DropDown {...baseProps} open style={{ color: "red" }} />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  });
});
