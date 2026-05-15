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

import { useState, useCallback, ReactNode, useEffect } from "react";
import { Label } from "@docspace/ui-kit/components/label";
import { ComboBox, TOption } from "@docspace/ui-kit/components/combobox";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { Text } from "@docspace/ui-kit/components/text";

import { ControlsGroup, LabelGroup } from "../presets/StyledPresets";

import { sdkVersion, sdkSource } from "../constants";

type TVersionSelector = {
  t: (key: string) => ReactNode;
  onSetVersion: (version: string) => void;
  onSetSource: (source: string) => void;
};

export const VersionSelector = (props: TVersionSelector) => {
  const { t, onSetVersion, onSetSource } = props;

  const versions = Object.keys(sdkVersion).map((key) => ({
    key,
    label: sdkVersion[key as keyof typeof sdkVersion] as string,
  }));

  const sources = Object.keys(sdkSource).map((key) => ({
    key,
    label: sdkSource[key as keyof typeof sdkSource] as string,
  }));

  const [version, setVersion] = useState(versions[versions.length - 1]);
  const [source, setSource] = useState(sources[0]);
  const [disabled, setDisabled] = useState(false);

  const onChangeVersion = useCallback((option: TOption) => {
    setVersion(option as { key: string; label: string });
  }, []);

  const onChangeSource = useCallback((option: TOption) => {
    setSource(option as { key: string; label: string });
  }, []);

  useEffect(() => {
    if (source.label === sdkSource.Package) {
      setDisabled(true);
      setVersion(versions[versions.length - 1]);
    } else {
      setDisabled(false);
    }

    onSetVersion(version.label);
    onSetSource(source.label);
  }, [source.key, version.key]);

  return disabled ? null : (
    <ControlsGroup>
      <Label className="label" text={t("SourceType")} />
      <ComboBox
        scaled
        scaledOptions
        onSelect={onChangeSource}
        options={sources}
        selectedOption={source}
        displaySelectedOption
        directionY="bottom"
      />
      <LabelGroup>
        <Label className="label" text={t("Common:Version")} />
        {disabled ? (
          <HelpButton
            offsetRight={0}
            size={12}
            tooltipContent={
              <Text fontSize="12px">{t("SdkPackageVersionInfo")}</Text>
            }
          />
        ) : null}
      </LabelGroup>
      <ComboBox
        scaled
        scaledOptions
        onSelect={onChangeVersion}
        options={versions}
        selectedOption={version}
        displaySelectedOption
        directionY="bottom"
        isDisabled={disabled}
      />
    </ControlsGroup>
  );
};
