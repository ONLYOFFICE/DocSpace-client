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

import { render, screen } from "@testing-library/react";
import { FillingStatusLine } from "./index";
import { FillingStatusLineProps } from "./FillingStatusLine.types";
import { mockData } from "./mockData";
import "@testing-library/jest-dom";

describe("FillingStatusLine", () => {
  const defaultProps: FillingStatusLineProps = {
    id: "test-id",
    className: "test-class",
    statusDoneText: "Done",
    statusInterruptedText: "Interrupted",
    statusDone: true,
    statusInterrupted: false,
  };

  it("renders without error", () => {
    render(<FillingStatusLine {...defaultProps} />);
    expect(screen.getByTestId("filling-status-line")).toBeInTheDocument();
  });

  it("should render the FillingStatusAccordion components with correct props", () => {
    render(<FillingStatusLine {...defaultProps} />);
    mockData.forEach((data) => {
      expect(screen.getByText(data.role)).toBeInTheDocument();
      expect(screen.getByText(data.filledAndSignedDate)).toBeInTheDocument();
    });
  });

  it("should render status done text and icon when statusDone is true", () => {
    render(<FillingStatusLine {...defaultProps} />);

    expect(screen.getByText("Done")).toBeInTheDocument();
    const doneIcon = document.querySelector(".statusDoneIcon");
    expect(doneIcon).toBeInTheDocument();
    expect(doneIcon).toHaveClass("isDone");
  });

  it("should render status interrupted text and icon when statusInterrupted is true", () => {
    render(
      <FillingStatusLine
        {...defaultProps}
        statusDone={false}
        statusInterrupted
      />,
    );

    expect(screen.getByText("Interrupted")).toBeInTheDocument();
    expect(
      document.querySelector(".statusInterruptedIcon"),
    ).toBeInTheDocument();
  });
});
