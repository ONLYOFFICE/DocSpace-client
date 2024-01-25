import moment from "moment";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { useTranslation } from "react-i18next";

import i18nextStoryDecorator from "../../.storybook/decorators/i18nextStoryDecorator";

import { Cron, getNextSynchronization } from ".";
import { ComboBox, ComboBoxSize, TOption } from "../combobox";
import { InputSize, InputType, TextInput } from "../text-input";
import { Button, ButtonSize } from "../button";
import type { CronProps } from "./Cron.types";

type CronType = FC<{ locale: string } & CronProps>;

type Story = StoryObj<CronType>;

const locales = [
  "az",
  "ar-SA",
  "zh-cn",
  "cs",
  "nl",
  "en",
  "fi",
  "fr",
  "de",
  "de-ch",
  "el",
  "it",
  "ja",
  "ko",
  "lv",
  "pl",
  "pt",
  "pt-br",
  "ru",
  "sk",
  "sl",
  "es",
  "tr",
  "uk",
  "vi",
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
].map((tz) => ({
  key: tz,
  label: tz,
}));

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
  },
  decorators: [i18nextStoryDecorator],
};

const DefaultTemplate = ({ defaultValue, locale }: Record<string, string>) => {
  const { i18n } = useTranslation();

  const [input, setInput] = useState(() => defaultValue);
  const [timeZone, setTimeZone] = useState<TOption>(() => {
    const key = moment.tz.guess();
    return {
      key: moment.tz(key).format("Z"),
      label: moment.tz(key).format("Z"),
    };
  });

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

  const handlerSelectTimezone = (optin: TOption) => {
    setTimeZone(optin);
  };

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const date = useMemo(
    () => cron && getNextSynchronization(cron, timeZone.key as string),
    [cron, timeZone.key],
  );

  const dateLocal = date && date.setLocale(locale ?? "en");

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          alignItems: "baseline",
          maxWidth: "340px",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "6px",
            alignItems: "center",
            width: "100%",
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
        <ComboBox
          scaledOptions
          options={TzNames}
          showDisabledItems
          dropDownMaxHeight={300}
          selectedOption={timeZone}
          size={ComboBoxSize.content}
          onSelect={handlerSelectTimezone}
        />
      </div>

      <Cron value={cron} setValue={setValue} onError={onError} />
      <p>
        <strong>Cron string: </strong> {cron}
      </p>
      <p>
        <strong>Error message: </strong> {error?.message ?? "undefined"}
      </p>
      {dateLocal && (
        <p>
          <strong>Next synchronization: </strong>{" "}
          {`${dateLocal.toFormat("DDDD TTTT")}`}
        </p>
      )}
    </div>
  );
};

export default meta;

export const Default: Story = {
  args: {
    locale: "en",
  },

  render: ({ value: defaultValue = "", locale }) => {
    return <DefaultTemplate defaultValue={defaultValue} locale={locale} />;
  },
};
