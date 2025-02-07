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

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Portal } from "../portal";
import { Guid } from "./sub-components/Guid";
import { GuidanceProps } from "./sub-components/Guid.types";
import { getGuidPosition } from "./sub-components/Guid.utils";
import { useInterfaceDirection } from "../../hooks/useInterfaceDirection";

interface InjectedProps extends GuidanceProps {
  guidanceStore?: any;
}

const Guidance = inject(({ guidanceStore }) => ({
  guidanceStore,
}))(
  observer((props: InjectedProps) => {
    const {
      formFillingTipsNumber,
      setFormFillingTipsNumber,
      viewAs,
      infoPanelVisible,
      guidanceStore,
    } = props;

    const [sectionWidth, setSectionWidth] = useState(0);

    const { t } = useTranslation(["FormFillingTipsDialog", "Common"]);
    const { isRTL } = useInterfaceDirection();

    const guidanceConfig = guidanceStore?.config || [];
    const currentGuidance = guidanceConfig[formFillingTipsNumber - 1];

    useEffect(() => {
      const updateSectionWidth = () => {
        const section = document.getElementById("section");
        if (section) {
          setSectionWidth(section.clientWidth);
        }
      };

      updateSectionWidth();
      window.addEventListener("resize", updateSectionWidth);

      return () => {
        window.removeEventListener("resize", updateSectionWidth);
      };
    }, []);

    if (!currentGuidance) return null;

    const positions =
      currentGuidance?.position?.map((pos) =>
        getGuidPosition(pos, viewAs, isRTL),
      ) || [];

    console.log(positions);
    return (
      <Portal
        element={
          <Guid
            guidanceConfig={guidanceConfig}
            currentStepIndex={formFillingTipsNumber - 1}
            currentGuidance={currentGuidance}
            setCurrentStepIndex={(index) => setFormFillingTipsNumber(index + 1)}
            onClose={props.onClose}
            positions={positions}
            infoPanelVisible={infoPanelVisible}
            viewAs={viewAs}
            sectionWidth={sectionWidth}
          />
        }
      />
    );
  }),
);

export { Guidance };
