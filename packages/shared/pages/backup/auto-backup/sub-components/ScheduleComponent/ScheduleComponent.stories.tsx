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

import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import { AutoBackupPeriod } from "@docspace/shared/enums";

import {
  periodsObject,
  weekdaysLabelArray,
  monthNumbersArray,
  hoursArray,
  maxNumberCopiesArray,
} from "../../mockData";

import ScheduleComponent from "./ScheduleComponent";

const meta = {
  title: "Pages/AutoBackup/ScheduleComponent",
  component: ScheduleComponent,
  parameters: {
    docs: {
      description: {
        component: "Schedule component for Auto Backup page",
      },
    },
  },
  argTypes: {
    selectedPeriodLabel: {
      control: "text",
      description: "Selected period label",
    },
    selectedWeekdayLabel: {
      control: "text",
      description: "Selected weekday label",
    },
    selectedHour: {
      control: "text",
      description: "Selected hour",
    },
    selectedMonthDay: {
      control: "text",
      description: "Selected day of month",
    },
    selectedMaxCopiesNumber: {
      control: "text",
      description: "Selected maximum number of copies",
    },
    selectedPeriodNumber: {
      control: "select",
      options: [
        AutoBackupPeriod.EveryDayType.toString(),
        AutoBackupPeriod.EveryWeekType.toString(),
        AutoBackupPeriod.EveryMonthType.toString(),
      ],
      description: "Selected period number",
    },
    isLoadingData: {
      control: "boolean",
      description: "Loading state of the component",
    },
  },
  args: {
    selectedPeriodLabel: "Every day",
    selectedWeekdayLabel: "Monday",
    selectedHour: "12:00",
    selectedMonthDay: "1",
    selectedMaxCopiesNumber: "3",
    selectedPeriodNumber: AutoBackupPeriod.EveryDayType.toString(),
    isLoadingData: false,
    periodsObject,
    weekdaysLabelArray,
    monthNumbersArray,
    hoursArray,
    maxNumberCopiesArray,
    setMaxCopies: action("setMaxCopies"),
    setPeriod: action("setPeriod"),
    setWeekday: action("setWeekday"),
    setMonthNumber: action("setMonthNumber"),
    setTime: action("setTime"),
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "20px", maxWidth: "600px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ScheduleComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    isLoadingData: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Schedule component in loading state with disabled inputs",
      },
    },
  },
};
