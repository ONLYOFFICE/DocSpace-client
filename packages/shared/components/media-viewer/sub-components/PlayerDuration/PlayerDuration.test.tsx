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

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlayerDuration } from "./index";

describe("PlayerDuration", () => {
  const defaultProps = {
    currentTime: 65, // 1:05
    duration: 180, // 3:00
  };

  it("renders correctly with default props", () => {
    render(<PlayerDuration {...defaultProps} />);

    const currentTime = screen.getByTestId("current-time");
    const totalDuration = screen.getByTestId("total-duration");

    expect(currentTime).toHaveTextContent("1:05");
    expect(totalDuration).toHaveTextContent("3:00");
  });

  it("renders zero values correctly", () => {
    render(<PlayerDuration currentTime={0} duration={0} />);

    const currentTime = screen.getByTestId("current-time");
    const totalDuration = screen.getByTestId("total-duration");

    expect(currentTime).toHaveTextContent("0:00");
    expect(totalDuration).toHaveTextContent("0:00");
  });

  it("renders long duration correctly", () => {
    render(
      <PlayerDuration
        currentTime={3665} // 1:01:05
        duration={7325} // 2:02:05
      />,
    );

    const currentTime = screen.getByTestId("current-time");
    const totalDuration = screen.getByTestId("total-duration");

    expect(currentTime).toHaveTextContent("1:01:05");
    expect(totalDuration).toHaveTextContent("2:02:05");
  });
});
