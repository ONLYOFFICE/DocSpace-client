import React from "react";

import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { InputSize } from "../text-input";

import { SearchInput } from "./SearchInput";

const baseProps = {
  value: "",
  size: InputSize.base,
  // getFilterData: () => [
  //   {
  //     key: "filter-example",
  //     group: "filter-example",
  //     label: "example group",
  //     isHeader: true,
  //   },
  //   { key: "filter-example-test", group: "filter-example", label: "Test" },
  // ],
};

describe("<SearchInput />", () => {
  it("renders without error", () => {
    render(<SearchInput {...baseProps} />);

    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("middle size prop", () => {
  //   // @ts-expect-error TS(2322): Type '{ size: string; isNeedFilter: boolean; value... Remove this comment to see the full error message
  //   const wrapper = mount(<SearchInput {...baseProps} size="middle" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("size")).toEqual("middle");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("big size prop", () => {
  //   // @ts-expect-error TS(2322): Type '{ size: string; isNeedFilter: boolean; value... Remove this comment to see the full error message
  //   const wrapper = mount(<SearchInput {...baseProps} size="big" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("size")).toEqual("big");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("huge size prop", () => {
  //   // @ts-expect-error TS(2322): Type '{ size: string; isNeedFilter: boolean; value... Remove this comment to see the full error message
  //   const wrapper = mount(<SearchInput {...baseProps} size="huge" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("size")).toEqual("huge");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts id", () => {
  //   // @ts-expect-error TS(2322): Type '{ id: string; isNeedFilter: boolean; value: ... Remove this comment to see the full error message
  //   const wrapper = mount(<SearchInput {...baseProps} id="testId" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts className", () => {
  //   // @ts-expect-error TS(2322): Type '{ className: string; isNeedFilter: boolean; ... Remove this comment to see the full error message
  //   const wrapper = mount(<SearchInput {...baseProps} className="test" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts style", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ style: { color: string; }; isNeedFilter: b... Remove this comment to see the full error message
  //     <SearchInput {...baseProps} style={{ color: "red" }} />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
  // // TODO: Fix icons tests
  // /*it("call onClearSearch", () => {
  //   const onClearSearch = jest.fn();
  //   const onChange = jest.fn();
  //   const wrapper = mount(
  //     <SearchInput
  //       {...baseProps}
  //       onClearSearch={onClearSearch}
  //       onChange={onChange}
  //     />
  //   );

  //   wrapper
  //     .find("input")
  //     .first()
  //     .simulate("change", { target: { value: "test" } });

  //   const icon = wrapper.find(".append div");
  //   icon.first().simulate("click");
  //   expect(onClearSearch).toHaveBeenCalled();
  // });
  // it("not call onClearSearch", () => {
  //   const onClearSearch = jest.fn();
  //   const onChange = jest.fn();
  //   const wrapper = mount(<SearchInput {...baseProps} onChange={onChange} />);

  //   wrapper
  //     .find("input")
  //     .first()
  //     .simulate("change", { target: { value: "test" } });

  //   const icon = wrapper.find(".append div");
  //   icon.first().simulate("click");
  //   expect(onClearSearch).not.toHaveBeenCalled();
  // });
  // it("componentDidUpdate() props lifecycle test", () => {
  //   const wrapper = shallow(<SearchInput {...baseProps} />);
  //   const instance = wrapper.instance();

  //   instance.componentDidUpdate(
  //     {
  //       opened: true,
  //       selectedOption: {
  //         value: "test",
  //       },
  //     },
  //     wrapper.state()
  //   );

  //   expect(wrapper.props()).toBe(wrapper.props());
  // });
  // it("not call setSearchTimer", (done) => {
  //   const onChange = jest.fn();
  //   const wrapper = mount(
  //     <SearchInput {...baseProps} autoRefresh={false} onChange={onChange} />
  //   );

  //   const input = wrapper.find("input");
  //   input.first().simulate("change", { target: { value: "test" } });

  //   setTimeout(() => {
  //     expect(onChange).not.toHaveBeenCalled();
  //     done();
  //   }, 1000);
  // });
  // it("call setSearchTimer", (done) => {
  //   const onChange = jest.fn();
  //   const wrapper = mount(<SearchInput {...baseProps} onChange={onChange} />);

  //   const instance = wrapper.instance();
  //   instance.setSearchTimer("test");

  //   setTimeout(() => {
  //     expect(onChange).toHaveBeenCalled();
  //     done();
  //   }, 1000);
  // });
  // it("test icon button size. base size prop", () => {
  //   const wrapper = mount(<SearchInput {...baseProps} size="base" />);

  //   wrapper
  //     .find("input")
  //     .first()
  //     .simulate("change", { target: { value: "test" } });

  //   const inputBlock = wrapper.find(InputBlock);
  //   expect(inputBlock.prop("iconSize")).toEqual(12);
  // });
  // it("test icon button size. middle size prop", () => {
  //   const wrapper = mount(<SearchInput {...baseProps} size="middle" />);

  //   wrapper
  //     .find("input")
  //     .first()
  //     .simulate("change", { target: { value: "test" } });

  //   const inputBlock = wrapper.find(InputBlock);
  //   expect(inputBlock.prop("iconSize")).toEqual(16);
  // });
  // it("test icon button size. big size prop", () => {
  //   const wrapper = mount(<SearchInput {...baseProps} size="big" />);

  //   wrapper
  //     .find("input")
  //     .first()
  //     .simulate("change", { target: { value: "test" } });

  //   const inputBlock = wrapper.find(InputBlock);
  //   expect(inputBlock.prop("iconSize")).toEqual(19);
  // });
  // it("test icon button size. huge size prop", () => {
  //   const wrapper = mount(<SearchInput {...baseProps} size="huge" />);

  //   wrapper
  //     .find("input")
  //     .first()
  //     .simulate("change", { target: { value: "test" } });

  //   const inputBlock = wrapper.find(InputBlock);
  //   expect(inputBlock.prop("iconSize")).toEqual(22);
  // });*/
});
