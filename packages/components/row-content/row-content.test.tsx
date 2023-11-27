import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount } from "enzyme";
import RowContent from ".";
import Link from "../link";

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<RowContent />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without error", () => {
    const wrapper = mount(
      <RowContent>
        <Link
          type="page"
          title="Demo"
          isBold={true}
          fontSize="15px"
          color="#333333"
        >
          Demo
        </Link>
        <Link type="page" title="Demo" fontSize="12px" color="#A3A9AE">
          Demo
        </Link>
        <Link type="action" title="Demo" fontSize="12px" color="#A3A9AE">
          Demo
        </Link>
        <Link type="page" title="0 000 0000000" fontSize="12px" color="#A3A9AE">
          0 000 0000000
        </Link>
        <Link type="page" title="demo@demo.com" fontSize="12px" color="#A3A9AE">
          demo@demo.com
        </Link>
      </RowContent>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts id", () => {
    const wrapper = mount(
      <RowContent id="testId">
        <Link
          type="page"
          title="Demo"
          isBold={true}
          fontSize="15px"
          color="#333333"
        >
          Demo
        </Link>
        <Link type="page" title="Demo" fontSize="12px" color="#A3A9AE">
          Demo
        </Link>
        <Link type="action" title="Demo" fontSize="12px" color="#A3A9AE">
          Demo
        </Link>
        <Link type="page" title="0 000 0000000" fontSize="12px" color="#A3A9AE">
          0 000 0000000
        </Link>
        <Link type="page" title="demo@demo.com" fontSize="12px" color="#A3A9AE">
          demo@demo.com
        </Link>
      </RowContent>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className", () => {
    const wrapper = mount(
      <RowContent className="test">
        <Link
          type="page"
          title="Demo"
          isBold={true}
          fontSize="15px"
          color="#333333"
        >
          Demo
        </Link>
        <Link type="page" title="Demo" fontSize="12px" color="#A3A9AE">
          Demo
        </Link>
        <Link type="action" title="Demo" fontSize="12px" color="#A3A9AE">
          Demo
        </Link>
        <Link type="page" title="0 000 0000000" fontSize="12px" color="#A3A9AE">
          0 000 0000000
        </Link>
        <Link type="page" title="demo@demo.com" fontSize="12px" color="#A3A9AE">
          demo@demo.com
        </Link>
      </RowContent>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts style", () => {
    const wrapper = mount(
      <RowContent style={{ color: "red" }}>
        <Link
          type="page"
          title="Demo"
          isBold={true}
          fontSize="15px"
          color="#333333"
        >
          Demo
        </Link>
        <Link type="page" title="Demo" fontSize="12px" color="#A3A9AE">
          Demo
        </Link>
        <Link type="action" title="Demo" fontSize="12px" color="#A3A9AE">
          Demo
        </Link>
        <Link type="page" title="0 000 0000000" fontSize="12px" color="#A3A9AE">
          0 000 0000000
        </Link>
        <Link type="page" title="demo@demo.com" fontSize="12px" color="#A3A9AE">
          demo@demo.com
        </Link>
      </RowContent>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  });
});
