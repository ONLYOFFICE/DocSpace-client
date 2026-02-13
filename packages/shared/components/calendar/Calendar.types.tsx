// (c) Copyright Ascensio System SIA 2009-2026
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

import type { DateTime } from "luxon";

export interface CalendarProps {
  /** Class name */
  className?: string;
  /** Used as HTML `id` property  */
  id?: string;
  /** Specifies the calendar locale */
  locale: string;
  /** Value of selected date (DateTime object) */
  selectedDate: DateTime;
  /** Allows handling the changing events of the component */
  onChange?: (formattedDate: DateTime) => void;
  /** Changes the selected date state */
  setSelectedDate?: (formattedDate: DateTime) => void;
  /** Specifies the minimum selectable date */
  minDate?: DateTime | Date;
  /** Specifies the maximum selectable date */
  maxDate?: DateTime | Date;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** First shown date */
  initialDate?: DateTime | Date;
  isMobile?: boolean;
  forwardedRef?: React.RefObject<HTMLDivElement | null>;
  isScroll?: boolean;
  /** Data test id for testing */
  dataTestId?: string;
  useMaxTime?: boolean;
}

export interface DaysProps {
  observedDate: DateTime;
  setObservedDate: React.Dispatch<React.SetStateAction<DateTime>>;
  setSelectedScene: React.Dispatch<React.SetStateAction<number>>;
  handleDateChange: (date: DateTime) => void;
  selectedDate: DateTime;
  minDate: DateTime;
  maxDate: DateTime;
  isMobile: boolean;
  isScroll?: boolean;
}

export interface DaysHeaderProps {
  observedDate: DateTime;
  setObservedDate: React.Dispatch<React.SetStateAction<DateTime>>;
  setSelectedScene: React.Dispatch<React.SetStateAction<number>>;
  minDate: DateTime;
  maxDate: DateTime;
  isMobile: boolean;
}

export interface DaysBodyProps {
  observedDate: DateTime;
  handleDateChange: (date: DateTime) => void;
  selectedDate: DateTime;
  minDate: DateTime;
  maxDate: DateTime;
  isMobile: boolean;
  isScroll?: boolean;
}

export interface HeaderButtonsProps {
  onLeftClick: React.MouseEventHandler<HTMLButtonElement>;
  onRightClick: React.MouseEventHandler<HTMLButtonElement>;
  isLeftDisabled: boolean;
  isRightDisabled: boolean;
  isMobile: boolean;
}

export interface MonthsProps {
  observedDate: DateTime;
  setObservedDate: React.Dispatch<React.SetStateAction<DateTime>>;
  selectedDate: DateTime;
  setSelectedScene: React.Dispatch<React.SetStateAction<number>>;
  minDate: DateTime;
  maxDate: DateTime;
  isMobile: boolean;
  isScroll?: boolean;
}

export interface MonthsBodyProps {
  observedDate: DateTime;
  setObservedDate: React.Dispatch<React.SetStateAction<DateTime>>;
  selectedDate: DateTime;
  setSelectedScene: React.Dispatch<React.SetStateAction<number>>;
  minDate: DateTime;
  maxDate: DateTime;
  isMobile: boolean;
  isScroll?: boolean;
}

export interface MonthsHeaderProps {
  observedDate: DateTime;
  setObservedDate: React.Dispatch<React.SetStateAction<DateTime>>;
  setSelectedScene: React.Dispatch<React.SetStateAction<number>>;
  minDate: DateTime;
  maxDate: DateTime;
  isMobile: boolean;
}

export interface YearsProps {
  observedDate: DateTime;
  setObservedDate: React.Dispatch<React.SetStateAction<DateTime>>;
  selectedDate: DateTime;
  setSelectedScene: React.Dispatch<React.SetStateAction<number>>;
  minDate: DateTime;
  maxDate: DateTime;
  isMobile: boolean;
  isScroll?: boolean;
}

export interface YearsHeaderProps {
  observedDate: DateTime;
  setObservedDate: React.Dispatch<React.SetStateAction<DateTime>>;
  minDate: DateTime;
  maxDate: DateTime;
  isMobile: boolean;
}
