import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount } from "enzyme";
import RoomLogo from ".";

const baseProps = {
  type: "custom",
  isPrivacy: false,
  isArchive: false,
};

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<RoomLogo />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without error", () => {
    // @ts-expect-error TS(2322): Type '{ type: string; isPrivacy: boolean; isArchiv... Remove this comment to see the full error message
    const wrapper = mount(<RoomLogo {...baseProps} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts id", () => {
    // @ts-expect-error TS(2322): Type '{ id: string; type: string; isPrivacy: boole... Remove this comment to see the full error message
    const wrapper = mount(<RoomLogo {...baseProps} id="testId" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className", () => {
    // @ts-expect-error TS(2322): Type '{ className: string; type: string; isPrivacy... Remove this comment to see the full error message
    const wrapper = mount(<RoomLogo {...baseProps} className="test" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts style", () => {
    // @ts-expect-error TS(2322): Type '{ style: { color: string; }; type: string; i... Remove this comment to see the full error message
    const wrapper = mount(<RoomLogo {...baseProps} style={{ color: "red" }} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts isPrivacy prop", () => {
    // @ts-expect-error TS(2322): Type '{ isPrivacy: true; type: string; isArchive: ... Remove this comment to see the full error message
    const wrapper = mount(<RoomLogo {...baseProps} isPrivacy={true} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("isPrivacy")).toEqual(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts isPrivacy prop", () => {
    // @ts-expect-error TS(2322): Type '{ isArchive: true; type: string; isPrivacy: ... Remove this comment to see the full error message
    const wrapper = mount(<RoomLogo {...baseProps} isArchive={true} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("isArchive")).toEqual(true);
  });
});
