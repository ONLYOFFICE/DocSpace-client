import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount } from "enzyme";
import InputBlock from ".";
import Button from "../button";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/search.react... Remove this comment to see the full error message
import SearchReactSvgUrl from "PUBLIC_DIR/images/search.react.svg?url";
// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<IconButton />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without error", () => {
    const mask = [/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/];
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ children: Element; mask: (string | RegExp)... Remove this comment to see the full error message
      <InputBlock
        mask={mask}
        iconName={SearchReactSvgUrl}
        onIconClick={(event: any) => alert(event.target.value)}
        onChange={(event: any) => alert(event.target.value)}
      >
        <Button
          // @ts-expect-error TS(2322): Type '{ size: string; isDisabled: boolean; onClick... Remove this comment to see the full error message
          size="normal"
          isDisabled={false}
          onClick={() => alert("Button clicked")}
          label="OK"
        />
      </InputBlock>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("test base size props", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ iconName: any; size: string; }' is not ass... Remove this comment to see the full error message
      <InputBlock iconName={SearchReactSvgUrl} size="base"></InputBlock>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("size")).toBe("base");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("test middle size props", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ iconName: any; size: string; }' is not ass... Remove this comment to see the full error message
      <InputBlock iconName={SearchReactSvgUrl} size="middle"></InputBlock>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("size")).toBe("middle");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("test big size props", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ iconName: any; size: string; }' is not ass... Remove this comment to see the full error message
      <InputBlock iconName={SearchReactSvgUrl} size="big"></InputBlock>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("size")).toBe("big");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("test huge size props", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ iconName: any; size: string; }' is not ass... Remove this comment to see the full error message
      <InputBlock iconName={SearchReactSvgUrl} size="huge"></InputBlock>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("size")).toBe("huge");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("test iconSize props", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ iconName: any; iconSize: number; }' is not... Remove this comment to see the full error message
      <InputBlock iconName={SearchReactSvgUrl} iconSize={18}></InputBlock>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("iconSize")).toBe(18);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("test empty props", () => {
    const wrapper = mount(<InputBlock></InputBlock>);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts id", () => {
    // @ts-expect-error TS(2322): Type '{ id: string; }' is not assignable to type '... Remove this comment to see the full error message
    const wrapper = mount(<InputBlock id="testId" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className", () => {
    // @ts-expect-error TS(2322): Type '{ className: string; }' is not assignable to... Remove this comment to see the full error message
    const wrapper = mount(<InputBlock className="test" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts style", () => {
    // @ts-expect-error TS(2322): Type '{ style: { color: string; }; }' is not assig... Remove this comment to see the full error message
    const wrapper = mount(<InputBlock style={{ color: "red" }} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  });
  //TODO: Fix tests
  /* it("call onChange", () => {
    const onChange = jest.fn();
    const wrapper = mount(
      <InputBlock
        iconName={SearchReactSvgUrl}
        size="huge"
        onChange={onChange}
      />
    );
    const input = wrapper.find("input");
    input.first().simulate("change", { target: { value: "test" } });
    expect(onChange).toHaveBeenCalled();
  });
  it("call onIconClick", () => {
    const onIconClick = jest.fn();
    const wrapper = mount(
      <InputBlock
        iconName={SearchReactSvgUrl}
        size="huge"
        isDisabled={false}
        onIconClick={onIconClick}
      />
    );
    const input = wrapper.find(".append div");
    input.first().simulate("click");
    expect(onIconClick).toHaveBeenCalled();
  });
  it("not call onChange", () => {
    const onChange = jest.fn();
    const wrapper = mount(
      <InputBlock iconName={SearchReactSvgUrl} size="huge" />
    );
    const input = wrapper.find("input");
    input.first().simulate("change", { target: { value: "test" } });
    expect(onChange).not.toHaveBeenCalled();
  });
  it("not call onIconClick", () => {
    const onIconClick = jest.fn();
    const wrapper = mount(
      <InputBlock
        iconName={SearchReactSvgUrl}
        size="huge"
        isDisabled={true}
        onIconClick={onIconClick}
      />
    );
    const input = wrapper.find(".append div");
    input.first().simulate("click");
    expect(onIconClick).not.toHaveBeenCalled();
  });*/
});
