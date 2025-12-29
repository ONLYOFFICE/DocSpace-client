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
export const PATH_AI_CHAT_MESSAGE_EXPORT = "ai/chats/*/messages/export";

const defaultTextContent =
  "## Hi\n\nI’m here and ready to help inside DocSpace.\n\n## What you can do next\n- Ask about **rooms, folders, files, users, and permissions**\n- Describe a collaboration task (e.g., “set up a room for project X with view-only access for guests”), and I’ll guide you step by step";

const baseElementsContent =
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
  "- Bulleted List";

const codeContent =
  "```js\n" +
  "function generateSequence(seed) {\n" +
  "  let value = seed ?? 1;\n" +
  "  const out = [];\n" +
  "  for (let i = 0; i < 10; i++) {\n" +
  "    value = (value * 1664525 + 1013904223) >>> 0;\n" +
  "    const normalized = value / 0xffffffff;\n" +
  "    out.push(Number(normalized.toFixed(6)));\n" +
  "  }\n" +
  "  const sum = out.reduce((a, b) => a + b, 0);\n" +
  "  const avg = sum / out.length;\n" +
  "  return { out, sum: Number(sum.toFixed(6)), avg: Number(avg.toFixed(6)) };\n" +
  "}\n" +
  "```";

const tableContent =
  "| Column 1 | Column 2 | Column 3 | Column 4 |\n" +
  "|---------:|----------|----------|----------|\n" +
  "| Row 1-1  | Row 1-2  | Row 1-3  | Row 1-4  |\n" +
  "| Row 2-1  | Row 2-2  | Row 2-3  | Row 2-4  |\n" +
  "| Row 3-1  | Row 3-2  | Row 3-3  | Row 3-4  |\n" +
  "| Row 4-1  | Row 4-2  | Row 4-3  | Row 4-4  |";

