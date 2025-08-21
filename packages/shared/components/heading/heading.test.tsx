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
import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Heading } from ".";
import { HeadingLevel, HeadingSize } from "./Heading.enums";
import styles from "./Heading.module.scss";

describe("<Heading />", () => {
  it("renders without error", () => {
    render(
      <Heading
        level={HeadingLevel.h4}
        size={HeadingSize.medium}
        title="Some title"
      >
        Some text
      </Heading>,
    );

    expect(screen.getByTestId("heading")).toBeInTheDocument();
  });

  it("renders with inherited text props", () => {
    render(
      <Heading
        level={HeadingLevel.h1}
        color="red"
        fontSize="24px"
        fontWeight={700}
        truncate
        isInline
      >
        Styled heading
      </Heading>,
    );

    const heading = screen.getByTestId("heading");
    expect(heading).toHaveStyle({
      color: "red",
      fontSize: "24px",
      fontWeight: "700",
    });
  });

  it("renders with different heading levels", () => {
    const { rerender } = render(
      <Heading level={HeadingLevel.h1}>H1 Heading</Heading>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();

    rerender(<Heading level={HeadingLevel.h2}>H2 Heading</Heading>);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("renders with different sizes", () => {
    const { rerender } = render(
      <Heading level={HeadingLevel.h1} size={HeadingSize.large}>
        Large heading
      </Heading>,
    );
    const heading = screen.getByTestId("heading");
    expect(heading.classList.contains(styles.large)).toBe(true);

    rerender(
      <Heading level={HeadingLevel.h1} size={HeadingSize.small}>
        Small heading
      </Heading>,
    );
    const smallHeading = screen.getByTestId("heading");
    expect(smallHeading.classList.contains(styles.small)).toBe(true);
  });

  it("renders with different types", () => {
    const { rerender } = render(
      <Heading level={HeadingLevel.h1} type="menu">
        Menu heading
      </Heading>,
    );
    const heading = screen.getByTestId("heading");
    expect(heading.classList.contains(styles.menu)).toBe(true);

    rerender(
      <Heading level={HeadingLevel.h1} type="content">
        Content heading
      </Heading>,
    );
    const contentHeading = screen.getByTestId("heading");
    expect(contentHeading.classList.contains(styles.content)).toBe(true);
  });

  it("renders with custom data-testid", () => {
    render(
      <Heading level={HeadingLevel.h1} data-testid="custom-heading">
        Custom test id heading
      </Heading>,
    );
    expect(screen.getByTestId("custom-heading")).toBeInTheDocument();
  });

  it("renders with aria-label", () => {
    render(
      <Heading level={HeadingLevel.h1} aria-label="Descriptive label">
        Aria labeled heading
      </Heading>,
    );
    const heading = screen.getByTestId("heading");
    expect(heading).toHaveAttribute("aria-label", "Descriptive label");
  });
});
