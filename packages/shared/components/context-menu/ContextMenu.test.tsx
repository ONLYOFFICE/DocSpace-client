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

import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ContextMenu } from ".";

describe("<ContextMenu />", () => {
  it("renders without error", () => {
    render(<ContextMenu model={[]} />);

    expect(screen.getByTestId("context-menu")).toBeInTheDocument();
  });

  /*   it("componentWillUnmount() test unmount", () => {
    const wrapper = mount(<ContextMenu {...baseProps} />);

    wrapper.unmount();

    expect(wrapper).toEqual(wrapper);
  });

  it("simulate handleClick() with change state to close context menu", () => {
    const wrapper = mount(
      <div id="container">
        <ContextMenu {...baseProps} id="container" />
      </div>
    );
    const instance = wrapper.find(ContextMenu).instance();

    wrapper.find(ContextMenu).setState({ visible: true });
    instance.handleClick(new Event("click", { target: null }));

    expect(wrapper.find(ContextMenu).state("visible")).toEqual(false);
  });

  it("render with options", () => {
    const options = [
      { label: "test" },
      { key: 2, label: "test" },
      false,
      { key: 4, label: "test" },
    ];

    const wrapper = mount(<ContextMenu options={options} />);
    wrapper.setState({ visible: true });

    expect(wrapper.props().options).toEqual(options);
  });

  it("simulate handleContextMenu(e) to close context menu", () => {
    const wrapper = mount(<ContextMenu {...baseProps} />);
    const instance = wrapper.instance();

    instance.handleContextMenu(new Event("click", { target: null }));

    expect(wrapper.state("visible")).toEqual(true);
  });

  it("accepts id", () => {
    const wrapper = mount(<ContextMenu {...baseProps} id="testId" />);

    expect(wrapper.prop("id")).toEqual("testId");
  });

  it("accepts className", () => {
    const wrapper = mount(<ContextMenu {...baseProps} className="test" />);

    expect(wrapper.prop("className")).toEqual("test");
  });

  it("accepts style", () => {
    const wrapper = mount(
      <ContextMenu
        {...baseProps}
        style={{ color: "red" }}
        withBackdrop={false}
      />
    );

    wrapper.setState({ visible: true });

    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  }); */
});
