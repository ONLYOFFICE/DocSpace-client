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

import {
  bucket,
  REGION,
  SERVICE_URL,
  FORCEPATH_STYLE,
  USE_HTTP,
  SSE,
  SSE_S3,
  filePath,
} from "./AmazonSettings.constants";

export const mockStorageRegions = [
  {
    displayName: "US East (N. Virginia)",
    systemName: "us-east-1",
  },
  {
    displayName: "US East (Ohio)",
    systemName: "us-east-2",
  },
  {
    displayName: "US West (Oregon)",
    systemName: "us-west-2",
  },
  {
    displayName: "Europe (Ireland)",
    systemName: "eu-west-1",
  },
  {
    displayName: "Europe (Frankfurt)",
    systemName: "eu-central-1",
  },
];

export const mockSelectedStorage = {
  id: "1",
  title: "Amazon S3",
  tenantId: "1",
  isSet: true,
  isThirdParty: true,
  properties: [
    {
      name: "bucket",
      title: "Bucket",
      value: "my-test-bucket",
    },
    {
      name: "accessKey",
      title: "Access Key",
      value: "AKIAIOSFODNN7EXAMPLE",
    },
    {
      name: "region",
      title: "Region",
      value: "eu-central-1",
    },
  ],
};

export const mockFormSettings = {
  [bucket]: "my-test-bucket",
  [REGION]: "eu-central-1",
  [SERVICE_URL]: "s3.amazonaws.com",
  [FORCEPATH_STYLE]: "true",
  [USE_HTTP]: "false",
  [SSE]: SSE_S3,
  [filePath]: "backup",
};

export const mockErrorsFields = {
  [bucket]: false,
  [REGION]: false,
  [SERVICE_URL]: false,
  [filePath]: false,
};
