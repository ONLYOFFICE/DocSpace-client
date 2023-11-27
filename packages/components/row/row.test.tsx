import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount, shallow } from "enzyme";
import Row from ".";

const baseProps = {
  checked: false,
  element: <span>1</span>,
  contextOptions: [{ key: "1", label: "test" }],
  children: <span>Some text</span>,
};

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<Row />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without error", () => {
    const wrapper = mount(<Row {...baseProps} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("call changeCheckbox(e)", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onSelect = jest.fn();
    const wrapper = shallow(
      <Row
        {...baseProps}
        // @ts-expect-error TS(2322): Type '{ onChange: any; onSelect: any; data: { test... Remove this comment to see the full error message
        onChange={onSelect}
        onSelect={onSelect}
        data={{ test: "test" }}
      />
    );

    wrapper.simulate("change", { target: { checked: true } });

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(onSelect).toHaveBeenCalled();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders with children", () => {
    const wrapper = mount(<Row {...baseProps} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toHaveProp("children", baseProps.children);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders with contentElement and sectionWidth", () => {
    const element = <div>content</div>;
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ contentElement: Element; sectionWidth: num... Remove this comment to see the full error message
      <Row {...baseProps} contentElement={element} sectionWidth={600} />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toHaveProp("contentElement", element);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("can apply contextButtonSpacerWidth", () => {
    const test = "10px";
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ contextButtonSpacerWidth: string; checked:... Remove this comment to see the full error message
      <Row {...baseProps} contextButtonSpacerWidth={test} />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toHaveProp("contextButtonSpacerWidth", test);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("can apply data property", () => {
    const test = { test: "test" };
    // @ts-expect-error TS(2322): Type '{ data: { test: string; }; checked: boolean;... Remove this comment to see the full error message
    const wrapper = mount(<Row {...baseProps} data={test} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toHaveProp("data", test);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("can apply indeterminate", () => {
    const test = true;
    // @ts-expect-error TS(2322): Type '{ indeterminate: boolean; checked: boolean; ... Remove this comment to see the full error message
    const wrapper = mount(<Row {...baseProps} indeterminate={test} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toHaveProp("indeterminate", test);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts id", () => {
    // @ts-expect-error TS(2322): Type '{ id: string; checked: boolean; element: Ele... Remove this comment to see the full error message
    const wrapper = mount(<Row {...baseProps} id="testId" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className", () => {
    // @ts-expect-error TS(2322): Type '{ className: string; checked: boolean; eleme... Remove this comment to see the full error message
    const wrapper = mount(<Row {...baseProps} className="test" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts style", () => {
    // @ts-expect-error TS(2322): Type '{ style: { color: string; }; checked: boolea... Remove this comment to see the full error message
    const wrapper = mount(<Row {...baseProps} style={{ color: "red" }} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  });
});
