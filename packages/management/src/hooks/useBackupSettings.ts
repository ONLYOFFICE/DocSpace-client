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

"use client";

import { useCallback, useMemo, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";

import { AutoBackupPeriod } from "@docspace/shared/enums";
import type { TOption } from "@docspace/ui-kit/components/combobox";
import type { Nullable, TWeekdaysLabel } from "@docspace/shared/types";
import type { TBackupSchedule } from "@docspace/shared/api/portal/types";

import type { BackupDefaultStateType, BackupSelectedStateType } from "@/types";
import {
  initBackupDefaultState,
  initBackupSelectedState,
} from "@/lib/constants";

type BackupSettingsProps = {
  backupScheduleResponse: TBackupSchedule | undefined;
};

export const useBackupSettings = ({
  backupScheduleResponse,
}: BackupSettingsProps) => {
  const { t } = useTranslation(["Common"]);

  const [errorsFieldsBeforeSafe, setErrorsFormFields] = useState<
    Record<string, boolean>
  >({});
  const [isThirdStorageChanged, setIsThirdStorageChanged] =
    useState<boolean>(false);

  const [backupSchedule, setBackupSchedule] = useState<
    Nullable<TBackupSchedule>
  >(() => backupScheduleResponse ?? null);

  const [defaults, setDefaults] = useReducer(
    (state, action) => ({
      ...state,
      ...(typeof action === "function" ? action(state) : action),
    }),
    {
      ...initBackupDefaultState,

      periodLabel: t("Common:EveryDay"),
    },
  );

  const [selected, setSelected] = useReducer(
    (
      state: BackupSelectedStateType,
      action:
        | Partial<BackupSelectedStateType>
        | ((
            state: BackupSelectedStateType,
          ) => Partial<BackupSelectedStateType>),
    ): BackupSelectedStateType => ({
      ...state,
      ...(typeof action === "function" ? action(state) : action),
    }),
    {
      ...initBackupSelectedState,
      periodLabel: t("Common:EveryDay"),
    },
  );

  const setDefaultOptions = useCallback(
    (
      periodObj: TOption[],
      weekdayArr: TOption[],
      backupScheduleArg?: TBackupSchedule,
    ) => {
      const schedule = backupScheduleArg ?? backupSchedule;

      if (schedule) {
        const { storageType, cronParams, backupsStored, storageParams } =
          schedule;
        const { folderId, module, ...other } = storageParams;
        const { period, day, hour } = cronParams;

        const defaultFormSettings: Record<string, string> = {
          ...(folderId ? { folderId } : {}),
          ...other,
        };

        if (defaultFormSettings) {
          setSelected((state: BackupSelectedStateType) => ({
            ...state,
            formSettings: { ...defaultFormSettings },
          }));
          setDefaults((state: BackupDefaultStateType) => ({
            ...state,
            formSettings: { ...defaultFormSettings },
          }));

          setIsThirdStorageChanged(false);
        }

        const periodLabel = periodObj[period].label as string;
        const monthDay =
          period === AutoBackupPeriod.EveryDayType ||
          period === AutoBackupPeriod.EveryWeekType
            ? "1"
            : day.toString();

        setDefaults((state: BackupDefaultStateType) => ({
          ...state,
          day: day.toString(),
          hour: `${hour}:00`,
          periodNumber: period.toString(),
          maxCopiesNumber: backupsStored.toString(),
          storageType: storageType.toString(),
          folderId: module ? "" : folderId,
          enableSchedule: true,
          periodLabel,
          ...(module ? { storageId: module } : {}),
          monthDay,
        }));

        setSelected((state: BackupSelectedStateType) => ({
          ...state,
          day: day.toString(),
          hour: `${hour}:00`,
          periodNumber: period.toString(),
          maxCopiesNumber: backupsStored.toString(),
          storageType: storageType.toString(),
          folderId: module ? "" : folderId,
          enableSchedule: true,
          periodLabel,
          ...(module ? { storageId: module } : {}),
          monthDay,
        }));

        if (period === AutoBackupPeriod.EveryWeekType) {
          let weekDay: number = 0;

          if (day) {
            for (let i = 0; i < weekdayArr.length; i++) {
              if (+weekdayArr[i].key === day) {
                weekDay = i;
              }
            }
          }
          const weekdayLabel = weekdayArr[weekDay].label as string;

          setDefaults((state: BackupDefaultStateType) => ({
            ...state,
            weekday: day.toString(),
            weekdayLabel,
          }));
          setSelected((state: BackupSelectedStateType) => ({
            ...state,
            weekday: day.toString(),
            weekdayLabel,
          }));
        } else {
          const weekdayLabel = weekdayArr[0].label as string;
          const weekday = weekdayArr[0].key.toString();

          setDefaults((state: BackupDefaultStateType) => ({
            ...state,
            weekday,
            weekdayLabel,
          }));

          setSelected((state: BackupSelectedStateType) => ({
            ...state,
            weekday,
            weekdayLabel,
          }));
        }
      } else {
        const periodLabel = periodObj[+defaults.periodNumber].label as string;
        const weekdayLabel = weekdayArr[0].label as string;
        const weekday = weekdayArr[0].key.toString();

        setDefaults((state: BackupDefaultStateType) => ({
          ...state,
          weekday,
          periodLabel,
          weekdayLabel,
        }));
        setSelected({
          weekday,
          periodLabel,
          weekdayLabel,
        });
      }

      setIsThirdStorageChanged(false);
    },
    [backupSchedule, defaults.periodNumber],
  );

  const toDefault = useCallback(() => {
    const { formSettings, ...other } = defaults;

    setSelected({
      ...other,
      ...(formSettings ? { formSettings } : {}),
    });

    setIsThirdStorageChanged(false);
  }, [defaults]);

  const deleteSchedule = (weekdayArr: TWeekdaysLabel[]) => {
    setBackupSchedule(null);

    setDefaults((state: BackupDefaultStateType) => ({
      ...state,
      day: "0",
      hour: "12:00",
      periodNumber: "0",
      periodLabel: t("Common:EveryDay"),
      maxCopiesNumber: "10",
      storageType: "0",
      folderId: null,
      storageId: null,
      enableSchedule: false,
      monthDay: "1",
      weekday: weekdayArr[0].key.toString(),
      weekdayLabel: weekdayArr[0].label as string,
    }));

    setSelected((state: BackupSelectedStateType) => ({
      ...state,
      day: "0",
      hour: "12:00",
      periodNumber: "0",
      periodLabel: t("Common:EveryDay"),
      maxCopiesNumber: "10",
      storageType: "0",
      folderId: null,
      storageId: null,
      enableSchedule: false,
      monthDay: "1",
      weekday: weekdayArr[0].key.toString(),
      weekdayLabel: weekdayArr[0].label as string,
    }));

    setIsThirdStorageChanged(false);
  };

  const setMaxCopies = (option: TOption) => {
    setSelected((state: BackupSelectedStateType) => ({
      ...state,
      maxCopiesNumber: option.key.toString(),
    }));
  };

  const setPeriod = (options: TOption) => {
    const key = options.key;
    const label = options.label as string;

    setSelected((state: BackupSelectedStateType) => ({
      ...state,
      periodNumber: `${key}`,
      periodLabel: label,
    }));
  };

  const setWeekday = (options: TOption) => {
    const key = options.key;
    const label = options.label as string;

    setSelected((state: BackupSelectedStateType) => ({
      ...state,
      weekday: `${key}`,
      weekdayLabel: label,
    }));
  };

  const setMonthNumber = (options: TOption) => {
    const label = options.label as string;

    setSelected((state: BackupSelectedStateType) => ({
      ...state,
      monthDay: label,
    }));
  };

  const setTime = (options: TOption) => {
    const label = options.label as string;

    setSelected((state: BackupSelectedStateType) => ({
      ...state,
      hour: label,
    }));
  };

  const setCompletedFormFields = (
    values: Record<string, string>,
    module?: string,
  ) => {
    if (module && module === defaults.storageId) {
      setSelected((state: BackupSelectedStateType) => ({
        ...state,
        formSettings: { ...defaults.formSettings },
      }));
      return;
    }

    setSelected((state: BackupSelectedStateType) => ({
      ...state,
      formSettings: { ...values },
    }));
    setErrorsFormFields({});
  };

  const addValueInFormSettings = (name: string, value: string) => {
    setSelected((prevState: BackupSelectedStateType) => {
      const { formSettings } = prevState;

      const newFormSettings = { ...formSettings, [name]: value };

      return {
        formSettings: newFormSettings,
      };
    });
  };

  const deleteValueFormSetting = (key: string) => {
    setSelected((state: BackupSelectedStateType) => {
      const newSettings = { ...state.formSettings };
      delete newSettings[key];
      return {
        formSettings: newSettings,
      };
    });
  };

  const setStorageId = (id: Nullable<string>) => {
    setSelected((state: BackupSelectedStateType) => ({
      ...state,
      storageId: id,
    }));
  };

  const seStorageType = (type: string) => {
    setSelected((state: BackupSelectedStateType) => ({
      ...state,
      storageType: type,
    }));
  };

  const setSelectedFolder = (folderId: string) => {
    setSelected((state: BackupSelectedStateType) => ({
      ...state,
      folderId,
    }));
  };

  const isChanged = useMemo(() => {
    if (selected.hour !== defaults.hour) {
      return true;
    }

    if (+selected.maxCopiesNumber !== +defaults.maxCopiesNumber) {
      return true;
    }

    if (defaults.periodNumber !== selected.periodNumber) {
      return true;
    }

    if (selected.storageType !== defaults.storageType) {
      return true;
    }

    if (selected.periodNumber === "2") {
      if (selected.monthDay !== defaults.monthDay) {
        return true;
      }
    }

    if (selected.periodNumber === "1") {
      if (selected.weekdayLabel !== defaults.weekdayLabel) {
        return true;
      }
    }

    if (selected.folderId !== defaults.folderId) return true;

    if (selected.storageId !== defaults.storageId) return true;

    if (selected.enableSchedule !== defaults.enableSchedule) return true;

    return false;
  }, [
    defaults.enableSchedule,
    defaults.folderId,
    defaults.hour,
    defaults.maxCopiesNumber,
    defaults.monthDay,
    defaults.periodNumber,
    defaults.storageId,
    defaults.storageType,
    defaults.weekdayLabel,
    selected.enableSchedule,
    selected.folderId,
    selected.hour,
    selected.maxCopiesNumber,
    selected.monthDay,
    selected.periodNumber,
    selected.storageId,
    selected.storageType,
    selected.weekdayLabel,
  ]);

  return {
    defaults,
    setDefaults,
    selected,
    setSelected,
    backupSchedule,
    setBackupSchedule,
    errorsFieldsBeforeSafe,
    setErrorsFormFields,

    isChanged,

    setTime,
    toDefault,
    setPeriod,
    setWeekday,
    setStorageId,
    setMaxCopies,
    seStorageType,
    setMonthNumber,
    deleteSchedule,
    setSelectedFolder,
    setDefaultOptions,
    setCompletedFormFields,
    addValueInFormSettings,
    deleteValueFormSetting,

    isThirdStorageChanged,
    setIsThirdStorageChanged,
  };
};

