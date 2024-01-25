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
  "ar",
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
      {date && (
        <p>
          <strong>Next synchronization: </strong>{" "}
          {`${date?.setLocale(locale).toFormat("DDDD TTTT")}`}
        </p>
      )}
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
