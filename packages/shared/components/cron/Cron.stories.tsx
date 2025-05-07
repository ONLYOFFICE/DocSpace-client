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

import moment from "moment";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { useTranslation } from "react-i18next";

import i18nextStoryDecorator from "../../.storybook/decorators/i18nextStoryDecorator";

import { Cron, getNextSynchronization } from ".";
import { InputSize, InputType, TextInput } from "../text-input";
import { Button, ButtonSize } from "../button";
import type { CronProps } from "./Cron.types";
import { defaultCronString } from "./Cron.constants";

type CronType = FC<{ locale: string; timezone: string } & CronProps>;

type Story = StoryObj<CronType>;

const locales = [
  "az",
  "bg",
  "cs",
  "de",
  "el-GR",
  "en-GB",
  "en-US",
  "es",
  "fi",
  "fr",
  "hy-AM",
  "it",
  "lv",
  "nl",
  "pl",
  "pt",
  "pt-BR",
  "ro",
  "ru",
  "sk",
  "sl",
  "vi",
  "tr",
  "uk-UA",
  "ar-SA",
  "lo-LA",
  "ja-JP",
  "zh-CN",
  "ko-KR",
];

const TzNames = [
  "-12:00",
  "-11:00",
  "-10:00",
  "-09:30",
  "-09:00",
  "-08:00",
  "-07:00",
  "-06:00",
  "-05:00",
  "-04:00",
  "-03:30",
  "-03:00",
  "-02:00",
  "-01:00",
  "00:00",
  "+01:00",
  "+02:00",
  "+03:00",
  "+03:30",
  "+04:00",
  "+04:30",
  "+05:00",
  "+05:30",
  "+05:45",
  "+06:00",
  "+06:30",
  "+07:00",
  "+08:00",
  "+08:45",
  "+09:00",
  "+09:30",
  "+10:00",
  "+10:30",
  "+11:00",
  "+12:00",
  "+12:45",
  "+13:00",
  "+14:00",
];

const meta: Meta<CronType> = {
  title: "Components/Cron",
  component: Cron,
  argTypes: {
    value: {
      description: "Cron value",
    },
    setValue: {
      description: "Set the cron value, similar to onChange.",
    },
    onError: {
      description:
        "Triggered when the cron component detects an error with the value.",
    },
    locale: { control: "select", options: locales },
    timezone: { control: "select", options: TzNames },
  },
  decorators: [i18nextStoryDecorator],
};

const DefaultTemplate = ({
  defaultValue,
  locale,
  timezone,
}: Record<string, string>) => {
  const { i18n } = useTranslation();

  const [input, setInput] = useState(() => defaultValue);

  const [cron, setCron] = useState(defaultValue);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [i18n, locale]);

  const onError = useCallback((exception?: Error) => {
    setError(exception);
  }, []);

  const setValue = (value: string) => {
    setInput(value);
    setCron(value);
  };

  const onClick = () => {
    setCron(input);
  };

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const date = useMemo(
    () => getNextSynchronization(cron, timezone),
    [cron, timezone],
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "6px",
          alignItems: "baseline",
          maxWidth: "340px",
          marginBottom: "12px",
        }}
      >
        <TextInput
          scale
          withBorder
          value={input}
          type={InputType.text}
          size={InputSize.base}
          hasError={Boolean(error)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInput(e.target.value)
          }
          style={{
            flexGrow: 1,
          }}
        />

        <Button
          size={ButtonSize.small}
          primary
          label="Set value"
          onClick={onClick}
        />
      </div>

      <Cron value={cron} setValue={setValue} onError={onError} />
      <p>
        <strong>Cron string: </strong> {cron}
      </p>
      <p>
        <strong>Error message: </strong> {error?.message ?? "undefined"}
      </p>
      {date ? (
        <p>
          <strong>Next synchronization: </strong>{" "}
          {`${date?.setLocale(locale).toFormat("DDDD TTTT")}`}
        </p>
      ) : null}
    </div>
  );
};

export default meta;

export const Default: Story = {
  args: {
    locale: "en-GB",
    timezone: moment.tz(moment.tz.guess()).format("Z"),
  },

  render: ({ value: defaultValue = defaultCronString, locale, timezone }) => {
    return (
      <DefaultTemplate
        locale={locale}
        timezone={timezone}
        defaultValue={defaultValue}
      />
    );
  },
};
