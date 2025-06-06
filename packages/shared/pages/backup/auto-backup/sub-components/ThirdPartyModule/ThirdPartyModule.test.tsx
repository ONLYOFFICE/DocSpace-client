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
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { BackupStorageType } from "../../../../../enums";
import { ButtonSize } from "../../../../../components/button";

import { ThirdPartyModule } from "./index";
import {
  periodsObject,
  weekdaysLabelArray,
  monthNumbersArray,
  hoursArray,
  maxNumberCopiesArray,
  mockThirdPartyAccounts,
  mockThirdPartyProviders,
} from "../../mockData";

jest.mock("@docspace/shared/components/direct-third-party-connection", () => ({
  DirectThirdPartyConnection: jest.fn(() => (
    <div data-testid="direct-third-party-connection-mock" />
  )),
}));

describe("ThirdPartyModule", () => {
  const defaultProps = {
    // Basic props
    isError: false,
    isLoadingData: false,
    defaultStorageType: BackupStorageType.ResourcesModuleType.toString(),
    defaultFolderId: "folder-123",
    setSelectedFolder: jest.fn(),

    // DirectThirdPartyConnection props
    accounts: mockThirdPartyAccounts,
    basePath: "/",
    clearLocalStorage: jest.fn(),
    connectDialogVisible: false,
    connectedThirdPartyAccount: null,
    deleteThirdParty: jest.fn(),
    deleteThirdPartyDialogVisible: false,
    filesSelectorSettings: {
      getIcon: () => {},
    },
    isErrorPath: false,
    isTheSameThirdPartyAccount: false,
    newPath: "/",
    openConnectWindow: jest.fn(),
    providers: mockThirdPartyProviders,
    removeItem: mockThirdPartyAccounts[0],
    selectedThirdPartyAccount: mockThirdPartyAccounts[0],
    setBasePath: jest.fn(),
    setConnectDialogVisible: jest.fn(),
    setConnectedThirdPartyAccount: jest.fn(),
    setDeleteThirdPartyDialogVisible: jest.fn(),
    setNewPath: jest.fn(),
    setSelectedThirdPartyAccount: jest.fn(),
    setThirdPartyAccountsInfo: jest.fn(),
    setThirdPartyProviders: jest.fn(),
    toDefault: jest.fn(),
    buttonSize: ButtonSize.small,

    // ScheduleComponent props
    selectedPeriodLabel: "Every day",
    selectedWeekdayLabel: "Monday",
    selectedHour: "12:00",
    selectedMonthDay: "1",
    selectedMaxCopiesNumber: "3",
    selectedPeriodNumber: "0",
    periodsObject,
    weekdaysLabelArray,
    monthNumbersArray,
    hoursArray,
    maxNumberCopiesArray,
    setMaxCopies: jest.fn(),
    setPeriod: jest.fn(),
    setWeekday: jest.fn(),
    setMonthNumber: jest.fn(),
    setTime: jest.fn(),
  };

  it("renders without error", () => {
    render(<ThirdPartyModule {...defaultProps} />);
    expect(screen.getByTestId("third-party-module")).toBeInTheDocument();
  });

  it("calls setSelectedFolder with empty string when not default folder", () => {
    const setSelectedFolderMock = jest.fn();
    render(
      <ThirdPartyModule
        {...defaultProps}
        defaultStorageType={BackupStorageType.DocumentModuleType.toString()}
        setSelectedFolder={setSelectedFolderMock}
      />,
    );

    expect(setSelectedFolderMock).toHaveBeenCalledWith("");
  });

  it("calls setSelectedFolder with defaultFolderId when is resources default", () => {
    const setSelectedFolderMock = jest.fn();
    render(
      <ThirdPartyModule
        {...defaultProps}
        defaultStorageType={BackupStorageType.ResourcesModuleType.toString()}
        defaultFolderId="test-folder-id"
        setSelectedFolder={setSelectedFolderMock}
      />,
    );

    expect(setSelectedFolderMock).toHaveBeenCalledWith("test-folder-id");
  });
});
