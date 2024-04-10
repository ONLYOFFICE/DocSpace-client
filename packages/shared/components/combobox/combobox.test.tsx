// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// import { DropDownItem } from "../drop-down-item";

import { ComboBox } from "./ComboBox";
import { ComboBoxSize } from "./Combobox.enums";

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

// const advancedOptions = (
//   <DropDownItem>
//     <span>Some text</span>
//   </DropDownItem>
// );

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
  onSelect: jest.fn(),
  size: ComboBoxSize.base,
  scaled: true,
};

// const toggleDisplayProps = {
//   options: [],
//   selectedOption: {
//     key: 0,
//     label: "Selected option",
//   },
//   scaled: false,
//   size: "content",
//   displayType: "toggle",
// };

describe("<ComboBox />", () => {
  it("rendered without error", () => {
    render(<ComboBox {...baseProps} />);

    expect(screen.getByTestId("combobox")).toBeInTheDocument();
  });

  // it("with advanced options", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ options: never[]; advancedOptions: Element... Remove this comment to see the full error message
  //     <ComboBox
  //       {...baseProps}
  //       options={[]}
  //       advancedOptions={advancedOptions}
  //     />,
  //   );

  //   expect(wrapper).toExist();
  // });

  // it("disabled", () => {
  //   // @ts-expect-error TS(2322): Type '{ isDisabled: boolean; noBorder: boolean; se... Remove this comment to see the full error message
  //   const wrapper = mount(<ComboBox {...baseProps} isDisabled={true} />);

  //   expect(wrapper.prop("isDisabled")).toEqual(true);
  // });

  // it("without borders", () => {
  //   // @ts-expect-error TS(2322): Type '{ noBorder: boolean; isDisabled: boolean; se... Remove this comment to see the full error message
  //   const wrapper = mount(<ComboBox {...baseProps} noBorder={true} />);

  //   expect(wrapper.prop("noBorder")).toEqual(true);
  // });

  // it("opened", () => {
  //   // @ts-expect-error TS(2322): Type '{ opened: boolean; noBorder: boolean; isDisa... Remove this comment to see the full error message
  //   const wrapper = mount(<ComboBox {...baseProps} opened={true} />);

  //   expect(wrapper.prop("opened")).toEqual(true);
  // });

  // it("opened without borders", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ opened: boolean; noBorder: boolean; isDisa... Remove this comment to see the full error message
  //     <ComboBox {...baseProps} opened={true} noBorder={true} />,
  //   );

  //   expect(wrapper.prop("opened")).toEqual(true);

  //   expect(wrapper.prop("noBorder")).toEqual(true);
  // });

  // it("with DropDown max height", () => {
  //   // @ts-expect-error TS(2322): Type '{ dropDownMaxHeight: number; noBorder: boole... Remove this comment to see the full error message
  //   const wrapper = mount(<ComboBox {...baseProps} dropDownMaxHeight={200} />);

  //   expect(wrapper.prop("dropDownMaxHeight")).toEqual(200);
  // });

  // it("without scaled", () => {
  //   // @ts-expect-error TS(2322): Type '{ scaled: boolean; noBorder: boolean; isDisa... Remove this comment to see the full error message
  //   const wrapper = mount(<ComboBox {...baseProps} scaled={false} />);

  //   expect(wrapper.prop("scaled")).toEqual(false);
  // });

  // it("scaled", () => {
  //   // @ts-expect-error TS(2322): Type '{ scaled: boolean; noBorder: boolean; isDisa... Remove this comment to see the full error message
  //   const wrapper = mount(<ComboBox {...baseProps} scaled={true} />);

  //   expect(wrapper.prop("scaled")).toEqual(true);
  // });

  // it("scaled options", () => {
  //   // @ts-expect-error TS(2322): Type '{ scaledOptions: boolean; noBorder: boolean;... Remove this comment to see the full error message
  //   const wrapper = mount(<ComboBox {...baseProps} scaledOptions={true} />);

  //   expect(wrapper.prop("scaledOptions")).toEqual(true);
  // });

  // it("middle size options", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ scaled: boolean; size: string; noBorder: b... Remove this comment to see the full error message
  //     <ComboBox {...baseProps} scaled={false} size="middle" />,
  //   );

  //   expect(wrapper.prop("size")).toEqual("middle");
  // });

  // it("big size options", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ scaled: boolean; size: string; noBorder: b... Remove this comment to see the full error message
  //     <ComboBox {...baseProps} scaled={false} size="big" />,
  //   );

  //   expect(wrapper.prop("size")).toEqual("big");
  // });

  // it("huge size options", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ scaled: boolean; size: string; noBorder: b... Remove this comment to see the full error message
  //     <ComboBox {...baseProps} scaled={false} size="huge" />,
  //   );

  //   expect(wrapper.prop("size")).toEqual("huge");
  // });

  // it("by content size options", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ scaled: boolean; size: string; noBorder: b... Remove this comment to see the full error message
  //     <ComboBox {...baseProps} scaled={false} size="content" />,
  //   );

  //   expect(wrapper.prop("size")).toEqual("content");
  // });

  // it("with children node", () => {
  //   const wrapper = mount(
  //     <ComboBox {...baseProps}>
  //       <div>demo</div>
  //     </ComboBox>,
  //   );

  //   expect(wrapper.contains(<div>demo</div>)).toBe(true);
  // });

  // it("not re-render", () => {
  //   const wrapper = shallow(<ComboBox {...baseProps} />).instance();

  //   const shouldUpdate = wrapper.shouldComponentUpdate(
  //     wrapper.props,
  //     wrapper.state,
  //   );

  //   expect(shouldUpdate).toBe(false);
  // });

  // it("re-render", () => {
  //   const wrapper = shallow(<ComboBox {...baseProps} />).instance();

  //   const shouldUpdate = wrapper.shouldComponentUpdate(
  //     { opened: true },
  //     wrapper.state,
  //   );

  //   expect(shouldUpdate).toBe(true);
  // });

  // it("causes function comboBoxClick() with disabled prop", () => {
  //   // @ts-expect-error TS(2322): Type '{ isDisabled: boolean; noBorder: boolean; se... Remove this comment to see the full error message
  //   const wrapper = shallow(<ComboBox {...baseProps} isDisabled={true} />);
  //   const instance = wrapper.instance();

  //   instance.comboBoxClick();

  //   expect(wrapper.state("isOpen")).toBe(false);
  // });

  // it("causes function comboBoxClick()", () => {
  //   const wrapper = shallow(<ComboBox {...baseProps} />);
  //   const instance = wrapper.instance();

  //   instance.comboBoxClick();

  //   expect(wrapper.state("isOpen")).toBe(true);
  // });

  // it("causes function optionClick()", () => {
  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   const onSelect = jest.fn();
  //   const selectedOption = {
  //     key: 1,
  //     label: "Select",
  //   };
  //   const wrapper = shallow(
  //     // @ts-expect-error TS(2322): Type '{ opened: boolean; onSelect: any; noBorder: ... Remove this comment to see the full error message
  //     <ComboBox {...baseProps} opened={true} onSelect={onSelect} />,
  //   );
  //   const instance = wrapper.instance();

  //   instance.optionClick(selectedOption);

  //   expect(wrapper.state("isOpen")).toBe(false);

  //   expect(onSelect).toHaveBeenCalledWith(selectedOption);
  // });

  // it("causes function stopAction()", () => {
  //   const wrapper = mount(<ComboBox {...baseProps} />);
  //   const instance = wrapper.instance();

  //   instance.stopAction(new Event("click"));

  //   expect(wrapper.state("isOpen")).toBe(false);
  // });

  // it("causes function handleClick() with simulate", () => {
  //   // @ts-expect-error TS(2322): Type '{ opened: boolean; noBorder: boolean; isDisa... Remove this comment to see the full error message
  //   const wrapper = mount(<ComboBox {...baseProps} opened={true} />);

  //   wrapper.simulate("click");

  //   expect(wrapper.state("isOpen")).toBe(false);
  // });

  // it("causes function handleClick() with simulate and ComboBox not opened", () => {
  //   const wrapper = mount(<ComboBox {...baseProps} />);

  //   wrapper.simulate("click");

  //   expect(wrapper.state("isOpen")).toBe(true);
  // });

  // it("componentDidUpdate() lifecycle test", () => {
  //   const wrapper = shallow(<ComboBox {...baseProps} />);
  //   const instance = wrapper.instance();
  //   const newSelected = { key: 1, label: "Select" };

  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   jest.spyOn(instance, "setIsOpen");

  //   wrapper.setProps({
  //     opened: true,
  //   });

  //   expect(wrapper.props().opened).toBe(true);

  //   wrapper.setProps({
  //     opened: false,
  //   });

  //   expect(wrapper.props().opened).toBe(false);

  //   instance.componentDidUpdate(
  //     {
  //       opened: true,
  //       selectedOption: newSelected,
  //     },
  //     {
  //       isOpen: true,
  //     },
  //   );

  //   instance.forceUpdate(); //Need for manual re-render, enzyme issue

  //   expect(instance.setIsOpen).toHaveBeenCalled();
  // });

  // it("accepts id", () => {
  //   // @ts-expect-error TS(2322): Type '{ id: string; noBorder: boolean; isDisabled:... Remove this comment to see the full error message
  //   const wrapper = mount(<ComboBox {...baseProps} id="testId" />);

  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   // @ts-expect-error TS(2322): Type '{ className: string; noBorder: boolean; isDi... Remove this comment to see the full error message
  //   const wrapper = mount(<ComboBox {...baseProps} className="test" />);

  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // it("accepts style", () => {
  //   // @ts-expect-error TS(2322): Type '{ style: { color: string; }; noBorder: boole... Remove this comment to see the full error message
  //   const wrapper = mount(<ComboBox {...baseProps} style={{ color: "red" }} />);

  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });

  // it("render like toggle displayType", () => {
  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   const onToggleClick = jest.fn();
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ onToggle: any; options: never[]; selectedO... Remove this comment to see the full error message
  //     <ComboBox {...toggleDisplayProps} onToggle={onToggleClick} />,
  //   );

  //   expect(wrapper.prop("displayType")).toEqual("toggle");
  // });

  // it("click on toggle", () => {
  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   const onToggleClick = jest.fn();
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ onToggle: any; options: never[]; selectedO... Remove this comment to see the full error message
  //     <ComboBox {...toggleDisplayProps} onToggle={onToggleClick} />,
  //   );

  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   jest.spyOn(wrapper.instance(), "setIsOpen");

  //   wrapper.simulate("click");

  //   expect(onToggleClick).toHaveBeenCalled();
  // });

  // it("click outside", () => {
  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   const onToggleClick = jest.fn();
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ opened: true; onToggle: any; noBorder: boo... Remove this comment to see the full error message
  //     <ComboBox {...baseProps} opened onToggle={onToggleClick} />,
  //   );
  //   const instance = wrapper.instance();

  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   jest.spyOn(instance, "handleClickOutside");

  //   instance.handleClickOutside(new Event("click")); //TODO: rework with simulation

  //   expect(wrapper.state("isOpen")).toBe(false);

  //   expect(wrapper.prop("opened")).toBe(true);

  //   expect(instance.handleClickOutside).toHaveBeenCalled();

  //   expect(onToggleClick).toHaveBeenCalled();
  // });
});
