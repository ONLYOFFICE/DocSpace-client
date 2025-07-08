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
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { mockDefaultProps } from "./mockData";
import { FilesSelectorInput } from "./index";

jest.mock("@docspace/shared/selectors/Files", () => ({
  __esModule: true,
  default: jest.fn((props) => {
    const { isPanelVisible } = props;
    return (
      <div data-testid="files-selector" data-visible={isPanelVisible}>
        FilesSelector
      </div>
    );
  }),
}));

jest.mock("@docspace/shared/components/file-input", () => ({
  __esModule: true,
  FileInput: jest.fn(({ onClick }) => (
    <div data-testid="file-input" onClick={onClick}>
      File Input
    </div>
  )),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (str: string) => str,
  }),
}));

describe("FilesSelectorInput", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without error", async () => {
    render(<FilesSelectorInput {...mockDefaultProps} />);

    expect(screen.getByTestId("file-input")).toBeInTheDocument();
  });

  it("applies custom width correctly", async () => {
    const customWidth = "500px";
    render(<FilesSelectorInput {...mockDefaultProps} maxWidth={customWidth} />);

    const container = screen.getByTestId("files-selector-input");
    expect(container).toHaveStyle(`max-width: ${customWidth}`);
  });

  it("passes className to the container", async () => {
    const customClassName = "custom-class";
    render(
      <FilesSelectorInput {...mockDefaultProps} className={customClassName} />,
    );

    const container = screen.getByTestId("files-selector-input");
    expect(container).toHaveClass(customClassName);
  });

  it("make files selector visible after click on file input", async () => {
    render(<FilesSelectorInput {...mockDefaultProps} />);

    const fileInput = screen.getByTestId("file-input");

    await act(async () => {
      await userEvent.click(fileInput);
    });

    expect(screen.getByTestId("files-selector")).toHaveAttribute(
      "data-visible",
      "true",
    );
  });
});
