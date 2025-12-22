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

import { BASE_URL, API_PREFIX } from "../../utils";

export const PATH_STORAGE_REGIONS = "settings/storage/s3/regions";

export const storageRegionsSuccess = {
  response: [
    {
      systemName: "af-south-1",
      originalSystemName: "af-south-1",
      displayName: "Africa (Cape Town)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "ap-east-1",
      originalSystemName: "ap-east-1",
      displayName: "Asia Pacific (Hong Kong)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "ap-northeast-1",
      originalSystemName: "ap-northeast-1",
      displayName: "Asia Pacific (Tokyo)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "ap-northeast-2",
      originalSystemName: "ap-northeast-2",
      displayName: "Asia Pacific (Seoul)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "ap-northeast-3",
      originalSystemName: "ap-northeast-3",
      displayName: "Asia Pacific (Osaka)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "ap-south-1",
      originalSystemName: "ap-south-1",
      displayName: "Asia Pacific (Mumbai)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "ap-south-2",
      originalSystemName: "ap-south-2",
      displayName: "Asia Pacific (Hyderabad)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "ap-southeast-1",
      originalSystemName: "ap-southeast-1",
      displayName: "Asia Pacific (Singapore)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "ap-southeast-2",
      originalSystemName: "ap-southeast-2",
      displayName: "Asia Pacific (Sydney)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "ap-southeast-3",
      originalSystemName: "ap-southeast-3",
      displayName: "Asia Pacific (Jakarta)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "ap-southeast-4",
      originalSystemName: "ap-southeast-4",
      displayName: "Asia Pacific (Melbourne)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "ap-southeast-5",
      originalSystemName: "ap-southeast-5",
      displayName: "Asia Pacific (Malaysia)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "ap-southeast-7",
      originalSystemName: "ap-southeast-7",
      displayName: "Asia Pacific (Thailand)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "ca-central-1",
      originalSystemName: "ca-central-1",
      displayName: "Canada (Central)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "ca-west-1",
      originalSystemName: "ca-west-1",
      displayName: "Canada West (Calgary)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "eu-central-1",
      originalSystemName: "eu-central-1",
      displayName: "Europe (Frankfurt)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "eu-central-2",
      originalSystemName: "eu-central-2",
      displayName: "Europe (Zurich)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "eu-north-1",
      originalSystemName: "eu-north-1",
      displayName: "Europe (Stockholm)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "eu-south-1",
      originalSystemName: "eu-south-1",
      displayName: "Europe (Milan)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "eu-south-2",
      originalSystemName: "eu-south-2",
      displayName: "Europe (Spain)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "eu-west-1",
      originalSystemName: "eu-west-1",
      displayName: "Europe (Ireland)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "eu-west-2",
      originalSystemName: "eu-west-2",
      displayName: "Europe (London)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "eu-west-3",
      originalSystemName: "eu-west-3",
      displayName: "Europe (Paris)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "il-central-1",
      originalSystemName: "il-central-1",
      displayName: "Israel (Tel Aviv)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "me-central-1",
      originalSystemName: "me-central-1",
      displayName: "Middle East (UAE)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "me-south-1",
      originalSystemName: "me-south-1",
      displayName: "Middle East (Bahrain)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "mx-central-1",
      originalSystemName: "mx-central-1",
      displayName: "Mexico (Central)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "sa-east-1",
      originalSystemName: "sa-east-1",
      displayName: "South America (Sao Paulo)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "us-east-1",
      originalSystemName: "us-east-1",
      displayName: "US East (N. Virginia)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "us-east-2",
      originalSystemName: "us-east-2",
      displayName: "US East (Ohio)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "us-west-1",
      originalSystemName: "us-west-1",
      displayName: "US West (N. California)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "us-west-2",
      originalSystemName: "us-west-2",
      displayName: "US West (Oregon)",
      partitionName: "aws",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "cn-north-1",
      originalSystemName: "cn-north-1",
      displayName: "China (Beijing)",
      partitionName: "aws-cn",
      partitionDnsSuffix: "amazonaws.com.cn",
    },
    {
      systemName: "cn-northwest-1",
      originalSystemName: "cn-northwest-1",
      displayName: "China (Ningxia)",
      partitionName: "aws-cn",
      partitionDnsSuffix: "amazonaws.com.cn",
    },
    {
      systemName: "us-gov-east-1",
      originalSystemName: "us-gov-east-1",
      displayName: "AWS GovCloud (US-East)",
      partitionName: "aws-us-gov",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "us-gov-west-1",
      originalSystemName: "us-gov-west-1",
      displayName: "AWS GovCloud (US-West)",
      partitionName: "aws-us-gov",
      partitionDnsSuffix: "amazonaws.com",
    },
    {
      systemName: "us-iso-east-1",
      originalSystemName: "us-iso-east-1",
      displayName: "US ISO East",
      partitionName: "aws-iso",
      partitionDnsSuffix: "c2s.ic.gov",
    },
    {
      systemName: "us-iso-west-1",
      originalSystemName: "us-iso-west-1",
      displayName: "US ISO WEST",
      partitionName: "aws-iso",
      partitionDnsSuffix: "c2s.ic.gov",
    },
    {
      systemName: "us-isob-east-1",
      originalSystemName: "us-isob-east-1",
      displayName: "US ISOB East (Ohio)",
      partitionName: "aws-iso-b",
      partitionDnsSuffix: "sc2s.sgov.gov",
    },
    {
      systemName: "eu-isoe-west-1",
      originalSystemName: "eu-isoe-west-1",
      displayName: "EU ISOE West",
      partitionName: "aws-iso-e",
      partitionDnsSuffix: "cloud.adc-e.uk",
    },
    {
      systemName: "us-isof-east-1",
      originalSystemName: "us-isof-east-1",
      displayName: "US ISOF EAST",
      partitionName: "aws-iso-f",
      partitionDnsSuffix: "csp.hci.ic.gov",
    },
    {
      systemName: "us-isof-south-1",
      originalSystemName: "us-isof-south-1",
      displayName: "US ISOF SOUTH",
      partitionName: "aws-iso-f",
      partitionDnsSuffix: "csp.hci.ic.gov",
    },
  ],
  count: 42,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_STORAGE_REGIONS}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const storageRegionsHandler = () => {
  return new Response(JSON.stringify(storageRegionsSuccess));
};
