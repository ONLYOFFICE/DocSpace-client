import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount } from "enzyme";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/a-z.sorting.... Remove this comment to see the full error message
import AZSortingReactSvg from "PUBLIC_DIR/images/a-z.sorting.react.svg";
// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<Icons />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without error", () => {
    const wrapper = mount(<AZSortingReactSvg />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("size small", () => {
    const wrapper = mount(<AZSortingReactSvg size="small" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("size")).toBe("small");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("size medium", () => {
    const wrapper = mount(<AZSortingReactSvg size="medium" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("size")).toBe("medium");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("size big", () => {
    const wrapper = mount(<AZSortingReactSvg size="big" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("size")).toBe("big");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("size scale", () => {
    const wrapper = mount(<AZSortingReactSvg size="scale" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("size")).toBe("scale");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("isfill prop", () => {
    const wrapper = mount(<AZSortingReactSvg isfill />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("isfill")).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("isStroke prop", () => {
    const wrapper = mount(<AZSortingReactSvg isStroke />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("isStroke")).toBe(true);
  });
});
