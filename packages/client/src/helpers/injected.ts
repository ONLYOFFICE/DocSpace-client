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


import type { ComponentType } from "react";
import type { WithTranslation } from "react-i18next";

/**
 * Types a component wrapped in mobx-react's `inject` and react-i18next's
 * `withTranslation` by what a caller still has to pass.
 *
 * Both HOCs supply props at runtime and leave them in the component's type, so
 * the wrapped export asks its call sites for props they must not pass. That
 * was invisible until react-i18next 15: v14's `withTranslation` resolved the
 * wrapped props through the global `JSX` namespace, which React 19 removed, so
 * the resolved type quietly degraded to `any` and every call site
 * type-checked. v15 reads them through `React.JSX`, which works -- and turned
 * the check back on.
 *
 * Passing the inject mapper's return type as `Injected` keeps the public shape
 * correct on its own: inject one more prop and it drops out of the public type
 * too. `t`, `i18n` and `tReady` go with it, from `withTranslation`.
 *
 * The assertion is the point: no HOC signature can express "these props are
 * already filled in", so it is made once, here, instead of at each export.
 */
export const withoutInjected = <Props, Injected>(
  wrapped: unknown,
): ComponentType<Omit<Props, keyof Injected | keyof WithTranslation>> =>
  wrapped as ComponentType<
    Omit<Props, keyof Injected | keyof WithTranslation>
  >;
