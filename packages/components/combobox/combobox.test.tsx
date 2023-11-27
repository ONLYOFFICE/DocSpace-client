import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount, shallow } from "enzyme";
import ComboBox from ".";
import DropDownItem from "../drop-down-item";

const baseOptions = [
  {
    key: 0,
    label: "Select",
  },
  {
    key: 1,
    label: "Select",
  },
  {
    key: 2,
    label: "Select",
  },
];

const advancedOptions = (
  <>
    <DropDownItem>
      <span>Some text</span>
    </DropDownItem>
  </>
);

const baseProps = {
  noBorder: false,
  isDisabled: false,
  selectedOption: {
    key: 0,
    icon: "CatalogFolderIcon",
    label: "Select",
    default: true,
  },
  options: baseOptions,
  opened: false,
  // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  onSelect: () => jest.fn(),
  size: "base",
  scaled: true,
};

const toggleDisplayProps = {
  options: [],
  selectedOption: {
    key: 0,
    label: "Selected option",
  },
  scaled: false,
  size: "content",
  displayType: "toggle",
};

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<ComboBox />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("rendered without error", () => {
    const wrapper = mount(<ComboBox {...baseProps} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("with advanced options", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ options: never[]; advancedOptions: Element... Remove this comment to see the full error message
      <ComboBox {...baseProps} options={[]} advancedOptions={advancedOptions} />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("disabled", () => {
    // @ts-expect-error TS(2322): Type '{ isDisabled: boolean; noBorder: boolean; se... Remove this comment to see the full error message
    const wrapper = mount(<ComboBox {...baseProps} isDisabled={true} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("isDisabled")).toEqual(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("without borders", () => {
    // @ts-expect-error TS(2322): Type '{ noBorder: boolean; isDisabled: boolean; se... Remove this comment to see the full error message
    const wrapper = mount(<ComboBox {...baseProps} noBorder={true} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("noBorder")).toEqual(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("opened", () => {
    // @ts-expect-error TS(2322): Type '{ opened: boolean; noBorder: boolean; isDisa... Remove this comment to see the full error message
    const wrapper = mount(<ComboBox {...baseProps} opened={true} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("opened")).toEqual(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("opened without borders", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ opened: boolean; noBorder: boolean; isDisa... Remove this comment to see the full error message
      <ComboBox {...baseProps} opened={true} noBorder={true} />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("opened")).toEqual(true);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("noBorder")).toEqual(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("with DropDown max height", () => {
    // @ts-expect-error TS(2322): Type '{ dropDownMaxHeight: number; noBorder: boole... Remove this comment to see the full error message
    const wrapper = mount(<ComboBox {...baseProps} dropDownMaxHeight={200} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("dropDownMaxHeight")).toEqual(200);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("without scaled", () => {
    // @ts-expect-error TS(2322): Type '{ scaled: boolean; noBorder: boolean; isDisa... Remove this comment to see the full error message
    const wrapper = mount(<ComboBox {...baseProps} scaled={false} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("scaled")).toEqual(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("scaled", () => {
    // @ts-expect-error TS(2322): Type '{ scaled: boolean; noBorder: boolean; isDisa... Remove this comment to see the full error message
    const wrapper = mount(<ComboBox {...baseProps} scaled={true} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("scaled")).toEqual(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("scaled options", () => {
    // @ts-expect-error TS(2322): Type '{ scaledOptions: boolean; noBorder: boolean;... Remove this comment to see the full error message
    const wrapper = mount(<ComboBox {...baseProps} scaledOptions={true} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("scaledOptions")).toEqual(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("middle size options", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ scaled: boolean; size: string; noBorder: b... Remove this comment to see the full error message
      <ComboBox {...baseProps} scaled={false} size="middle" />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("size")).toEqual("middle");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("big size options", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ scaled: boolean; size: string; noBorder: b... Remove this comment to see the full error message
      <ComboBox {...baseProps} scaled={false} size="big" />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("size")).toEqual("big");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("huge size options", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ scaled: boolean; size: string; noBorder: b... Remove this comment to see the full error message
      <ComboBox {...baseProps} scaled={false} size="huge" />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("size")).toEqual("huge");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("by content size options", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ scaled: boolean; size: string; noBorder: b... Remove this comment to see the full error message
      <ComboBox {...baseProps} scaled={false} size="content" />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("size")).toEqual("content");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("with children node", () => {
    const wrapper = mount(
      <ComboBox {...baseProps}>
        <div>demo</div>
      </ComboBox>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.contains(<div>demo</div>)).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("not re-render", () => {
    const wrapper = shallow(<ComboBox {...baseProps} />).instance();

    const shouldUpdate = wrapper.shouldComponentUpdate(
      wrapper.props,
      wrapper.state
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(shouldUpdate).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("re-render", () => {
    const wrapper = shallow(<ComboBox {...baseProps} />).instance();

    const shouldUpdate = wrapper.shouldComponentUpdate(
      { opened: true },
      wrapper.state
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(shouldUpdate).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("causes function comboBoxClick() with disabled prop", () => {
    // @ts-expect-error TS(2322): Type '{ isDisabled: boolean; noBorder: boolean; se... Remove this comment to see the full error message
    const wrapper = shallow(<ComboBox {...baseProps} isDisabled={true} />);
    const instance = wrapper.instance();

    instance.comboBoxClick();

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state("isOpen")).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("causes function comboBoxClick()", () => {
    const wrapper = shallow(<ComboBox {...baseProps} />);
    const instance = wrapper.instance();

    instance.comboBoxClick();

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state("isOpen")).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("causes function optionClick()", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onSelect = jest.fn();
    const selectedOption = {
      key: 1,
      label: "Select",
    };
    const wrapper = shallow(
      // @ts-expect-error TS(2322): Type '{ opened: boolean; onSelect: any; noBorder: ... Remove this comment to see the full error message
      <ComboBox {...baseProps} opened={true} onSelect={onSelect} />
    );
    const instance = wrapper.instance();

    instance.optionClick(selectedOption);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state("isOpen")).toBe(false);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(onSelect).toHaveBeenCalledWith(selectedOption);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("causes function stopAction()", () => {
    const wrapper = mount(<ComboBox {...baseProps} />);
    const instance = wrapper.instance();

    instance.stopAction(new Event("click"));

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state("isOpen")).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("causes function handleClick() with simulate", () => {
    // @ts-expect-error TS(2322): Type '{ opened: boolean; noBorder: boolean; isDisa... Remove this comment to see the full error message
    const wrapper = mount(<ComboBox {...baseProps} opened={true} />);

    wrapper.simulate("click");

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state("isOpen")).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("causes function handleClick() with simulate and ComboBox not opened", () => {
    const wrapper = mount(<ComboBox {...baseProps} />);

    wrapper.simulate("click");

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state("isOpen")).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("componentDidUpdate() lifecycle test", () => {
    const wrapper = shallow(<ComboBox {...baseProps} />);
    const instance = wrapper.instance();
    const newSelected = { key: 1, label: "Select" };

    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    jest.spyOn(instance, "setIsOpen");

    wrapper.setProps({
      opened: true,
    });

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.props().opened).toBe(true);

    wrapper.setProps({
      opened: false,
    });

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.props().opened).toBe(false);

    instance.componentDidUpdate(
      {
        opened: true,
        selectedOption: newSelected,
      },
      {
        isOpen: true,
      }
    );

    instance.forceUpdate(); //Need for manual re-render, enzyme issue

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(instance.setIsOpen).toHaveBeenCalled();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts id", () => {
    // @ts-expect-error TS(2322): Type '{ id: string; noBorder: boolean; isDisabled:... Remove this comment to see the full error message
    const wrapper = mount(<ComboBox {...baseProps} id="testId" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className", () => {
    // @ts-expect-error TS(2322): Type '{ className: string; noBorder: boolean; isDi... Remove this comment to see the full error message
    const wrapper = mount(<ComboBox {...baseProps} className="test" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts style", () => {
    // @ts-expect-error TS(2322): Type '{ style: { color: string; }; noBorder: boole... Remove this comment to see the full error message
    const wrapper = mount(<ComboBox {...baseProps} style={{ color: "red" }} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("render like toggle displayType", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onToggleClick = jest.fn();
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onToggle: any; options: never[]; selectedO... Remove this comment to see the full error message
      <ComboBox {...toggleDisplayProps} onToggle={onToggleClick} />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("displayType")).toEqual("toggle");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("click on toggle", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onToggleClick = jest.fn();
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onToggle: any; options: never[]; selectedO... Remove this comment to see the full error message
      <ComboBox {...toggleDisplayProps} onToggle={onToggleClick} />
    );

    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    jest.spyOn(wrapper.instance(), "setIsOpen");

    wrapper.simulate("click");

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(onToggleClick).toHaveBeenCalled();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("click outside", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onToggleClick = jest.fn();
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ opened: true; onToggle: any; noBorder: boo... Remove this comment to see the full error message
      <ComboBox {...baseProps} opened onToggle={onToggleClick} />
    );
    const instance = wrapper.instance();

    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    jest.spyOn(instance, "handleClickOutside");

    instance.handleClickOutside(new Event("click")); //TODO: rework with simulation

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state("isOpen")).toBe(false);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("opened")).toBe(true);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(instance.handleClickOutside).toHaveBeenCalled();
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(onToggleClick).toHaveBeenCalled();
  });
});
