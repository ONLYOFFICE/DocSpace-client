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

import { headers } from "next/headers";

import { createRequest } from "@docspace/shared/utils/next-ssr-helper";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import {
  TGetRooms,
  type TValidateShareRoom,
} from "@docspace/shared/api/rooms/types";
import {
  roomListHandler,
  validatePublicRoomKeyHandler,
} from "@docspace/shared/__mocks__/e2e";

const IS_TEST = process.env.E2E_TEST;

export async function getRooms(
  filter: RoomsFilter,
  signal?: AbortSignal,
): Promise<TGetRooms | undefined> {
  let params;

  if (filter) {
    params = `?${filter.toApiUrlParams()}`;
  }

  const [req] = await createRequest(
    [`/files/rooms${params}`],
    [["", ""]],
    "GET",
    undefined,
    undefined,
    [signal],
  );

  const res = IS_TEST
    ? roomListHandler(await headers())
    : await fetch(req, { next: { revalidate: 300 } });

  if (!res.ok) return;

  const rooms = await res.json();

  return rooms.response;
}

export async function validatePublicRoomKey(key: string): Promise<{
  response: TValidateShareRoom;
  anonymousSessionKeyCookie?: string;
}> {
  const [req] = await createRequest([`/files/share/${key}`], [["", ""]], "GET");

  const res = IS_TEST ? validatePublicRoomKeyHandler() : await fetch(req);

  if (!res.ok) {
    throw new Error("Failed to validate public room key");
  }

  const validation = await res.json();
  const cookies = res.headers.get("set-cookie");
  const anonymousSessionKeyCookie = cookies
    ?.split(",")
    .find((c) => c.trim().startsWith("anonymous_session_key="));

  return {
    response: validation.response,
    anonymousSessionKeyCookie,
  };
}
