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

import type {
  TAiProvider,
  TDefaultProvider,
  TModel,
} from "@docspace/shared/api/ai/types";

/**
 * Global cache for providers and models AI
 * Saved between unmounting components until the dialog is fully closed
 */
class ModelCache {
  private providers: TAiProvider[] | null = null;
  private modelsByProvider: Map<number, TModel[]> = new Map();
  private defaultProvider: TDefaultProvider | null = null;
  private aiServiceEnable: boolean = false;

  getProviders(): TAiProvider[] | null {
    return this.providers;
  }

  setProviders(providers: TAiProvider[]): void {
    this.providers = providers;
  }

  getModels(providerId: number): TModel[] | null {
    return this.modelsByProvider.get(providerId) || null;
  }

  setModels(providerId: number, models: TModel[]): void {
    this.modelsByProvider.set(providerId, models);
  }

  setDefaultProvider(defaultProvider: TDefaultProvider): void {
    this.defaultProvider = defaultProvider;
  }

  getDefaultProvider(): TDefaultProvider | null {
    return this.defaultProvider;
  }

  setAiServiceEnable(enable: boolean): void {
    this.aiServiceEnable = enable;
  }

  isAiServiceEnable(): boolean {
    return this.aiServiceEnable;
  }

  clear(): void {
    this.providers = null;
    this.modelsByProvider.clear();
    this.defaultProvider = null;
  }
}

export const modelCache = new ModelCache();

