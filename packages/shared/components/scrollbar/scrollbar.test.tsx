// (c) Copyright Ascensio System SIA 2009-2025
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
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Scrollbar } from "./Scrollbar";
import styles from "./Scrollbar.module.scss";

jest.useFakeTimers();

describe("<Scrollbar />", () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it("renders without error", () => {
    render(<Scrollbar>Some content</Scrollbar>);
    expect(screen.getByTestId("scrollbar")).toBeInTheDocument();
  });

  it("accepts and applies className", () => {
    render(<Scrollbar className="test-class">Content</Scrollbar>);
    expect(screen.getByTestId("scrollbar")).toHaveClass("test-class");
  });

  it("handles scroll events", () => {
    const onScroll = jest.fn();
    render(
      <Scrollbar onScroll={onScroll}>
        <div style={{ height: "200px" }}>Scrollable content</div>
      </Scrollbar>,
    );

    const scroller = screen.getByTestId("scroller");
    fireEvent.scroll(scroller);
    expect(onScroll).toHaveBeenCalled();
  });

  it("handles autoHide prop correctly", () => {
    render(
      <Scrollbar autoHide>
        <div>Content</div>
      </Scrollbar>,
    );

    const scrollbar = screen.getByTestId("scrollbar");
    const scrollBody = screen.getByTestId("scroll-body");

    expect(scrollbar).toHaveClass(styles.autoHide);

    // Trigger mouse move to show scrollbar
    fireEvent.mouseMove(scrollBody);
    expect(scrollbar).toHaveClass(styles.scrollVisible);

    // Fast forward timers to test auto-hide
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(scrollbar).not.toHaveClass(styles.scrollVisible);
  });

  it("applies correct tabIndex", () => {
    render(<Scrollbar tabIndex={0}>Content</Scrollbar>);
    const content = screen.getByTestId("scroll-body");
    expect(content).toHaveAttribute("tabIndex", "0");
  });

  it("handles autoFocus prop", () => {
    const focusSpy = jest.spyOn(HTMLElement.prototype, "focus");
    render(<Scrollbar autoFocus>Content</Scrollbar>);

    expect(focusSpy).toHaveBeenCalled();
    focusSpy.mockRestore();
  });

  it("applies paddingAfterLastItem prop", () => {
    render(<Scrollbar paddingAfterLastItem="50px">Content</Scrollbar>);

    const scrollbar = screen.getByTestId("scrollbar");

    expect(scrollbar).toHaveClass(styles.paddingAfterLastItem);
  });

  it("handles fixedSize prop", () => {
    render(
      <Scrollbar fixedSize style={{ width: "200px", height: "200px" }}>
        <div style={{ width: "300px", height: "300px" }}>Content</div>
      </Scrollbar>,
    );

    const scrollbar = screen.getByTestId("scrollbar");

    expect(scrollbar).toHaveClass(styles.fixedSize);
  });
});
