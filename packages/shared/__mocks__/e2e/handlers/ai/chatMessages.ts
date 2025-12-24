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

import { API_PREFIX, BASE_URL } from "../../utils";

export const PATH_AI_CHAT_MESSAGES = "ai/chats/*/messages?*";

const successDefault = {
  response: [
    {
      id: 111,
      role: 1,
      contents: [
        {
          type: 0,
          text: "## Hi\n\nI’m here and ready to help inside DocSpace.\n\n## What you can do next\n- Ask about **rooms, folders, files, users, and permissions**\n- Describe a collaboration task (e.g., “set up a room for project X with view-only access for guests”), and I’ll guide you step by step",
        },
      ],
      createdOn: "2025-12-24T16:54:36.0000000+01:00",
    },
    {
      id: 110,
      role: 0,
      contents: [
        {
          type: 0,
          text: "Test message",
        },
      ],
      createdOn: "2025-12-24T16:54:34.0000000+01:00",
    },
  ],
  count: 2,
  total: 2,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_AI_CHAT_MESSAGES}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const successBaseElements = {
  response: [
    {
      id: 111,
      role: 1,
      contents: [
        {
          type: 0,
          text:
            "\n" +
            "# Level One Heading\n" +
            "\n" +
            "## Level Two Heading\n" +
            "\n" +
            "### Level Three Heading\n" +
            "\n" +
            "#### Level Four Heading\n" +
            "\n" +
            "##### Level Five Heading\n" +
            "\n" +
            "###### Level Six Heading\n" +
            "\n" +
            "Regular Paragraph\n" +
            "\n" +
            "[Link](https://example.com)\n" +
            "\n" +
            "> Quote\n" +
            "\n" +
            "1. Numbered List  \n" +
            "2. Numbered List  \n" +
            "3. Numbered List  \n" +
            "\n" +
            "- Bulleted List  \n" +
            "- Bulleted List  \n" +
            "- Bulleted List",
        },
      ],
      createdOn: "2025-12-24T16:54:36.0000000+01:00",
    },
    {
      id: 110,
      role: 0,
      contents: [
        {
          type: 0,
          text: "Test message",
        },
      ],
      createdOn: "2025-12-24T16:54:34.0000000+01:00",
    },
  ],
  count: 2,
  total: 2,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_AI_CHAT_MESSAGES}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const aiChatMessagesHandler = (
  type: "default" | "baseElements" = "default",
) => {
  switch (type) {
    case "baseElements":
      return new Response(JSON.stringify(successBaseElements));
    default:
      return new Response(JSON.stringify(successDefault));
  }
};
