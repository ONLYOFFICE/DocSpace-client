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

import { ReactSVG } from "react-svg";

import { Text } from "@docspace/ui-kit/components/text";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import ArrowSvg from "PUBLIC_DIR/images/arrow2.react.svg?url";
import { ImportItemProps, ImportSectionProps } from "../types";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";
import classNames from "classnames";
import styles from "../StyledDataImport.module.scss";

const ImportItem = ({
  sectionName,
  sectionIcon,
  workspace,
  isChecked,
}: ImportItemProps) => {
  return (
    <div className={classNames(styles.importItemWrapper, { [styles.importItemWrapperUnchecked]: !isChecked })}>
      <Text
        className="workspace-title"
        fontSize="11px"
        fontWeight={600}
        lineHeight="12px"
        title={workspace}
      >
        {workspace}
      </Text>
      <div className="importSection">
        {sectionIcon ? (
          <ReactSVG className="importSectionIcon" src={sectionIcon} />
        ) : null}
        <Text as="span" fontWeight={600} lineHeight="20px" title={sectionName}>
          {sectionName}
        </Text>
      </div>
    </div>
  );
};

const ImportSection = ({
  isDisabled,
  isChecked,
  onChange,
  sectionName,
  description,
  exportSection,
  importSection,
  dataTestId,
  getTooltipContent,
}: ImportSectionProps) => {
  const toggleButtonTooltipId = `toggle-button-tooltip-${sectionName}`;
  return (
    <div
      data-testid={dataTestId}
      className={classNames(styles.sectionWrapper, { [styles.sectionWrapperUnchecked]: !isChecked })}
    >
      <ToggleButton
        isChecked={isChecked}
        onChange={onChange || (() => {})}
        className="toggleButton"
        isDisabled={isDisabled}
        dataTestId="enable_import_section_button"
        dataTooltipId={
          isDisabled && getTooltipContent ? toggleButtonTooltipId : undefined
        }
      />
      {isDisabled && getTooltipContent ? (
        <Tooltip
          id={toggleButtonTooltipId}
          place="bottom-end"
          getContent={getTooltipContent}
          maxWidth="220px"
        />
      ) : null}
      <div className="section-content">
        <Text lineHeight="20px" fontWeight={600} className="section-title">
          {sectionName}
        </Text>
        <Text fontSize="12px" lineHeight="16px" className="section-description">
          {description}
        </Text>
        <div className={styles.flexContainer}>
          <ImportItem {...exportSection} isChecked={isChecked} />
          <div className={styles.arrowWrapper}>
            <ReactSVG className="arrow-icon" src={ArrowSvg} />
          </div>
          <ImportItem {...importSection} isChecked={isChecked} />
        </div>
      </div>
    </div>
  );
};

export default ImportSection;
