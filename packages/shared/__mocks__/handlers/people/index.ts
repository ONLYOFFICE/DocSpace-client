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
  selfHandler,
  selfUpdateHandler,
  selfDeleteHandler,
  selfChangeAuthDataHandler,
  selfActivationStatusHandler,
  selfGetByEmailHandler,
  selfAddGuestHandler,
  createUserHandler,
  updateUserCultureHandler,
  selfByTypeHandler,
  selfHandlerWithCulture,
  userExistsHandler,
} from "./self";
export type { UserType } from "./self";
import { thirdPartyProvidersHandler } from "./thirdPartyProviders";
import { peopleHandler } from "./people";
import { peopleListHandler, peopleListAccessDeniedHandler } from "./list";
import { themeProviderHandler } from "./theme";
import { userPhotoHandler } from "./userPhoto";

export {
  selfHandler,
  selfUpdateHandler,
  selfDeleteHandler,
  selfChangeAuthDataHandler,
  selfActivationStatusHandler,
  selfGetByEmailHandler,
  selfAddGuestHandler,
  createUserHandler,
  thirdPartyProvidersHandler,
  peopleHandler,
  peopleListHandler,
  peopleListAccessDeniedHandler,
  updateUserCultureHandler,
  selfByTypeHandler,
  selfHandlerWithCulture,
  themeProviderHandler,
  userPhotoHandler,
  userExistsHandler,
};

export const peopleHandlers = (port: string) => [
  selfActivationStatusHandler(port),
  selfHandler(port),
  selfDeleteHandler(port),
  selfChangeAuthDataHandler(port),
  selfGetByEmailHandler(port),
  selfAddGuestHandler(port),
  selfUpdateHandler(port),
  thirdPartyProvidersHandler(port),
  createUserHandler(port),
  updateUserCultureHandler(port),
  selfByTypeHandler(port),
  peopleListHandler(port),
  peopleListAccessDeniedHandler(port),
  themeProviderHandler(port),
  userPhotoHandler(port),
  userExistsHandler(port),
];
