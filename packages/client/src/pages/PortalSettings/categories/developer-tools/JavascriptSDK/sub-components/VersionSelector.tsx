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

import { useState, useCallback, ReactNode, useEffect } from "react";
import { Label } from "@docspace/shared/components/label";
import { ComboBox, TOption } from "@docspace/shared/components/combobox";
import { HelpButton } from "@docspace/shared/components/help-button";
import { Text } from "@docspace/shared/components/text";

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
