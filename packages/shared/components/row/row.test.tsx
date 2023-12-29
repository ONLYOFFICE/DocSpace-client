import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Row } from "./Row";

const baseProps = {
  checked: false,
  element: <span>1</span>,
  contextOptions: [{ key: "1", label: "test" }],
  children: <span>Some text</span>,
};

describe("<Row />", () => {
  it("renders without error", () => {
    render(<Row {...baseProps} onRowClick={() => {}} />);

    expect(screen.getByTestId("row")).toBeInTheDocument();
  });

  // it("call changeCheckbox(e)", () => {
  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   const onSelect = jest.fn();
  //   const wrapper = shallow(
  //     <Row
  //       {...baseProps}
  //       // @ts-expect-error TS(2322): Type '{ onChange: any; onSelect: any; data: { test... Remove this comment to see the full error message
  //       onChange={onSelect}
  //       onSelect={onSelect}
  //       data={{ test: "test" }}
  //     />,
  //   );

  //   wrapper.simulate("change", { target: { checked: true } });

  //   expect(onSelect).toHaveBeenCalled();
  // });

  // it("renders with children", () => {
  //   const wrapper = mount(<Row {...baseProps} />);

  //   expect(wrapper).toHaveProp("children", baseProps.children);
  // });

  // it("renders with contentElement and sectionWidth", () => {
  //   const element = <div>content</div>;
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ contentElement: Element; sectionWidth: num... Remove this comment to see the full error message
  //     <Row {...baseProps} contentElement={element} sectionWidth={600} />,
  //   );

  //   expect(wrapper).toHaveProp("contentElement", element);
  // });

  // it("can apply contextButtonSpacerWidth", () => {
  //   const test = "10px";
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ contextButtonSpacerWidth: string; checked:... Remove this comment to see the full error message
  //     <Row {...baseProps} contextButtonSpacerWidth={test} />,
  //   );

  //   expect(wrapper).toHaveProp("contextButtonSpacerWidth", test);
  // });

  // it("can apply data property", () => {
  //   const test = { test: "test" };
  //   // @ts-expect-error TS(2322): Type '{ data: { test: string; }; checked: boolean;... Remove this comment to see the full error message
  //   const wrapper = mount(<Row {...baseProps} data={test} />);

  //   expect(wrapper).toHaveProp("data", test);
  // });

  // it("can apply indeterminate", () => {
  //   const test = true;
  //   // @ts-expect-error TS(2322): Type '{ indeterminate: boolean; checked: boolean; ... Remove this comment to see the full error message
  //   const wrapper = mount(<Row {...baseProps} indeterminate={test} />);

  //   expect(wrapper).toHaveProp("indeterminate", test);
  // });

  // it("accepts id", () => {
  //   // @ts-expect-error TS(2322): Type '{ id: string; checked: boolean; element: Ele... Remove this comment to see the full error message
  //   const wrapper = mount(<Row {...baseProps} id="testId" />);

  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   // @ts-expect-error TS(2322): Type '{ className: string; checked: boolean; eleme... Remove this comment to see the full error message
  //   const wrapper = mount(<Row {...baseProps} className="test" />);

  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // it("accepts style", () => {
  //   // @ts-expect-error TS(2322): Type '{ style: { color: string; }; checked: boolea... Remove this comment to see the full error message
  //   const wrapper = mount(<Row {...baseProps} style={{ color: "red" }} />);

  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
