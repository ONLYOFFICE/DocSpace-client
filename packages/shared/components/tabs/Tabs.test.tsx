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

import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ThemeProvider } from "styled-components";
import { Base } from "@docspace/shared/themes";
import { Tabs } from ".";
import { TabsTypes } from "./Tabs.enums";
import { TTabItem } from "./Tabs.types";

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockImplementation(() => {
  return {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  };
});
window.IntersectionObserver = mockIntersectionObserver;

const arrayItems: TTabItem[] = [
  {
    id: "tab0",
    name: "Title1",
    content: (
      <div>
        <button type="button">BUTTON</button>
        <button type="button">BUTTON</button>
        <button type="button">BUTTON</button>
      </div>
    ),
  },
  {
    id: "tab1",
    name: "Title2",
    content: (
      <div>
        <label>LABEL</label>
        <label>LABEL</label>
        <label>LABEL</label>
      </div>
    ),
  },
];

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={Base}>{ui}</ThemeProvider>);
};

describe("Tabs", () => {
  it("renders without errors", () => {
    const { container } = renderWithTheme(<Tabs items={arrayItems} />);
    expect(container).toBeInTheDocument();
  });

  it("renders all tab items", () => {
    renderWithTheme(<Tabs items={arrayItems} />);
    expect(screen.getByText("Title1")).toBeInTheDocument();
    expect(screen.getByText("Title2")).toBeInTheDocument();
  });

  it("shows correct content for selected tab", () => {
    renderWithTheme(<Tabs items={arrayItems} selectedItemId="tab1" />);
    const labels = screen.getAllByText("LABEL");
    expect(labels).toHaveLength(3);
  });

  it("applies correct styles for primary tabs", () => {
    const { container } = renderWithTheme(
      <Tabs items={arrayItems} type={TabsTypes.Primary} />,
    );
    expect(container.querySelector(".primary")).toBeInTheDocument();
  });

  it("applies correct styles for secondary tabs", () => {
    const { container } = renderWithTheme(
      <Tabs items={arrayItems} type={TabsTypes.Secondary} />,
    );
    expect(container.querySelector(".secondary")).toBeInTheDocument();
  });
  it("shows badge when provided", () => {
    const itemsWithBadge = [{ ...arrayItems[0], badge: "New" }, arrayItems[1]];
    renderWithTheme(<Tabs items={itemsWithBadge} />);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("applies sticky styles when stickyTop is provided", () => {
    const { container } = renderWithTheme(
      <Tabs items={arrayItems} stickyTop="50px" />,
    );
    const stickyElement = container.querySelector(".sticky");
    expect(stickyElement).toHaveStyle({ top: "50px" });
  });
});
