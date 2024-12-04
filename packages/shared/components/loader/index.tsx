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

import { Oval } from "./sub-components/Oval";
import { DualRing } from "./sub-components/DualRing";
import { Rombs } from "./sub-components/Rombs";
import { Track } from "./sub-components/Track";
import { Base } from "./sub-components/Base";
import { LoaderProps } from "./Loader.types";
import { LoaderTypes } from "./Loader.enums";

export { LoaderTypes };

const Loader = ({
  type = LoaderTypes.base,
  color,
  size = "40px",
  label = "Loading content, please wait.",
  className,
  style,
  id,
  primary = false,
  isDisabled = false,
}: LoaderProps) => {
  const renderLoader = () => {
    const commonProps = { color, size, label, primary, isDisabled };

    switch (type) {
      case LoaderTypes.oval:
        return <Oval {...commonProps} />;
      case LoaderTypes.dualRing:
        return <DualRing {...commonProps} />;
      case LoaderTypes.rombs:
        return <Rombs {...commonProps} />;
      case LoaderTypes.track:
        return <Track {...commonProps} />;
      default:
        return <Base {...commonProps} />;
    }
  };

  return (
    <div
      className={className}
      style={style}
      id={id}
      data-testid="loader"
      data-type={type}
      data-disabled={isDisabled ? "true" : undefined}
      data-primary={primary ? "true" : undefined}
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      {renderLoader()}
    </div>
  );
};

export { Loader };
