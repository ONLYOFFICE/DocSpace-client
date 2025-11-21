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

import { Checkbox } from "@docspace/shared/components/checkbox";
import { HelpButton } from "@docspace/shared/components/help-button";
import { TooltipContent } from "../../../../pages/PortalSettings/categories/developer-tools/JavascriptSDK/sub-components/TooltipContent";

type CheckboxElementProps = {
  img: string;
  label: string;
  title: string;
  description: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isChecked: boolean;
  dataTestId?: string;
};

const CheckboxElement = ({
  img,
  label,
  title,
  description,
  onChange,
  isChecked,
  dataTestId,
}: CheckboxElementProps) => {
  return (
    <div className="embedding-panel_checkbox-element">
      <Checkbox
        className="checkbox"
        label={label}
        onChange={onChange}
        isChecked={isChecked}
        dataTestId={`${dataTestId}_embedding_panel_checkbox`}
      />
      <HelpButton
        place="right"
        offsetRight={4}
        size={12}
        dataTestId={`${dataTestId}_embedding_panel_help_button`}
        tooltipContent={
          <TooltipContent img={img} title={title} description={description} />
        }
      />
    </div>
  );
};

export { CheckboxElement };
