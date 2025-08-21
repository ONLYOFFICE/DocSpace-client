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
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { PlayerBigPlayButton } from ".";

// Mock BigIconPlay SVG component
jest.mock("PUBLIC_DIR/images/media.bgplay.react.svg", () => {
  const DummyBigIconPlay = ({
    ref,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & {
    ref?: React.RefObject<HTMLDivElement>;
  }) => (
    <div {...props} ref={ref}>
      Play Icon
    </div>
  );
  DummyBigIconPlay.displayName = "BigIconPlay";
  return DummyBigIconPlay;
});

// Mock styles
jest.mock("./sub-components/PlayerBigPlayButton.module.scss", () => ({
  wrapper: "wrapper",
}));

describe("PlayerBigPlayButton", () => {
  const defaultProps = {
    visible: true,
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly when visible", () => {
    render(<PlayerBigPlayButton {...defaultProps} />);

    const button = screen.getByTestId("player-big-play-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("wrapper");
    expect(button).toHaveAttribute("aria-label", "Play media");

    const icon = screen.getByTestId("play-icon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("role", "presentation");
  });

  it("does not render when not visible", () => {
    render(<PlayerBigPlayButton {...defaultProps} visible={false} />);
    expect(
      screen.queryByTestId("player-big-play-button"),
    ).not.toBeInTheDocument();
  });

  it("prevents context menu", () => {
    render(<PlayerBigPlayButton {...defaultProps} />);

    const button = screen.getByTestId("player-big-play-button");
    const mockEvent = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
    });

    Object.defineProperty(mockEvent, "preventDefault", {
      value: jest.fn(),
    });

    fireEvent(button, mockEvent);
    expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
  });
});
