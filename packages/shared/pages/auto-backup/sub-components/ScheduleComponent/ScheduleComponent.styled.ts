// (c) Copyright Ascensio System SIA 2009-2024
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
import styled, { css } from "styled-components";
import { mobile } from "../../../../utils";
import type { StyledScheduleComponentProps } from "./ScheduleComponent.types";

const INPUT_LENGTH = "350px";

export const StyledScheduleComponent = styled.div<StyledScheduleComponentProps>`
  margin-inline-start: 24px;
  .days_option {
    grid-area: days;
    width: 100%;
    ${(props) =>
      (props.weeklySchedule || props.monthlySchedule) &&
      css`
        max-width: 138px;
      `};

    @media ${mobile} {
      grid-area: time;
      max-width: ${INPUT_LENGTH};
      width: 100%;
    }
  }
  .additional_options {
    max-width: ${INPUT_LENGTH};
    display: grid;
    grid-template-columns: ${(props) =>
      props.weeklySchedule || props.monthlySchedule ? "1fr 1fr" : "1fr"};
    grid-gap: 8px;
  }
  .weekly_option,
  .month_options {
    grid-area: weekly-monthly;
    width: 100%;
    max-width: "124px";

    @media ${mobile} {
      max-width: ${INPUT_LENGTH};
    }
  }
  .schedule-backup_combobox {
    display: inline-block;
    margin-top: 8px;
  }
  .main_options {
    max-width: 363px;

    max-width: ${INPUT_LENGTH};
    display: grid;
    ${(props) =>
      props.weeklySchedule || props.monthlySchedule
        ? css`
            grid-template-areas: "days weekly-monthly time";
            grid-template-columns: 1fr 1fr 1fr;
          `
        : css`
            grid-template-areas: "days  time";
            grid-template-columns: 1fr 1fr;
          `};
    grid-gap: 8px;

    @media ${mobile} {
      display: block;
    }
  }

  .time_options {
    grid-area: time;

    @media ${mobile} {
      max-width: ${INPUT_LENGTH};
    }
    width: 100%;
  }
  .max_copies {
    width: 100%;
    max-width: ${INPUT_LENGTH};
  }
  .combo-button {
    width: 100% !important;
  }
  .combo-button-label {
    max-width: 100% !important;
    font-weight: 400;
  }
  .schedule_description {
    font-weight: 600;
  }
  .schedule_help-section {
    display: flex;
    .schedule_help-button {
      margin-block: 3px 0;
      margin-inline: 4px 0;
    }
  }
`;
