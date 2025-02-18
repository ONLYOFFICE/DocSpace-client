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

import { Reducer, useCallback, useMemo, useReducer, useState } from "react";

import { AutoBackupPeriod } from "@docspace/shared/enums";
import type { TOption } from "@docspace/shared/components/combobox";
import type {
  Nullable,
  TTranslation,
  TWeekdaysLabel,
} from "@docspace/shared/types";
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
  const [errorsFieldsBeforeSafe, setErrorsFormFields] = useState<
    Record<string, boolean>
  >({});
  const [isThirdStorageChanged, setIsThirdStorageChanged] =
    useState<boolean>(false);

  const [backupSchedule, setBackupSchedule] = useState<
    Nullable<TBackupSchedule>
  >(() => backupScheduleResponse ?? null);

  const [defaults, setDefaults] = useReducer<
    Reducer<BackupDefaultStateType, Partial<BackupDefaultStateType>>
  >((state, action) => ({ ...state, ...action }), initBackupDefaultState);

  const [selected, setSelected] = useReducer<
    Reducer<BackupSelectedStateType, Partial<BackupSelectedStateType>>
  >((state, action) => ({ ...state, ...action }), initBackupSelectedState);

  const setDefaultOptions = useCallback(
    (t: TTranslation, periodObj: TOption[], weekdayArr: TOption[]) => {
      if (backupSchedule) {
        const { storageType, cronParams, backupsStored, storageParams } =
          backupSchedule;
        const { folderId, module, ...other } = storageParams;
        const { period, day, hour } = cronParams;

        const defaultFormSettings: Record<string, string> = {
          folderId: folderId.toString(),
          ...other,
        };

        if (defaultFormSettings) {
          setSelected({ formSettings: { ...defaultFormSettings } });
          setDefaults({ formSettings: { ...defaultFormSettings } });

          if (isThirdStorageChanged) {
            setIsThirdStorageChanged(false);
          }
        }

        const periodLabel = periodObj[period].label!;
        const monthDay =
          period === AutoBackupPeriod.EveryDayType ||
          period === AutoBackupPeriod.EveryWeekType
            ? "1"
            : day.toString();

        setDefaults({
          day: day.toString(),
          hour: `${hour}:00`,
          periodNumber: period.toString(),
          maxCopiesNumber: backupsStored.toString(),
          storageType: storageType.toString(),
          folderId: folderId.toString(),
          enableSchedule: true,
          periodLabel,
          ...(module ? { module: module.toString() } : {}),
          monthDay,
        });

        setSelected({
          day: day.toString(),
          hour: `${hour}:00`,
          periodNumber: period.toString(),
          maxCopiesNumber: backupsStored.toString(),
          storageType: storageType.toString(),
          folderId: folderId.toString(),
          enableSchedule: true,
          periodLabel,
          ...(module ? { module: module.toString() } : {}),
          monthDay,
        });

        if (period === AutoBackupPeriod.EveryWeekType) {
          let weekDay: number = 0;

          if (day) {
            for (let i = 0; i < weekdayArr.length; i++) {
              if (+weekdayArr[i].key === day) {
                weekDay = i;
              }
            }
          }
          const weekdayLabel = weekdayArr[weekDay].label!;

          setDefaults({
            weekday: day.toString(),
            weekdayLabel,
          });
          setSelected({
            weekday: day.toString(),
            weekdayLabel,
          });
        } else {
          const weekdayLabel = weekdayArr[0].label!;
          const weekday = weekdayArr[0].key.toString();

          setDefaults({
            weekday,
            weekdayLabel,
          });

          setSelected({
            weekday,
            weekdayLabel,
          });
        }
      } else {
        const periodLabel = periodObj[+defaults.periodNumber].label!;
        const weekdayLabel = weekdayArr[0].label!;
        const weekday = weekdayArr[0].key.toString();

        setDefaults({
          weekday,
          periodLabel,
          weekdayLabel,
        });
        setSelected({
          weekday,
          periodLabel,
          weekdayLabel,
        });
      }

      setIsThirdStorageChanged(false);
    },
    [backupSchedule, defaults.periodNumber, isThirdStorageChanged],
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

    setDefaults({
      day: "0",
      hour: "12:00",
      periodNumber: "0",
      periodLabel: "Every day",
      maxCopiesNumber: "10",
      storageType: "0",
      folderId: null,
      storageId: null,
      enableSchedule: false,
      monthDay: "1",
      weekday: weekdayArr[0].key.toString(),
      weekdayLabel: weekdayArr[0].label!,
    });

    setSelected({
      day: "0",
      hour: "12:00",
      periodNumber: "0",
      periodLabel: "Every day",
      maxCopiesNumber: "10",
      storageType: "0",
      folderId: null,
      storageId: null,
      enableSchedule: false,
      monthDay: "1",
      weekday: weekdayArr[0].key.toString(),
      weekdayLabel: weekdayArr[0].label!,
    });

    setIsThirdStorageChanged(false);
  };

  const setMaxCopies = (option: TOption) => {
    setSelected({
      maxCopiesNumber: option.key.toString(),
    });
  };

  const setPeriod = (options: TOption) => {
    const key = options.key;
    const label = options.label;

    setSelected({
      periodNumber: `${key}`,
      periodLabel: label!,
    });
  };

  const setWeekday = (options: TOption) => {
    const key = options.key;
    const label = options.label;

    setSelected({
      weekday: `${key}`,
      weekdayLabel: label!,
    });
  };

  const setMonthNumber = (options: TOption) => {
    const label = options.label;

    setSelected({
      monthDay: label!,
    });
  };

  const setTime = (options: TOption) => {
    const label = options.label;

    setSelected({
      hour: label!,
    });
  };

  const setCompletedFormFields = (
    values: Record<string, string>,
    module?: string,
  ) => {
    const formSettingsTemp: Record<string, string> = {};

    if (module && module === defaults.storageId) {
      setSelected({ formSettings: { ...defaults.formSettings } });
      return;
    }

    Object.keys(values).forEach((key) => {
      formSettingsTemp[key] = values[key];
    });

    setSelected({ formSettings: { ...formSettingsTemp } });
    setErrorsFormFields({});
  };

  const addValueInFormSettings = (name: string, value: string) => {
    const { formSettings } = selected;

    const newFormSettings = { ...formSettings, [name]: value };

    setSelected({ formSettings: newFormSettings });
  };

  const deleteValueFormSetting = (key: string) => {
    const newSettings = { ...selected.formSettings };
    delete newSettings[key];

    setSelected({
      formSettings: newSettings,
    });
  };

  const setStorageId = (id: string) => {
    setSelected({
      storageId: id,
    });
  };

  const seStorageType = (type: string) => {
    setSelected({
      storageType: type,
    });
  };

  const setSelectedFolder = (folderId: string) => {
    setSelected({
      folderId,
    });
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
  };
};
