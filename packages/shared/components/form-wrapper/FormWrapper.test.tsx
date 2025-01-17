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
  });
});
