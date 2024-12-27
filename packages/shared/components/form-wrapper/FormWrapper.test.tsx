<<<<<<< HEAD
/*
 * (c) Copyright Ascensio System SIA 2024
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import React from "react";
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { renderWithTheme } from "../../utils/render-with-theme";
import { FormWrapper } from "./index";

describe("FormWrapper", () => {
  test("renders children content correctly", () => {
    const testContent = "Test Content";
    renderWithTheme(
      <FormWrapper>
        <div>{testContent}</div>
      </FormWrapper>,
    );

    expect(screen.getByTestId("form-wrapper")).toBeInTheDocument();
    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  test("applies custom className and style", () => {
    const customClass = "custom-class";
    const customStyle = { backgroundColor: "red" };

    renderWithTheme(
      <FormWrapper className={customClass} style={customStyle}>
        <div>Content</div>
      </FormWrapper>,
    );

    const wrapper = screen.getByTestId("form-wrapper");
    expect(wrapper).toHaveClass(customClass);
    expect(wrapper).toHaveStyle({ backgroundColor: "red" });
  });

  test("applies custom id", () => {
    const customId = "custom-id";

    renderWithTheme(
      <FormWrapper id={customId}>
        <div>Content</div>
      </FormWrapper>,
    );

    expect(screen.getByTestId("form-wrapper")).toHaveAttribute("id", customId);
=======
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

import { render, screen } from "@testing-library/react";
import { FormWrapper } from "./index";
import "@testing-library/jest-dom";

describe("FormWrapper", () => {
  it("renders without error", () => {
    const children = <div>Test Children</div>;
    render(<FormWrapper>{children}</FormWrapper>);
    const wrapper = screen.getByTestId("form-wrapper");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveAttribute("data-component", "form-wrapper");
    expect(wrapper).toHaveAttribute("role", "form");
  });

  it("renders with custom className and style", () => {
    const children = <div>Test Children</div>;
    const customStyle = { backgroundColor: "red" };
    render(
      <FormWrapper className="custom-class" style={customStyle}>
        {children}
      </FormWrapper>,
    );
    const wrapper = screen.getByTestId("form-wrapper");
    expect(wrapper).toHaveClass("custom-class");
    expect(wrapper).toHaveStyle({ backgroundColor: "red" });
  });

  it("renders with custom ARIA attributes", () => {
    const children = <div>Test Children</div>;
    render(
      <FormWrapper
        aria-label="Test Form"
        aria-labelledby="form-title"
        role="search"
      >
        {children}
      </FormWrapper>,
    );
    const wrapper = screen.getByTestId("form-wrapper");
    expect(wrapper).toHaveAttribute("aria-label", "Test Form");
    expect(wrapper).toHaveAttribute("aria-labelledby", "form-title");
    expect(wrapper).toHaveAttribute("role", "search");
  });

  it("renders children correctly", () => {
    const testId = "test-child";
    const children = <div data-testid={testId}>Test Children</div>;
    render(<FormWrapper>{children}</FormWrapper>);
    expect(screen.getByTestId(testId)).toBeInTheDocument();
    expect(screen.getByText("Test Children")).toBeInTheDocument();
>>>>>>> 2118dcdaa9a0a3817dddb413048e9d05ff983f0c
  });
});
