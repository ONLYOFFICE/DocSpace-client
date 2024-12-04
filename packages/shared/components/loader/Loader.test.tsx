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
import { ThemeProvider } from "styled-components";
import { Base } from "../../themes";

import { Loader } from ".";
import { LoaderTypes } from "./Loader.enums";

const baseProps = {
  type: LoaderTypes.base,
  color: "black",
  size: "18px",
  label: "Loading",
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={Base}>{component}</ThemeProvider>);
};

describe("<Loader />", () => {
  describe("Basic Rendering", () => {
    test("renders without error", () => {
      renderWithTheme(<Loader {...baseProps} />);
      const loader = screen.getByTestId("loader") as HTMLElement;
      expect(loader).toBeInTheDocument();
    });

    test("renders with default props", () => {
      renderWithTheme(<Loader />);
      const loader = screen.getByTestId("loader") as HTMLElement;
      expect(loader).toBeInTheDocument();
    });

    test("renders with custom label", () => {
      const label = "Custom loading message";
      renderWithTheme(<Loader {...baseProps} label={label} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  describe("Loader Types", () => {
    const types = [
      LoaderTypes.oval,
      LoaderTypes.dualRing,
      LoaderTypes.rombs,
      LoaderTypes.track,
    ];

    test.each(types)("renders %s type correctly", (type) => {
      const { container } = renderWithTheme(
        <Loader {...baseProps} type={type} />,
      );
      const elem = container.firstChild as HTMLElement;
      expect(elem.getAttribute("data-type")).toBe(type);
    });

    test("switches between types dynamically", () => {
      const { container, rerender } = renderWithTheme(
        <Loader {...baseProps} type={LoaderTypes.oval} />,
      );
      const elem = container.firstChild as HTMLElement;
      expect(elem.getAttribute("data-type")).toBe(LoaderTypes.oval);

      rerender(
        <ThemeProvider theme={Base}>
          <Loader {...baseProps} type={LoaderTypes.dualRing} />
        </ThemeProvider>,
      );
      expect(elem.getAttribute("data-type")).toBe(LoaderTypes.dualRing);
    });
  });

  describe("States", () => {
    test("handles disabled state", () => {
      renderWithTheme(<Loader {...baseProps} isDisabled />);
      const loader = screen.getByTestId("loader") as HTMLElement;
      expect(loader.getAttribute("data-disabled")).toBe("true");
    });

    test("handles primary state", () => {
      renderWithTheme(<Loader {...baseProps} primary />);
      const loader = screen.getByTestId("loader") as HTMLElement;
      expect(loader.getAttribute("data-primary")).toBe("true");
    });
  });
});
