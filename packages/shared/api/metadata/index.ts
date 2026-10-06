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

import { request } from "../client";
import type {
  TAssignMetadataTemplatesRequest,
  TCustomField,
  TCustomFieldRequest,
  TEntryMetadata,
  TMetadataEntryKind,
  TMetadataField,
  TMetadataFieldRequest,
  TMetadataOperation,
  TMetadataTemplate,
  TMetadataTemplateRequest,
  TMetadataValueRequest,
} from "./types";

const baseUrl = "/files/metadata";

export async function getMetadataTemplates(
  visible?: boolean,
  signal?: AbortSignal,
) {
  const res = await request({
    method: "get",
    url: `${baseUrl}/templates`,
    params: visible === undefined ? undefined : { visible },
    signal,
  });

  return res as TMetadataTemplate[];
}

export async function createMetadataTemplate(data: TMetadataTemplateRequest) {
  const res = await request({
    method: "post",
    url: `${baseUrl}/templates`,
    data,
  });

  return res as TMetadataTemplate;
}

export async function updateMetadataTemplate(
  templateId: number,
  data: Partial<Pick<TMetadataTemplate, "name" | "visible">>,
) {
  const res = await request({
    method: "put",
    url: `${baseUrl}/templates/${templateId}`,
    data,
  });

  return res as TMetadataTemplate;
}

export async function deleteMetadataTemplate(templateId: number) {
  await request({
    method: "delete",
    url: `${baseUrl}/templates/${templateId}`,
  });
}

export async function createMetadataField(
  templateId: number,
  data: TMetadataFieldRequest,
) {
  const res = await request({
    method: "post",
    url: `${baseUrl}/templates/${templateId}/fields`,
    data,
  });

  return res as TMetadataField;
}

export async function updateMetadataField(
  templateId: number,
  fieldId: number,
  data: TMetadataFieldRequest,
) {
  const res = await request({
    method: "put",
    url: `${baseUrl}/templates/${templateId}/fields/${fieldId}`,
    data,
  });

  return res as TMetadataField;
}

export async function deleteMetadataField(templateId: number, fieldId: number) {
  await request({
    method: "delete",
    url: `${baseUrl}/templates/${templateId}/fields/${fieldId}`,
  });
}

export async function getEntryMetadata(
  kind: TMetadataEntryKind,
  entryId: number,
  signal?: AbortSignal,
) {
  const res = await request({
    method: "get",
    url: `${baseUrl}/${kind}/${entryId}`,
    signal,
  });

  return res as TEntryMetadata;
}

export async function assignMetadataTemplates(
  kind: TMetadataEntryKind,
  entryId: number,
  data: TAssignMetadataTemplatesRequest,
) {
  const res = await request({
    method: "put",
    url: `${baseUrl}/${kind}/${entryId}/templates`,
    data,
  });

  return (res ?? null) as TMetadataOperation | null;
}

export async function getMetadataCascadeProgress(folderId: number) {
  const res = await request({
    method: "get",
    url: `${baseUrl}/folder/${folderId}/templates/progress`,
  });

  return res as TMetadataOperation;
}

export async function unassignMetadataTemplate(
  kind: TMetadataEntryKind,
  entryId: number,
  templateId: number,
) {
  await request({
    method: "delete",
    url: `${baseUrl}/${kind}/${entryId}/templates/${templateId}`,
  });
}

export async function setMetadataValues(
  kind: TMetadataEntryKind,
  entryId: number,
  values: TMetadataValueRequest[],
) {
  const res = await request({
    method: "put",
    url: `${baseUrl}/${kind}/${entryId}/values`,
    data: { values },
  });

  return res as TEntryMetadata;
}

export async function setMetadataCustomFields(
  kind: TMetadataEntryKind,
  entryId: number,
  fields: TCustomFieldRequest[],
) {
  const res = await request({
    method: "put",
    url: `${baseUrl}/${kind}/${entryId}/customFields`,
    data: { fields },
  });

  return res as TCustomField[];
}
