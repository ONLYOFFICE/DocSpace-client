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
import { screen, fireEvent, waitFor, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { WhiteLabel } from ".";
import { DeviceType, WhiteLabelLogoType } from "../../../enums";
import { mockLogos } from "./mockData";

jest.mock("../../../hooks/useResponsiveNavigation", () => ({
  useResponsiveNavigation: jest.fn(),
}));

jest.mock("./WhiteLabel.helper", () => ({
  ...jest.requireActual("./WhiteLabel.helper"),
  generateLogo: () => "data:image/png;base64,mockedBase64Data",
  uploadLogo: jest.fn().mockResolvedValue({
    data: {
      Success: true,
      Message: "https://example.com/uploaded-logo.png",
    },
  }),
}));

const defaultProps = {
  t: (key: string) => key,
  isSettingPaid: true,
  logoUrls: mockLogos,
  showAbout: true,
  showNotAvailable: false,
  standalone: false,
  onSave: jest.fn(),
  onRestoreDefault: jest.fn(),
  isSaving: false,
  enableRestoreButton: true,
  deviceType: DeviceType.desktop,
  setLogoUrls: jest.fn(),
  isWhiteLabelLoaded: true,
  defaultLogoText: "Default Logo",
  defaultWhiteLabelLogoUrls: mockLogos,
  logoText: "Test Logo",
};

describe("<WhiteLabel />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it("updates logo text when input changes", () => {
    render(<WhiteLabel {...defaultProps} />);

    const logoTextInput = screen.getByTestId("logo-text-input");
    fireEvent.change(logoTextInput, { target: { value: "New Logo Text" } });

    expect(logoTextInput).toHaveValue("New Logo Text");
  });

  it("calls onSave when save button is clicked", () => {
    const onSave = jest.fn();

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
    const onRestoreDefault = jest.fn();
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

  it("onUseTextAsLogo should update logos with text-based logos", () => {
    const mockSetLogoUrls = jest.fn();
    const props = {
      ...defaultProps,
      setLogoUrls: mockSetLogoUrls,
    };

    render(<WhiteLabel {...props} />);

    const input = screen.getByTestId("logo-text-input");
    const button = screen.getByTestId("generate-logo-button");

    fireEvent.change(input, { target: { value: "Test" } });
    fireEvent.click(button);

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
    const mockSetLogoUrls = jest.fn();
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
