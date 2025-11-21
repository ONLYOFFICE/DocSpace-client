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
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, act, render } from "@testing-library/react";
import { Toast } from ".";
import { toastr } from "./sub-components/Toastr";

vi.useFakeTimers();

describe("<Toast />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any existing toasts and reset timers
    toastr.clear();
    vi.clearAllTimers();
  });

  afterEach(() => {
    // Cleanup after each test
    act(() => {
      toastr.clear();
      vi.runAllTimers();
    });
  });

  it("shows success toast", () => {
    render(<Toast />);

    act(() => {
      toastr.success("Success message", "Success");
    });

    expect(screen.getByText("Success message")).toBeInTheDocument();
    expect(screen.getByText("Success")).toBeInTheDocument();
  });

  it("shows error toast", () => {
    render(<Toast />);

    act(() => {
      toastr.error("Error message", "Error");
    });

    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("shows warning toast", () => {
    render(<Toast />);

    act(() => {
      toastr.warning("Warning message", "Warning");
    });

    expect(screen.getByText("Warning message")).toBeInTheDocument();
    expect(screen.getByText("Warning")).toBeInTheDocument();
  });

  it("shows info toast", () => {
    render(<Toast />);

    act(() => {
      toastr.info("Info message", "Info");
    });

    expect(screen.getByText("Info message")).toBeInTheDocument();
    expect(screen.getByText("Info")).toBeInTheDocument();
  });

  it("shows toast with close button when withCross is true", () => {
    render(<Toast />);

    act(() => {
      toastr.success("With close button", "Title", 5000, true);
    });

    expect(screen.getByText("With close button")).toBeInTheDocument();
    expect(document.querySelector(".closeButton")).toBeInTheDocument();
  });

  it("handles error object with response data", () => {
    render(<Toast />);

    const errorObj = {
      response: {
        data: {
          error: {
            message: "API Error",
          },
        },
      },
    };

    act(() => {
      toastr.error(errorObj);
    });

    expect(screen.getByText("API Error")).toBeInTheDocument();
  });

  it("accepts custom React elements as content", () => {
    render(<Toast />);

    act(() => {
      toastr.success(<div data-testid="custom-content">Custom Element</div>);
    });

    expect(screen.getByTestId("custom-content")).toBeInTheDocument();
  });

  it("stays open when timeout is 0", () => {
    render(<Toast />);

    act(() => {
      toastr.success("Persistent message", "Title", 0);
    });

    expect(screen.getByText("Persistent message")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByText("Persistent message")).toBeInTheDocument();
  });

  it("handles multiple toasts simultaneously", () => {
    render(<Toast />);

    act(() => {
      toastr.success("Success message", "Success");
      toastr.error("Error message", "Error");
      toastr.warning("Warning message", "Warning");
    });

    expect(screen.getByText("Success message")).toBeInTheDocument();
    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(screen.getByText("Warning message")).toBeInTheDocument();
  });

  it("checks toast active status", () => {
    render(<Toast />);

    let toastId: string | number;

    act(() => {
      toastId = toastr.success("Active toast") as string | number;

      expect(toastr.isActive(toastId)).toBe(true);
    });

    act(() => {
      toastr.clear();

      expect(toastr.isActive(toastId)).toBe(false);
    });
  });

  it("handles empty array as toast content", () => {
    render(<Toast />);

    act(() => {
      toastr.success([]);
    });

    // Toast should still be created but with empty content
    expect(document.querySelector(".Toastify__toast")).toBeInTheDocument();
  });

  it("handles server-side rendering", () => {
    render(<Toast isSSR />);

    // Component should not render on server
    expect(
      document.querySelector("[data-testid='toast']"),
    ).not.toBeInTheDocument();
  });
});
