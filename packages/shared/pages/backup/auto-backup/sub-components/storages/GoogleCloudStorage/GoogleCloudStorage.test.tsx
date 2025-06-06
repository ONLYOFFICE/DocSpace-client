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

import { AutoBackupPeriod } from "../../../../../../enums";
import { selectedStorages } from "../../../mockData";

import GoogleCloudStorage from "./GoogleCloudStorage";

jest.mock("../../../../../../components/google-cloud-settings", () => ({
  GoogleCloudSettings: () => <div>Google Cloud Settings Component</div>,
  formNames: () => ({
    bucket: "bucket",
    serviceAccount: "serviceAccount",
    filePath: "filePath",
  }),
}));

jest.mock("../../ScheduleComponent", () => ({
  ScheduleComponent: () => <div>Schedule Component</div>,
}));

const defaultProps = {
  isLoading: false,
  isLoadingData: false,
  isNeedFilePath: false,
  formSettings: {
    bucket: "my-gcloud-bucket",
    serviceAccount: "service-account@project-id.iam.gserviceaccount.com",
    filePath: "backups/",
  },
  errorsFieldsBeforeSafe: {},
  selectedStorage: selectedStorages.googleCloud,

  selectedPeriodLabel: "Every day",
  selectedWeekdayLabel: "Monday",
  selectedHour: "12:00",
  selectedMonthDay: "1",
  selectedMaxCopiesNumber: "3",
  selectedPeriodNumber: AutoBackupPeriod.EveryDayType.toString(),
  periodsObject: [
    { key: AutoBackupPeriod.EveryDayType, label: "Every day" },
    { key: AutoBackupPeriod.EveryWeekType, label: "Every week" },
    { key: AutoBackupPeriod.EveryMonthType, label: "Every month" },
  ],
  weekdaysLabelArray: [
    { key: 0, label: "Monday" },
    { key: 1, label: "Tuesday" },
  ],
  monthNumbersArray: Array(5)
    .fill(null)
    .map((_, index) => ({
      key: index + 1,
      label: `${index + 1}`,
    })),
  hoursArray: Array(5)
    .fill(null)
    .map((_, index) => ({
      key: index,
      label: `${index}:00`,
    })),
  maxNumberCopiesArray: [
    { key: 1, label: "Max 1 copy" },
    { key: 3, label: "Max 3 copies" },
  ],

  setCompletedFormFields: jest.fn(),
  addValueInFormSettings: jest.fn(),
  setRequiredFormSettings: jest.fn(),
  setIsThirdStorageChanged: jest.fn(),
  setMaxCopies: jest.fn(),
  setPeriod: jest.fn(),
  setWeekday: jest.fn(),
  setMonthNumber: jest.fn(),
  setTime: jest.fn(),
};

describe("GoogleCloudStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without errors", () => {
    render(<GoogleCloudStorage {...defaultProps} />);
    expect(screen.getByTestId("google-cloud-storage")).toBeInTheDocument();
  });
});
