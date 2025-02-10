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

import { API_PREFIX, BASE_URL } from "../../utils";

export const PATH = "settings/tfaapp/setup";

const url = `${BASE_URL}/${API_PREFIX}/${PATH}`;

export const tfaAppSuccess = {
  response: {
    account: "mail@mail.com",
    manualEntryKey: "1234567891234567",
    qrCodeSetupImageUrl:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASIAAAEiCAYAAABdvt+2AAAABHNCSVQICAgIfAhkiAAABYFJREFUeJzt3EFu20AQAMEoyP+/rHxAhzU0QI+XVQ+QKJJu7GE8r/f7/f4DEPpbXwCAEAE5IQJyQgTkhAjICRGQEyIgJ0RAToiAnBABOSECckIE5IQIyAkRkBMiICdEQE6IgJwQATkhAnL/pj/w9XpNf+QVTleDT9+/6ZXkp9d3yyp07/Nn08/XiQjICRGQEyIgJ0RAToiAnBABOSECckIE5IQIyI1PVp8yefud6Unt08/bPqldTX57n7/jRATkhAjICRGQEyIgJ0RAToiAnBABOSECckIE5LLJ6lPbJ5dv+d5T1U7tW3ZlP+19PuVEBOSECMgJEZATIiAnREBOiICcEAE5IQJyQgTk1k9WP832yeXp7512ywT20zgRATkhAnJCBOSECMgJEZATIiAnREBOiICcEAE5k9XL3DIJbTczP+FEBOSECMgJEZATIiAnREBOiICcEAE5IQJyQgTk1k9Wm5T9zvYJ5+kd09t3VnufP3MiAnJCBOSECMgJEZATIiAnREBOiICcEAE5IQJy2WR1NfG73fZJY8/tM/flO05EQE6IgJwQATkhAnJCBOSECMgJEZATIiAnREBufLLaTt5dqucxPWm8ffc233EiAnJCBOSECMgJEZATIiAnREBOiICcEAE5IQJy45PV23ckb9/NvH2Sd/tzmzb9Plffu/15OBEBOSECckIE5IQIyAkRkBMiICdEQE6IgJwQAbnxyerK9IRpNSlbXd+p7dd36pbfMa36vU5EQE6IgJwQATkhAnJCBOSECMgJEZATIiAnREBu/WR1NTF9y67s7buKtz+36vq271af5kQE5IQIyAkRkBMiICdEQE6IgJwQATkhAnJCBOTWT1ZXtk8QV7ZP8ppw/p2ciICcEAE5IQJyQgTkhAjICRGQEyIgJ0RAToiAXDZZfctO6KepJr+9L9+pJs5POREBOSECckIE5IQIyAkRkBMiICdEQE6IgJwQAbnxyepq1/OpW3Yab5/4rSZ0q8nv6j3YvuP8lBMRkBMiICdEQE6IgJwQATkhAnJCBOSECMgJEZB7vaPRzO0Tptsnl09V92X7BPvTdm9v50QE5IQIyAkRkBMiICdEQE6IgJwQATkhAnJCBOTGd1ZXk61P25G8nZ3fn1W/91T1d+REBOSECMgJEZATIiAnREBOiICcEAE5IQJyQgTksp3Vp27ZQbx95/L2+3zqll3jler5OhEBOSECckIE5IQIyAkRkBMiICdEQE6IgJwQAbnxndXTtk/ybr++7bujt3/vtFt2ZdtZDVxHiICcEAE5IQJyQgTkhAjICRGQEyIgJ0RAbnyy2s7gz26ZwD41/XurCeztu7y3v1ennIiAnBABOSECckIE5IQIyAkRkBMiICdEQE6IgFy2s/qWidBqkrya+H3a5PwtE9Pbn5sTEZATIiAnREBOiICcEAE5IQJyQgTkhAjICRGQyyarT1UTodsnaqvdzNOfV93n7ZPG0/dv+38yOBEBOSECckIE5IQIyAkRkBMiICdEQE6IgJwQAbn1k9VPs33Cefv1nap+76ntO6unr8+JCMgJEZATIiAnREBOiICcEAE5IQJyQgTkhAjImaz+pbZP3p6qJqanTU9qb584n+ZEBOSECMgJEZATIiAnREBOiICcEAE5IQJyQgTk1k9WV5OelWpievt93j5pXO2EvuX5OhEBOSECckIE5IQIyAkRkBMiICdEQE6IgJwQAblssrrakbzd9knZ6et72nuw/bmdmv4dTkRAToiAnBABOSECckIE5IQIyAkRkBMiICdEQO713r7MFrieExGQEyIgJ0RAToiAnBABOSECckIE5IQIyAkRkBMiICdEQE6IgJwQATkhAnJCBOSECMgJEZATIiAnREDuPzjilVC09IXAAAAAAElFTkSuQmCC",
  },
  count: 1,
  links: [
    {
      href: url,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const tfaApp = (): Response => {
  return new Response(JSON.stringify(tfaAppSuccess));
};