const successDefault = {
  response: [
    {
      id: 111,
      role: 1,
      contents: [
        {
          type: 0,
          text: defaultTextContent,
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
          text: baseElementsContent,
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

const successCodeBlock = {
  response: [
    {
      id: 111,
      role: 1,
      contents: [
        {
          type: 0,
          text: codeContent,
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

const successTable = {
  response: [
    {
      id: 111,
      role: 1,
      contents: [
        {
          type: 0,
          text: tableContent,
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

const successWebSearch = {
  response: [
    {
      id: 111,
      role: 1,
      contents: [
        {
          type: 1,
          name: "docspace_web_search",
          arguments: {
            query: "Lorem ipsum dolor sit amet",
          },
          result: {
            data: [
              {
                url: "https://www.example.com",
                text: "Lorem ipsum dolor sit amet",
                title: "Lorem ipsum dolor sit amet",
                faviconUrl: "/favicon.ico",
              },
              {
                url: "https://www.example.com",
                text: "Lorem ipsum dolor sit amet",
                title: "Lorem ipsum dolor sit amet",
                faviconUrl: "/favicon.ico",
              },
              {
                url: "https://www.example.com",
                text: "Lorem ipsum dolor sit amet",
                title: "Lorem ipsum dolor sit amet",
                faviconUrl: "/favicon.ico",
              },
              {
                url: "https://www.example.com",
                text: "Lorem ipsum dolor sit amet",
                title: "Lorem ipsum dolor sit amet",
                faviconUrl: "/favicon.ico",
              },
              {
                url: "https://www.example.com",
                text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris cursus ante in ipsum maximus porttitor",
                title:
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris cursus ante in ipsum maximus porttitor",
                faviconUrl: "/favicon.ico",
              },
            ],
          },
        },
        {
          type: 0,
          text: "Test ai message",
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

const errorWebSearch = {
  response: [
    {
      id: 111,
      role: 1,
      contents: [
        {
          type: 1,
          name: "docspace_web_search",
          arguments: {
            query: "Lorem ipsum dolor sit amet",
          },
          result: {
            error: "Error text",
          },
        },
        {
          type: 0,
          text: "Test ai message",
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

const successWebCrawling = {
  response: [
    {
      id: 111,
      role: 1,
      contents: [
        {
          type: 1,
          name: "docspace_web_crawling",
          arguments: {
            url: "https://example.com/",
            maxCharacters: 10000,
          },
          result: {
            data: {
              url: "https://chatgpt.com/",
              text: "Lorem ipsum dolor sit amet",
              title: "Lorem ipsum dolor sit amet",
              faviconUrl: "",
            },
          },
        },
        {
          type: 0,
          text: "Test ai message",
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

const errorWebCrawling = {
  response: [
    {
      id: 111,
      role: 1,
      contents: [
        {
          type: 1,
          name: "docspace_web_crawling",
          arguments: {
            url: "https://example.com/",
            maxCharacters: 10000,
          },
          result: {
            error: "Error text",
          },
        },
        {
          type: 0,
          text: "Test ai message",
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

const successKnowledgeSearch = {
  response: [
    {
      id: 111,
      role: 1,
      contents: [
        {
          type: 1,
          name: "docspace_knowledge_search",
          arguments: {
            query: "Lorem ipsum dolor sit amet",
          },
          result: {
            data: [
              {
                text: "Lorem ipsum dolor sit amet",
                title: "New document.docx",
                fileId: 1,
                relativeUrl: "/doceditor?fileid=5",
              },
              {
                text: "Lorem ipsum dolor sit amet",
                title: "New spreadsheet.xlsx",
                fileId: 2,
                relativeUrl: "/doceditor?fileid=5",
              },
              {
                text: "Lorem ipsum dolor sit amet",
                title: "New form.pdf",
                fileId: 3,
                relativeUrl: "/doceditor?fileid=5",
              },
              {
                text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris cursus ante in ipsum maximus porttitor",
                title: "New text file.txt",
                fileId: 4,
                relativeUrl: "/doceditor?fileid=10",
              },
            ],
          },
        },
        {
          type: 0,
          text: "Test ai message",
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

const errorKnowledgeSearch = {
  response: [
    {
      id: 111,
      role: 1,
      contents: [
        {
          type: 1,
          name: "docspace_knowledge_search",
          arguments: {
            query: "Lorem ipsum dolor sit amet",
          },
          result: {
            error: "Error text",
          },
        },
        {
          type: 0,
          text: "Test ai message",
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

const successMcpTool = {
  response: [
    {
      id: 111,
      role: 1,
      contents: [
        {
          type: 1,
          name: "mcp_tool_name",
          arguments: {
            key: "value",
          },
          result: {
            content: [
              {
                text: "{\n" + '  "key": "value"\n' + "}\n",
                type: "text",
              },
            ],
            structuredContent: {
              response: { key: "value" },
            },
          },
          mcpServerInfo: {
            serverId: "883da87d-5ae0-49fd-8cb9-2cb82181667e",
            serverName: "docspace",
            serverType: 1,
          },
        },
        {
          type: 0,
          text: "Test ai message",
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

const successMany = {
  response: [
    {
      id: 8,
      role: 1,
      contents: [
        {
          type: 0,
          text: tableContent,
        },
      ],
      createdOn: "2025-12-24T16:54:36.0000000+01:00",
    },
    {
      id: 7,
      role: 0,
      contents: [
        {
          type: 0,
          text: "Generate table",
        },
      ],
      createdOn: "2025-12-24T16:54:34.0000000+01:00",
    },
    {
      id: 6,
      role: 1,
      contents: [
        {
          type: 0,
          text: codeContent,
        },
      ],
      createdOn: "2025-12-24T16:54:36.0000000+01:00",
    },
    {
      id: 5,
      role: 0,
      contents: [
        {
          type: 0,
          text: "Generate code",
        },
      ],
      createdOn: "2025-12-24T16:54:34.0000000+01:00",
    },
    {
      id: 4,
      role: 1,
      contents: [
        {
          type: 0,
          text: baseElementsContent,
        },
      ],
      createdOn: "2025-12-24T16:54:36.0000000+01:00",
    },
    {
      id: 3,
      role: 0,
      contents: [
        {
          type: 0,
          text: "Generate base elements",
        },
      ],
      createdOn: "2025-12-24T16:54:34.0000000+01:00",
    },
    {
      id: 2,
      role: 1,
      contents: [
        {
          type: 0,
          text: defaultTextContent,
        },
      ],
      createdOn: "2025-12-24T16:54:36.0000000+01:00",
    },
    {
      id: 1,
      role: 0,
      contents: [
        {
          type: 0,
          text: "Generate text",
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

const successExportMessage = {
  count: 0,
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
  type:
    | "default"
    | "baseElements"
    | "codeBlock"
    | "table"
    | "many"
    | "webSearch"
    | "webSearchError"
    | "webCrawling"
    | "webCrawlingError"
    | "knowledgeSearch"
    | "knowledgeSearchError"
    | "mcpTool" = "default",
) => {
  switch (type) {
    case "mcpTool":
      return new Response(JSON.stringify(successMcpTool));
    case "knowledgeSearchError":
      return new Response(JSON.stringify(errorKnowledgeSearch));
    case "knowledgeSearch":
      return new Response(JSON.stringify(successKnowledgeSearch));
    case "webCrawlingError":
      return new Response(JSON.stringify(errorWebCrawling));
    case "webCrawling":
      return new Response(JSON.stringify(successWebCrawling));
    case "webSearchError":
      return new Response(JSON.stringify(errorWebSearch));
    case "webSearch":
      return new Response(JSON.stringify(successWebSearch));
    case "baseElements":
      return new Response(JSON.stringify(successBaseElements));
    case "codeBlock":
      return new Response(JSON.stringify(successCodeBlock));
    case "table":
      return new Response(JSON.stringify(successTable));
    case "many":
      return new Response(JSON.stringify(successMany));
    default:
      return new Response(JSON.stringify(successDefault));
  }
};

export const aiChatMessageExportHandler = () => {
  return new Response(JSON.stringify(successExportMessage));
};
