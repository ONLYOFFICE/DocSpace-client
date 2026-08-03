/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  screen,
  fireEvent,
  waitFor,
  render,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { WhiteLabel } from ".";
import { DeviceType, WhiteLabelLogoType } from "../../../enums";
import { mockLogos } from "./mockData";

vi.mock("../../../hooks/useResponsiveNavigation", () => ({
  useResponsiveNavigation: vi.fn(),
}));

vi.mock("./WhiteLabel.helper", async () => {
  const actualModule = await vi.importActual("./WhiteLabel.helper");
  return {
    ...actualModule,
    generateLogo: () => "data:image/png;base64,mockedBase64Data",
    uploadLogo: vi.fn().mockResolvedValue({
      data: {
        Success: true,
        Message: "https://example.com/uploaded-logo.png",
      },
    }),
  };
});

const defaultProps = {
  t: (key: string) => key,
  isSettingPaid: true,
  logoUrls: mockLogos,
  showAbout: true,
  standalone: false,
  onSave: vi.fn(),
  onRestoreDefault: vi.fn(),
  isSaving: false,
  enableRestoreButton: true,
  deviceType: DeviceType.desktop,
  setLogoUrls: vi.fn(),
  isWhiteLabelLoaded: true,
  defaultLogoText: "Default Logo",
  defaultWhiteLabelLogoUrls: mockLogos,
  logoText: "Test Logo",
};

describe("<WhiteLabel />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without error", () => {
    render(<WhiteLabel {...defaultProps} />);

    expect(screen.getByText("WhiteLabel")).toBeInTheDocument();
  });

  it("disables inputs when isSettingPaid is false", () => {
    render(<WhiteLabel {...defaultProps} isSettingPaid={false} />);

    const logoTextInput = screen.getByTestId("logo-text-input");
    expect(logoTextInput).toBeDisabled();
  });

  it("updates logo text when input changes", async () => {
    render(<WhiteLabel {...defaultProps} />);

    const logoTextInput = screen.getByTestId("logo-text-input");

    await act(async () => {
      fireEvent.change(logoTextInput, { target: { value: "New Logo Text" } });
    });

    expect(logoTextInput).toHaveValue("New Logo Text");
  });

  it("calls onSave when save button is clicked", () => {
    const onSave = vi.fn();

    const newLogoUrls = mockLogos.map((logo, i) => {
      return i === 0
        ? { ...logo, size: { ...logo.size, width: 999999 } }
        : logo;
    });

    render(
      <WhiteLabel {...defaultProps} logoUrls={newLogoUrls} onSave={onSave} />,
    );

    const saveButton = screen.getByTestId("white-label-save");
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalled();
  });

  it("calls onRestoreDefault when restore button is clicked", () => {
    const onRestoreDefault = vi.fn();
    render(
      <WhiteLabel {...defaultProps} onRestoreDefault={onRestoreDefault} />,
    );

    const restoreButton = screen.getByTestId("white-label-cancel");
    fireEvent.click(restoreButton);

    expect(onRestoreDefault).toHaveBeenCalled();
  });

  it("shows loading state when isSaving is true", () => {
    render(<WhiteLabel {...defaultProps} isSaving />);

    const saveButton = screen.getByTestId("white-label-save");
    expect(saveButton).toHaveAttribute("aria-busy", "true");
  });

  it("disables restore button when enableRestoreButton is false", () => {
    render(<WhiteLabel {...defaultProps} enableRestoreButton={false} />);

    const restoreButton = screen.getByTestId("white-label-cancel");
    expect(restoreButton).toBeDisabled();
  });

  it("onUseTextAsLogo should update logos with text-based logos", async () => {
    const mockSetLogoUrls = vi.fn();
    const props = {
      ...defaultProps,
      setLogoUrls: mockSetLogoUrls,
    };

    render(<WhiteLabel {...props} />);

    const input = screen.getByTestId("logo-text-input");
    const button = screen.getByTestId("generate-logo-button");

    await act(async () => {
      fireEvent.change(input, { target: { value: "Test" } });
      fireEvent.click(button);
    });

    expect(mockSetLogoUrls).toHaveBeenCalled();
    const updatedLogos = mockSetLogoUrls.mock.calls[0][0];
    expect(updatedLogos).toHaveLength(mockLogos.length);
    expect(updatedLogos[0].path.light).toBe(
      "data:image/png;base64,mockedBase64Data",
    );
    expect(updatedLogos[0].path.dark).toBe(
      "data:image/png;base64,mockedBase64Data",
    );
  });

  it("onChangeLogo should update logo when file is uploaded", async () => {
    const mockSetLogoUrls = vi.fn();
    const props = {
      ...defaultProps,
      setLogoUrls: mockSetLogoUrls,
    };

    render(<WhiteLabel {...props} />);

    const file = new File(["test"], "test.png", { type: "image/png" });
    const inputId = `logoUploader_${WhiteLabelLogoType.LightSmall}_light`;
    const logoName = "LightSmall";

    const input = screen.getByTestId(inputId);
    fireEvent.change(input, {
      target: {
        files: [file],
        id: inputId,
        name: logoName,
      },
    });

    await waitFor(() => {
      expect(mockSetLogoUrls).toHaveBeenCalled();
      const updatedLogos = mockSetLogoUrls.mock.calls[0][0];
      expect(updatedLogos).toHaveLength(mockLogos.length);
      expect(updatedLogos[0].path.light).toBe("data:image/png;base64,dGVzdA==");
    });
  });
});
