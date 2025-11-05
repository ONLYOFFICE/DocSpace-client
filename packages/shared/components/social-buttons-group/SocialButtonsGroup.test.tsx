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
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { SocialButtonsGroup } from ".";
import type { SocialButtonProps } from "./SocialButtonsGroup.types";

describe("<SocialButtonsGroup />", () => {
  const baseProps: SocialButtonProps = {
    providers: [
      { provider: "google", url: "google.com", linked: false },
      { provider: "facebook", url: "facebook.com", linked: false },
    ],
    t: (key: string) => key,
    onClick: vi.fn(),
    isDisabled: false,
  };

  it("renders without error", () => {
    const { container } = render(<SocialButtonsGroup {...baseProps} />);
    expect(container).toBeTruthy();
  });

  it("renders correct number of social buttons", () => {
    const { container } = render(<SocialButtonsGroup {...baseProps} />);
    expect(container.querySelectorAll(".social-button")).toHaveLength(2);
  });

  it("handles click events", () => {
    const { container } = render(<SocialButtonsGroup {...baseProps} />);
    const button = container.querySelector(".social-button");
    if (button) fireEvent.click(button);
    expect(baseProps.onClick).toHaveBeenCalled();
  });
});
