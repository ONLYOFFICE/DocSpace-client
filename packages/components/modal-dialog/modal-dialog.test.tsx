import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount, shallow } from "enzyme";
import ModalDialog from ".";

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<ModalDialog />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without error", () => {
    const wrapper = mount(<ModalDialog visible={false} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts id", () => {
    const wrapper = mount(<ModalDialog id="testId" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className", () => {
    const wrapper = mount(<ModalDialog className="test" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts style", () => {
    const wrapper = mount(<ModalDialog style={{ color: "red" }} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("modal displayType prop", () => {
    const wrapper = mount(<ModalDialog displayType="modal" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("displayType")).toEqual("modal");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("aside displayType prop", () => {
    const wrapper = mount(<ModalDialog displayType="aside" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("displayType")).toEqual("aside");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("exist scale prop", () => {
    const wrapper = mount(<ModalDialog scale />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("scale")).toEqual(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("componentWillUnmount() lifecycle  test", () => {
    const wrapper = mount(<ModalDialog />);
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
  it("componentDidUpdate() state lifecycle test", () => {
    const wrapper = shallow(<ModalDialog displayType="aside" visible />);
    const instance = wrapper.instance();

    instance.componentDidUpdate(wrapper.props(), wrapper.state());

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state()).toBe(wrapper.state());
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("call popstate()", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onClose = jest.fn();
    const wrapper = shallow(<ModalDialog onClose={onClose} />);
    const instance = wrapper.instance();

    instance.popstate();

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(onClose).toBeCalled();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("call resize()", () => {
    const wrapper = shallow(<ModalDialog />);
    const instance = wrapper.instance();

    instance.resize();

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state("displayType")).toEqual("aside");
  });
});
