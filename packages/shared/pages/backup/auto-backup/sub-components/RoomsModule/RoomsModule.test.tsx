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

import { BackupStorageType, DeviceType } from "../../../../../enums";

import { RoomsModule } from "./index";
import {
  periodsObject,
  weekdaysLabelArray,
  monthNumbersArray,
  hoursArray,
  maxNumberCopiesArray,
} from "../../mockData";

jest.mock("../../../../../components/files-selector-input", () => ({
  FilesSelectorInput: jest.fn(() => (
    <div data-testid="files-selector-input-mock" />
  )),
}));

describe("RoomsModule", () => {
  const defaultProps = {
    // Basic props
    isError: false,
    isLoadingData: false,
    setIsError: jest.fn(),

    // FilesSelectorInput props
    basePath: "/",
    newPath: "/",
    toDefault: jest.fn(),
    isErrorPath: false,
    setBasePath: jest.fn(),
    setNewPath: jest.fn(),
    settingsFileSelector: {
      getIcon: () => {},
    },
    currentDeviceType: DeviceType.desktop,

    // Backup store props
    defaultStorageType: BackupStorageType.DocumentModuleType.toString(),
    setSelectedFolder: jest.fn(),
    defaultFolderId: "folder-123",

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
    render(<RoomsModule {...defaultProps} />);
    expect(screen.getByTestId("rooms-module")).toBeInTheDocument();
  });
});
