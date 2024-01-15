import React from "react";

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { RoomsType } from "../../enums";

import { RoomLogo } from "./RoomLogo";

const baseProps = {
  type: RoomsType.CustomRoom,
  isPrivacy: false,
  isArchive: false,
};

describe("<RoomLogo />", () => {
  it("renders without error", () => {
    render(<RoomLogo {...baseProps} />);

    expect(screen.getByTestId("room-logo")).toBeInTheDocument();
  });

  // it("accepts id", () => {
  //   // @ts-expect-error TS(2322): Type '{ id: string; type: string; isPrivacy: boole... Remove this comment to see the full error message
  //   const wrapper = mount(<RoomLogo {...baseProps} id="testId" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   // @ts-expect-error TS(2322): Type '{ className: string; type: string; isPrivacy... Remove this comment to see the full error message
  //   const wrapper = mount(<RoomLogo {...baseProps} className="test" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // it("accepts style", () => {
  //   // @ts-expect-error TS(2322): Type '{ style: { color: string; }; type: string; i... Remove this comment to see the full error message
  //   const wrapper = mount(<RoomLogo {...baseProps} style={{ color: "red" }} />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });

  // it("accepts isPrivacy prop", () => {
  //   // @ts-expect-error TS(2322): Type '{ isPrivacy: true; type: string; isArchive: ... Remove this comment to see the full error message
  //   const wrapper = mount(<RoomLogo {...baseProps} isPrivacy={true} />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("isPrivacy")).toEqual(true);
  // });

  // it("accepts isPrivacy prop", () => {
  //   // @ts-expect-error TS(2322): Type '{ isArchive: true; type: string; isPrivacy: ... Remove this comment to see the full error message
  //   const wrapper = mount(<RoomLogo {...baseProps} isArchive={true} />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("isArchive")).toEqual(true);
  // });
});
