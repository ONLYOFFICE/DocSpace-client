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

import React from "react";
import { useTranslation } from "react-i18next";

import { Portal } from "../portal";
import { Guid } from "./sub-components/Guid";
import { GuidanceProps } from "./sub-components/Guid.types";
import {
  getGuidPosition,
  getMainButtonPosition,
} from "./sub-components/Guid.utils";
import { useInterfaceDirection } from "../../hooks/useInterfaceDirection";

const Guidance = (props: GuidanceProps) => {
  const {
    formFillingTipsNumber,
    setFormFillingTipsNumber,
    viewAs,
    infoPanelVisible,
    getConfig,
  } = props;

  const { t } = useTranslation(["FormFillingTipsDialog", "Common"]);
  const { isRTL } = useInterfaceDirection();

  const guidanceConfig = getConfig(t);

  const currentGuidance = guidanceConfig[formFillingTipsNumber - 1];

  const [position, setPosition] = React.useState({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });

  // const mainButtonPosition = getMainButtonPosition(mainButtonGuidRect);

  const onResize = React.useCallback(() => {
    if (!currentGuidance?.position?.rects) return;

    const newPosition = getGuidPosition(
      currentGuidance.position,
      viewAs,
      isRTL,
    );
    setPosition(newPosition);
  }, [viewAs, isRTL, currentGuidance]);

  React.useEffect(() => {
    onResize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, [viewAs, isRTL, onResize]);

  return (
    <Portal
      element={
        <Guid
          guidanceConfig={guidanceConfig}
          currentStepIndex={formFillingTipsNumber - 1}
          currentGuidance={currentGuidance}
          setCurrentStepIndex={(index) => setFormFillingTipsNumber(index + 1)}
          onClose={props.onClose}
          position={position}
          infoPanelVisible={infoPanelVisible}
          viewAs={viewAs}
        />
      }
    />
  );
};

export { Guidance };
