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

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PlayerSpeedControl } from "./index";

// Mock react-device-detect
jest.mock("react-device-detect", () => {
  let isMobileValue = false;
  return {
    get isMobileOnly() {
      return isMobileValue;
    },
    set __setMobileOnly(value: boolean) {
      isMobileValue = value;
    },
  };
});

// Mock styles
jest.mock("./PlayerSpeedControl.module.scss", () => ({
  wrapper: "wrapper",
  toast: "toast",
  dropdown: "dropdown",
  dropdownItem: "dropdownItem",
}));

describe("PlayerSpeedControl", () => {
  const defaultProps = {
    handleSpeedChange: jest.fn(),
    onMouseLeave: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    const deviceDetect = jest.requireMock("react-device-detect");
    // eslint-disable-next-line no-underscore-dangle
    deviceDetect.__setMobileOnly = false;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders speed control button with default speed", () => {
    render(<PlayerSpeedControl {...defaultProps} />);

    const button = screen.getByTestId("speed-control");
    expect(button).toBeInTheDocument();

    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-haspopup", "listbox");
  });

  it("opens speed menu on click in desktop mode", () => {
    render(<PlayerSpeedControl {...defaultProps} />);

    const button = screen.getByTestId("speed-control");
    fireEvent.click(button);

    const menu = screen.getByTestId("speed-menu");
    expect(menu).toBeInTheDocument();

    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("changes speed on option click", () => {
    render(<PlayerSpeedControl {...defaultProps} />);

    fireEvent.click(screen.getByTestId("speed-control"));
    fireEvent.click(screen.getByTestId("speed-option-X1.5"));

    expect(defaultProps.handleSpeedChange).toHaveBeenCalledWith(1.5);
    expect(defaultProps.onMouseLeave).toHaveBeenCalled();
  });
});
