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

import { http, HttpResponse } from "msw";

import { BASE_URL } from "../../utils";

const url = `${BASE_URL}/settings/encryption/progress`;

export type EncryptionHistoryItem = {
  id: string;
  date: string;
  status: string;
  percentage: number;
  startedAt: string;
  completedAt: string;
  initiatedBy: string;
  affectedFiles: number;
};

export const createGetEncryptionProgressHandler = ({
  progress = 0,
  error,
}: {
  progress?: number;
  error?: string;
}) =>
  http.get(url, () => {
    if (error) {
      // Return an error response that matches the expected format
      return HttpResponse.json(
        {
          error: { message: error },
        },
        { status: 500 },
      );
    }

    // Return the progress value in the expected format
    // The AxiosClient expects a 'response' property
    return HttpResponse.json({ response: progress });
  });

export const createGetEncryptionHistoryHandler = (
  historyData: EncryptionHistoryItem[],
) =>
  http.get(`${BASE_URL}/settings/encryption/history`, () => {
    // Return the history data in the expected format with a 'response' property
    return HttpResponse.json({ response: historyData });
  });
