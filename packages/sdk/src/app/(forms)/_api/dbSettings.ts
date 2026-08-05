/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { request } from "@docspace/shared/api/client";

type DbFormData = {
  databaseType: string;
  host: string;
  port: string;
  databaseName: string;
  user: string;
  password: string;
  useSsl: boolean;
};

type ConsumerProp = { name: string; value: string };
type Consumer = { name: string; props: ConsumerProp[] };

export const saveDbConfig = (form: DbFormData) => {
  const props = [
    { name: "databaseType", value: form.databaseType.toLowerCase() },
    { name: "dbHost", value: form.host },
    { name: "dbPort", value: form.port },
    { name: "dbName", value: form.databaseName },
    { name: "dbUser", value: form.user },
    { name: "dbPassword", value: form.password },
    { name: "dbSsl", value: String(form.useSsl) },
  ];

  return request<boolean>({
    method: "post",
    url: "/settings/authservice",
    data: { name: "externaldb", props },
  });
};

type TestDbResult = {
  success: boolean;
  error?: string;
};

export const testDbConnection = (form: DbFormData) => {
  return request<TestDbResult>({
    method: "post",
    url: "/settings/authservice/externaldb/test",
    data: {
      databaseType: form.databaseType.toLowerCase(),
      dbHost: form.host,
      dbPort: Number(form.port),
      dbName: form.databaseName,
      dbUser: form.user,
      dbPassword: form.password,
      dbSsl: form.useSsl,
    },
  });
};

export const setRoomFormSettings = (
  roomId: string | number,
  settings: {
    sendFormToExternalDB?: boolean;
    saveFormAsXLSX?: boolean;
  },
) => {
  return request({
    method: "put",
    url: `/files/rooms/${roomId}`,
    data: {
      ...(settings.sendFormToExternalDB !== undefined && {
        SendFormToExternalDB: settings.sendFormToExternalDB,
      }),
      ...(settings.saveFormAsXLSX !== undefined && {
        SaveFormAsXLSX: settings.saveFormAsXLSX,
      }),
    },
  });
};

export const loadRoomFormSettings = async (
  roomId: string | number,
): Promise<{ sendFormToExternalDB: boolean; saveFormAsXLSX: boolean }> => {
  const room = await request<{
    sendFormToExternalDB?: boolean;
    saveFormAsXLSX?: boolean;
  }>({
    method: "get",
    url: `/files/rooms/${roomId}`,
  });

  return {
    sendFormToExternalDB: room?.sendFormToExternalDB ?? false,
    saveFormAsXLSX: room?.saveFormAsXLSX ?? false,
  };
};

export const exportFileAsXlsx = (fileId: number | string) => {
  return request<{ link: string }>({
    method: "post",
    url: `/files/file/${fileId}/xlsx`,
  });
};

export const loadDbConfig = async (): Promise<ConsumerProp[] | null> => {
  const consumers = await request<Consumer[]>({
    method: "get",
    url: "/settings/authservice",
  });

  if (!consumers) return null;

  const externalDb = consumers.find((c) => c.name === "externaldb");
  return externalDb?.props ?? null;
};
