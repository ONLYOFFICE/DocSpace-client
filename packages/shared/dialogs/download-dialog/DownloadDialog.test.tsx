/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

import DownloadDialog from "./index";
import type { TFileConvertId } from "./DownloadDialog.types";
import {
  extsConvertible,
  files,
  sortedDownloadFiles,
  sortedDownloadFilesReadyToDownload,
  sortedFiles,
  sortedPasswordFiles,
} from "./mockData";

jest.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: (i18nKey: string) => i18nKey,
      ready: true,
    };
  },
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

describe("DownloadDialog", () => {
  const defaultProps = {
    sortedFiles,
    setDownloadItems: () => {},
    downloadItems: [],
    downloadFiles: jest.fn(),
    getDownloadItems: () =>
      [
        [
          {
            key: 1,
            value: "value",
          },
        ],
        [1],
        null,
      ] as [TFileConvertId[], number[], string | null],
    isAllPasswordFilesSorted: true,
    needPassword: false,
    isOnePasswordFile: false,
    sortedPasswordFiles: [],
    updateDownloadedFilePassword: () => {},
    sortedDownloadFiles: {
      other: [],
      password: [],
      remove: [],
      original: [],
    },
    resetDownloadedFileFormat: () => {},
    discardDownloadedFile: () => {},
    visible: true,
    setDownloadDialogVisible: jest.fn(),
    setSortedPasswordFiles: () => {},
    getIcon: () => "",
    getFolderIcon: () => "",
    extsConvertible,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without errors", () => {
    render(<DownloadDialog {...defaultProps} />);
    expect(screen.getByTestId("modal")).toBeInTheDocument();
  });

  it("calls download callback", () => {
    render(<DownloadDialog {...defaultProps} />);

    const downloadButton = screen.getByText("Common:Download");
    fireEvent.click(downloadButton);
    expect(defaultProps.downloadFiles).toHaveBeenCalled();
  });

  it("calls callback setDownloadDialogVisible with false when click on cancel button", () => {
    render(<DownloadDialog {...defaultProps} />);

    const downloadButton = screen.getByText("Common:CancelButton");
    fireEvent.click(downloadButton);
    expect(defaultProps.setDownloadDialogVisible).toHaveBeenCalledWith(false);
  });

  it("renders password content without errors", () => {
    const newProps = {
      ...defaultProps,
      sortedDownloadFiles,
      sortedPasswordFiles,
    };

    render(<DownloadDialog {...newProps} />);

    expect(screen.getByTestId("password-content")).toBeInTheDocument();
  });

  it("renders password content with disabled continue button when there are protected files to be sorted for download", () => {
    const newProps = {
      ...defaultProps,
      sortedDownloadFiles,
      sortedPasswordFiles,
    };

    render(<DownloadDialog {...newProps} />);

    expect(screen.getByLabelText("Common:ContinueButton")).toBeDisabled();
  });

  it("renders password content with enabled continue button that calls download callback", () => {
    const newProps = {
      ...defaultProps,
      sortedDownloadFiles: sortedDownloadFilesReadyToDownload,
      sortedPasswordFiles,
      downloadItems: files,
    };

    render(<DownloadDialog {...newProps} />);

    const continueButton = screen.getByLabelText("Common:ContinueButton");

    expect(screen.getByLabelText("Common:ContinueButton")).toBeEnabled();
    fireEvent.click(continueButton);
    expect(defaultProps.downloadFiles).toHaveBeenCalled();
  });

  it("renders one password modal when only one protected file", () => {
    const newProps = {
      ...defaultProps,
      downloadItems: [sortedPasswordFiles[0]],
      sortedPasswordFiles: [sortedPasswordFiles[0]],
    };

    render(<DownloadDialog {...newProps} />);

    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByTestId("one-password-row-body")).toBeInTheDocument();
  });

  it("renders one password modal with disabled continue button when input is empty", () => {
    const newProps = {
      ...defaultProps,
      downloadItems: [sortedPasswordFiles[0]],
      sortedPasswordFiles: [sortedPasswordFiles[0]],
    };

    render(<DownloadDialog {...newProps} />);

    expect(screen.getByPlaceholderText("Common:EnterPassword")).toHaveValue("");
    expect(screen.getByLabelText("Common:ContinueButton")).toBeDisabled();
  });

  it("renders one password modal with enabled continue button that triggers download callback", async () => {
    const newProps = {
      ...defaultProps,
      downloadItems: [sortedPasswordFiles[0]],
      sortedPasswordFiles: [sortedPasswordFiles[0]],
    };

    render(<DownloadDialog {...newProps} />);

    const input = screen.getByPlaceholderText("Common:EnterPassword");
    await userEvent.type(input, "1234");

    const continueButton = screen.getByLabelText("Common:ContinueButton");

    expect(screen.getByLabelText("Common:ContinueButton")).toBeEnabled();
    fireEvent.click(continueButton);
    expect(defaultProps.downloadFiles).toHaveBeenCalled();
  });
});
