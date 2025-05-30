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
