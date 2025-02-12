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
import { screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { renderWithTheme } from "../../utils/render-with-theme";
import { Base, globalColors } from "../../themes";
import styles from "./Text.module.scss";

import { Text } from ".";

// Mock CSS modules
jest.mock("./Text.module.scss", () => ({
  text: "text",
  inline: "inline",
  italic: "italic",
  bold: "bold",
  noSelect: "noSelect",
  truncate: "truncate",
  autoDirSpan: "autoDirSpan",
  tile: "tile",
}));

describe("Text Component", () => {
  describe("Basic Rendering", () => {
    test("renders text content", () => {
      renderWithTheme(<Text>Hello World</Text>);
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });

    test("renders with default props", () => {
      renderWithTheme(<Text>Default Text</Text>);
      const text = screen.getByTestId("text");
      expect(text).toBeInTheDocument();
      expect(text).toHaveClass(styles.text);
    });

    test("accepts custom className", () => {
      renderWithTheme(<Text className="custom-text">Text with class</Text>);
      const text = screen.getByTestId("text");
      expect(text).toHaveClass(styles.text, "custom-text");
    });

    test("accepts custom id", () => {
      renderWithTheme(<Text id="custom-id">Text with ID</Text>);
      expect(screen.getByTestId("text")).toHaveAttribute("id", "custom-id");
    });
  });

  describe("Styling Props", () => {
    test("applies custom fontSize", () => {
      renderWithTheme(<Text fontSize="16px">Large Text</Text>);
      expect(screen.getByTestId("text")).toHaveStyle({ fontSize: "16px" });
    });

    test("applies custom color", () => {
      renderWithTheme(<Text color="#FF0000">Red Text</Text>);
      expect(screen.getByTestId("text")).toHaveStyle({ color: "#FF0000" });
    });

    test("applies theme color", () => {
      renderWithTheme(<Text color={globalColors.white}>Theme Text</Text>);
      expect(screen.getByTestId("text")).toHaveStyle({
        color: globalColors.white,
      });
    });

    test("applies custom fontWeight", () => {
      renderWithTheme(<Text fontWeight={700}>Bold Text</Text>);
      expect(screen.getByTestId("text")).toHaveStyle({ fontWeight: 700 });
    });

    test("applies custom textAlign", () => {
      renderWithTheme(<Text textAlign="center">Centered Text</Text>);
      expect(screen.getByTestId("text")).toHaveStyle({ textAlign: "center" });
    });

    test("applies custom backgroundColor", () => {
      renderWithTheme(
        <Text backgroundColor="#F0F0F0">Text with background</Text>,
      );
      expect(screen.getByTestId("text")).toHaveStyle({
        backgroundColor: "#F0F0F0",
      });
    });
  });

  describe("Theme Integration", () => {
    test("uses light theme colors", () => {
      renderWithTheme(
        <Text color={globalColors.white}>Light Theme Text</Text>,
        Base,
      );
      expect(screen.getByTestId("text")).toHaveStyle({
        color: globalColors.white,
      });
    });

    test("uses dark theme colors", () => {
      const darkTheme = {
        ...Base,
        isBase: false,
      };
      renderWithTheme(
        <Text color={globalColors.white}>Dark Theme Text</Text>,
        darkTheme,
      );
      expect(screen.getByTestId("text")).toHaveStyle({
        color: globalColors.white,
      });
    });
  });

  describe("Element Type and Tag", () => {
    test("renders as different HTML elements using 'as' prop", () => {
      renderWithTheme(<Text as="h1">Heading Text</Text>);
      expect(screen.getByTestId("text").tagName).toBe("H1");
    });

    test("renders with custom tag", () => {
      renderWithTheme(<Text tag="span">Span Text</Text>);
      expect(screen.getByTestId("text").tagName).toBe("SPAN");
    });

    test("prefers 'as' prop over 'tag' prop", () => {
      renderWithTheme(
        <Text as="h2" tag="span">
          Mixed Props Text
        </Text>,
      );
      expect(screen.getByTestId("text").tagName).toBe("H2");
    });
  });

  describe("Interactive Features", () => {
    test("handles click events", () => {
      const handleClick = jest.fn();
      renderWithTheme(<Text onClick={handleClick}>Clickable Text</Text>);

      fireEvent.click(screen.getByText("Clickable Text"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test("renders with title attribute", () => {
      const title = "Text Title";
      renderWithTheme(<Text title={title}>Hover Text</Text>);
      expect(screen.getByTestId("text")).toHaveAttribute("title", title);
    });
  });

  describe("CSS Module Classes", () => {
    test("applies inline display class", () => {
      renderWithTheme(<Text isInline>Inline Text</Text>);
      expect(screen.getByTestId("text")).toHaveClass(styles.inline);
    });

    test("applies bold class", () => {
      renderWithTheme(<Text isBold>Bold Text</Text>);
      expect(screen.getByTestId("text")).toHaveClass(styles.bold);
    });

    test("applies italic class", () => {
      renderWithTheme(<Text isItalic>Italic Text</Text>);
      expect(screen.getByTestId("text")).toHaveClass(styles.italic);
    });

    test("applies noSelect class", () => {
      renderWithTheme(<Text noSelect>Non-selectable Text</Text>);
      expect(screen.getByTestId("text")).toHaveClass(styles.noSelect);
    });

    test("applies truncate class", () => {
      renderWithTheme(<Text truncate>Truncated Text</Text>);
      expect(screen.getByTestId("text")).toHaveClass(styles.truncate);
    });

    test("applies autoDirSpan class for auto direction", () => {
      renderWithTheme(<Text dir="auto">Auto Direction Text</Text>);
      const span = screen.getByText("Auto Direction Text");
      expect(span).toHaveClass(styles.autoDirSpan);
    });

    test("applies tile class for tile view", () => {
      renderWithTheme(
        <Text dir="auto" view="tile">
          Tile View Text
        </Text>,
      );
      const span = screen.getByText("Tile View Text");
      expect(span).toHaveClass(styles.autoDirSpan, styles.tile);
    });
  });

  describe("Style Combinations", () => {
    test("combines multiple CSS module classes", () => {
      renderWithTheme(
        <Text isInline isBold isItalic noSelect>
          Multi-styled Text
        </Text>,
      );
      const text = screen.getByTestId("text");
      expect(text).toHaveClass(
        styles.text,
        styles.inline,
        styles.bold,
        styles.italic,
        styles.noSelect,
      );
    });

    test("combines CSS module classes with custom className", () => {
      renderWithTheme(
        <Text isInline isBold className="custom-class">
          Combined Classes Text
        </Text>,
      );
      const text = screen.getByTestId("text");
      expect(text).toHaveClass(
        styles.text,
        styles.inline,
        styles.bold,
        "custom-class",
      );
    });
  });
});
