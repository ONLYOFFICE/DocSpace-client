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
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Box } from "./Box";
import { renderWithTheme } from "../../utils/render-with-theme";

describe("Box Component", () => {
  test("renders without error", () => {
    renderWithTheme(<Box>Content</Box>);
    expect(screen.getByTestId("box")).toBeInTheDocument();
  });

  test("renders children correctly", () => {
    const childText = "Box Content";
    renderWithTheme(<Box>{childText}</Box>);
    expect(screen.getByTestId("box")).toHaveTextContent(childText);
  });

  test("renders with default display prop", () => {
    renderWithTheme(<Box>Content</Box>);
    expect(screen.getByTestId("box")).toHaveStyle({ display: "block" });
  });

  test("applies display prop correctly", () => {
    renderWithTheme(<Box displayProp="flex">Content</Box>);
    expect(screen.getByTestId("box")).toHaveStyle({ display: "flex" });
  });

  test("applies flex direction prop", () => {
    renderWithTheme(<Box flexDirection="column">Content</Box>);
    expect(screen.getByTestId("box")).toHaveStyle({ flexDirection: "column" });
  });

  test("applies align items prop", () => {
    renderWithTheme(<Box alignItems="center">Content</Box>);
    expect(screen.getByTestId("box")).toHaveStyle({ alignItems: "center" });
  });

  test("applies justify content prop", () => {
    renderWithTheme(<Box justifyContent="space-between">Content</Box>);
    expect(screen.getByTestId("box")).toHaveStyle({
      justifyContent: "space-between",
    });
  });

  test("applies width prop", () => {
    renderWithTheme(<Box widthProp="200px">Content</Box>);
    expect(screen.getByTestId("box")).toHaveStyle({ width: "200px" });
  });

  test("applies height prop", () => {
    renderWithTheme(<Box heightProp="100px">Content</Box>);
    expect(screen.getByTestId("box")).toHaveStyle({ height: "100px" });
  });

  test("applies margin prop", () => {
    renderWithTheme(<Box marginProp="10px">Content</Box>);
    expect(screen.getByTestId("box")).toHaveStyle({ margin: "10px" });
  });

  test("applies padding prop", () => {
    renderWithTheme(<Box paddingProp="20px">Content</Box>);
    expect(screen.getByTestId("box")).toHaveStyle({ padding: "20px" });
  });

  test("applies background prop", () => {
    renderWithTheme(<Box backgroundProp="#f0f0f0">Content</Box>);
    expect(screen.getByTestId("box")).toHaveStyle({ background: "#f0f0f0" });
  });

  test("applies simple border prop", () => {
    renderWithTheme(<Box borderProp="1px solid black">Content</Box>);
    expect(screen.getByTestId("box")).toHaveStyle({
      border: "1px solid black",
    });
  });

  test("applies complex border prop", () => {
    const borderProp = {
      style: "solid",
      width: "1px",
      color: "black",
      radius: "4px",
    };
    renderWithTheme(<Box borderProp={borderProp}>Content</Box>);
    expect(screen.getByTestId("box")).toHaveStyle({
      borderStyle: "solid",
      borderWidth: "1px",
      borderColor: "black",
      borderRadius: "4px",
    });
  });

  test("applies overflow prop", () => {
    renderWithTheme(<Box overflowProp="hidden">Content</Box>);
    expect(screen.getByTestId("box")).toHaveStyle({ overflow: "hidden" });
  });

  test("renders as different HTML element", () => {
    renderWithTheme(<Box as="section">Content</Box>);
    expect(screen.getByTestId("box").tagName.toLowerCase()).toBe("section");
  });

  test("applies custom className", () => {
    const className = "custom-box";
    renderWithTheme(<Box className={className}>Content</Box>);
    expect(screen.getByTestId("box")).toHaveClass(className);
  });

  test("applies custom style", () => {
    const style = { cursor: "pointer", opacity: 0.8 };
    renderWithTheme(<Box style={style}>Content</Box>);
    expect(screen.getByTestId("box")).toHaveStyle(style);
  });

  describe("Accessibility and Data Attributes", () => {
    test("applies aria-label attribute", () => {
      renderWithTheme(<Box aria-label="Test label">Content</Box>);
      expect(screen.getByTestId("box")).toHaveAttribute(
        "aria-label",
        "Test label",
      );
    });

    test("applies aria-expanded attribute", () => {
      renderWithTheme(<Box aria-expanded="true">Content</Box>);
      expect(screen.getByTestId("box")).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    });

    test("applies aria-hidden attribute", () => {
      renderWithTheme(<Box aria-hidden="true">Content</Box>);
      expect(screen.getByTestId("box")).toHaveAttribute("aria-hidden", "true");
    });

    test("applies aria-controls attribute", () => {
      renderWithTheme(<Box aria-controls="test-id">Content</Box>);
      expect(screen.getByTestId("box")).toHaveAttribute(
        "aria-controls",
        "test-id",
      );
    });

    test("applies data-* attributes", () => {
      renderWithTheme(
        <Box data-test="value" data-custom="custom-value">
          Content
        </Box>,
      );
      const element = screen.getByTestId("box");
      expect(element).toHaveAttribute("data-test", "value");
      expect(element).toHaveAttribute("data-custom", "custom-value");
    });

    test("applies role attribute", () => {
      renderWithTheme(<Box role="button">Content</Box>);
      expect(screen.getByTestId("box")).toHaveAttribute("role", "button");
    });

    test("applies multiple aria and data attributes", () => {
      const props = {
        role: "dialog",
        "aria-modal": true,
        "aria-labelledby": "dialog-title",
        "data-size": "large",
        "data-state": "open",
      };

      renderWithTheme(<Box {...props}>Content</Box>);

      const element = screen.getByTestId("box");
      expect(element).toHaveAttribute("role", "dialog");
      expect(element).toHaveAttribute("aria-modal", "true");
      expect(element).toHaveAttribute("aria-labelledby", "dialog-title");
      expect(element).toHaveAttribute("data-size", "large");
      expect(element).toHaveAttribute("data-state", "open");
    });

    test("applies tabIndex attribute", () => {
      renderWithTheme(<Box tabIndex={0}>Content</Box>);
      expect(screen.getByTestId("box")).toHaveAttribute("tabindex", "0");
    });

    test("applies aria-describedby attribute", () => {
      renderWithTheme(<Box aria-describedby="description-id">Content</Box>);
      expect(screen.getByTestId("box")).toHaveAttribute(
        "aria-describedby",
        "description-id",
      );
    });
  });

  describe("Layout Props", () => {
    test("applies alignContent prop", () => {
      renderWithTheme(<Box alignContent="space-between">Content</Box>);
      expect(screen.getByTestId("box")).toHaveStyle({
        alignContent: "space-between",
      });
    });

    test("applies alignSelf prop", () => {
      renderWithTheme(<Box alignSelf="flex-start">Content</Box>);
      expect(screen.getByTestId("box")).toHaveStyle({
        alignSelf: "flex-start",
      });
    });

    test("applies gap prop", () => {
      renderWithTheme(<Box gapProp="10px">Content</Box>);
      expect(screen.getByTestId("box")).toHaveStyle({ gap: "10px" });
    });

    test("applies text alignment", () => {
      renderWithTheme(<Box textAlign="center">Content</Box>);
      expect(screen.getByTestId("box")).toHaveStyle({ textAlign: "center" });
    });
  });

  describe("Flex Props", () => {
    test("applies flexBasis prop", () => {
      renderWithTheme(<Box flexBasis="200px">Content</Box>);
      expect(screen.getByTestId("box")).toHaveStyle({ flexBasis: "200px" });
    });

    test("applies flex prop", () => {
      renderWithTheme(<Box flexProp="1 0 auto">Content</Box>);
      expect(screen.getByTestId("box")).toHaveStyle({ flex: "1 0 auto" });
    });

    test("applies flexWrap prop", () => {
      renderWithTheme(<Box flexWrap="wrap">Content</Box>);
      expect(screen.getByTestId("box")).toHaveStyle({ flexWrap: "wrap" });
    });

    test("applies justifyItems prop", () => {
      renderWithTheme(<Box justifyItems="center">Content</Box>);
      expect(screen.getByTestId("box")).toHaveStyle({ justifyItems: "center" });
    });

    test("applies justifySelf prop", () => {
      renderWithTheme(<Box justifySelf="end">Content</Box>);
      expect(screen.getByTestId("box")).toHaveStyle({ justifySelf: "end" });
    });
  });

  describe("Grid Props", () => {
    test("applies gridArea prop", () => {
      renderWithTheme(<Box gridArea="auto">Content</Box>);
      expect(screen.getByTestId("box")).toHaveStyle({ gridArea: "auto" });
    });
  });

  describe("Border Props", () => {
    test("applies complex border with multiple values", () => {
      const borderProp = {
        style: "solid dashed",
        width: "1px 2px",
        color: "red blue",
        radius: "4px 8px",
      };
      renderWithTheme(<Box borderProp={borderProp}>Content</Box>);
      expect(screen.getByTestId("box")).toHaveStyle({
        borderStyle: "solid dashed",
        borderWidth: "1px 2px",
        borderColor: "red blue",
        borderRadius: "4px 8px",
      });
    });
  });

  describe("Interaction Props", () => {
    test("handles onClick event", () => {
      const handleClick = jest.fn();
      renderWithTheme(<Box onClick={handleClick}>Clickable Content</Box>);

      screen.getByTestId("box").click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test("applies id attribute", () => {
      renderWithTheme(<Box id="test-id">Content</Box>);
      expect(screen.getByTestId("box")).toHaveAttribute("id", "test-id");
    });
  });

  describe("Combined Props", () => {
    test("applies multiple layout props together", () => {
      renderWithTheme(
        <Box
          displayProp="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="space-between"
          paddingProp="20px"
          marginProp="10px"
        >
          Content
        </Box>,
      );

      const element = screen.getByTestId("box");
      expect(element).toHaveStyle({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px",
        margin: "10px",
      });
    });

    test("applies layout and accessibility props together", () => {
      const props = {
        displayProp: "flex" as const,
        alignItems: "center" as const,
        role: "button",
        "aria-label": "Test button",
        "data-test": "button",
      };

      renderWithTheme(<Box {...props}>Content</Box>);

      const element = screen.getByTestId("box");
      expect(element).toHaveStyle({
        display: "flex",
        alignItems: "center",
      });
      expect(element).toHaveAttribute("role", "button");
      expect(element).toHaveAttribute("aria-label", "Test button");
      expect(element).toHaveAttribute("data-test", "button");
    });
  });
});
