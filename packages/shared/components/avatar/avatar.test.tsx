import React from "react";
import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";

import { Avatar } from ".";
import { AvatarRole, AvatarSize } from "./Avatar.enums";

const baseProps = {
  size: AvatarSize.max,
  role: AvatarRole.user,
  source: "",
  editLabel: "Edit",
  userName: "Demo User",
  editing: false,

  editAction: () => jest.fn(),
};

describe("<Avatar />", () => {
  test("correct render", () => {
    render(<Avatar {...baseProps} />);

    expect(screen.queryByTestId("avatar")).toBeInTheDocument();
  });
});

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("render owner avatar", () => {
//   const wrapper = mount(<Avatar {...baseProps} role="owner" />);

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("role")).toEqual("owner");
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("render guest avatar", () => {
//   const wrapper = mount(<Avatar {...baseProps} role="guest" />);

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("role")).toEqual("guest");
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("render big avatar", () => {
//   const wrapper = mount(<Avatar {...baseProps} size="big" />);

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("size")).toEqual("big");
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("render medium avatar", () => {
//   const wrapper = mount(<Avatar {...baseProps} size="medium" />);

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("size")).toEqual("medium");
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("render small avatar", () => {
//   const wrapper = mount(<Avatar {...baseProps} size="small" />);

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("size")).toEqual("small");
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("render min avatar", () => {
//   const wrapper = mount(<Avatar {...baseProps} size="min" />);

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("size")).toEqual("min");
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("render empty avatar", () => {
//   const wrapper = mount(<Avatar {...baseProps} userName="" source="" />);

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("userName")).toEqual("");
//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("source")).toEqual("");
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("render source avatar", () => {
//   const wrapper = mount(
//     <Avatar {...baseProps} userName="Demo User" source="demo" />,
//   );

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("userName")).toEqual("Demo User");
//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("source")).toEqual("demo");
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("render initials avatar", () => {
//   const wrapper = mount(
//     <Avatar {...baseProps} userName="Demo User" source="" />,
//   );

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("userName")).toEqual("Demo User");
//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("source")).toEqual("");
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("render editing avatar", () => {
//   const wrapper = mount(<Avatar {...baseProps} editing />);

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("editing")).toEqual(true);
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("accepts id", () => {
//   const wrapper = mount(<Avatar {...baseProps} id="testId" />);

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("id")).toEqual("testId");
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("accepts className", () => {
//   const wrapper = mount(<Avatar {...baseProps} className="test" />);

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("className")).toEqual("test");
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("accepts style", () => {
//   const wrapper = mount(<Avatar {...baseProps} style={{ width: "100px" }} />);

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.getDOMNode().style).toHaveProperty("width", "100px");
// });
// });
