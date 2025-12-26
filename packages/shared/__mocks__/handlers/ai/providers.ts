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

import { http } from "msw";
import { API_PREFIX, BASE_URL } from "../../e2e/utils";

export const PATH_AI_PROVIDERS = "ai/providers";

const successList = {
  response: [
    {
      id: 1,
      title: "Claude AI",
      type: 4,
      url: "https://api.anthropic.com/v1",
      createdOn: "2025-11-18T11:45:49.0000000+03:00",
      modifiedOn: "2025-11-18T11:46:00.0000000+03:00",
    },
    {
      id: 2,
      title: "OpenAI",
      type: 1,
      url: "https://api.openai.com/v1",
      createdOn: "2025-11-18T11:51:05.0000000+03:00",
      modifiedOn: "2025-11-18T11:51:05.0000000+03:00",
    },
    {
      id: 3,
      title: "Together AI",
      type: 2,
      url: "https://api.together.xyz/v1",
      createdOn: "2025-11-18T11:53:12.0000000+03:00",
      modifiedOn: "2025-11-18T11:53:33.0000000+03:00",
    },
    {
      id: 4,
      title: "OpenRouter",
      type: 5,
      url: "https://openrouter.ai/api/v1",
      createdOn: "2025-11-21T19:02:57.0000000+03:00",
      modifiedOn: "2025-11-21T19:17:12.0000000+03:00",
    },
  ],
  count: 4,
  total: 4,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_AI_PROVIDERS}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const aiProvidersHandler = () => {
  return http.get(`http://localhost/${API_PREFIX}/${PATH_AI_PROVIDERS}`, () => {
    return new Response(JSON.stringify(successList));
  });
};
