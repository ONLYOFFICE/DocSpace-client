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

import React, { useRef } from "react";
import { classNames } from "@docspace/shared/utils";

import { Button, ButtonSize } from "../../button";
import { TextInput, InputSize, InputType } from "../../text-input";
import { Checkbox } from "../../checkbox";
import styles from "../Selector.module.scss";

import { FooterProps } from "../Selector.types";
import AccessSelector from "./AccessSelector";
import { Text } from "../../text";

const Footer = React.memo(
  ({
    isMultiSelect,
    submitButtonLabel,
    selectedItemsCount,
    withCancelButton,
    cancelButtonLabel,
    withAccessRights,
    accessRights,
    selectedAccessRight,
    onSubmit,
    disableSubmitButton,
    onCancel,
    onAccessRightsChange,
    accessRightsMode,

    withFooterCheckbox,
    withFooterInput,
    footerInputHeader,
    footerCheckboxLabel,
    currentFooterInputValue,
    setNewFooterInputValue,
    isChecked,
    setIsFooterCheckboxChecked,
    submitButtonId,
    cancelButtonId,

    requestRunning,
  }: FooterProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const label =
      selectedItemsCount && isMultiSelect
        ? `${submitButtonLabel} (${selectedItemsCount})`
        : submitButtonLabel;

    const onChangeFileName = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setNewFooterInputValue?.(value);
    };

    const onChangeCheckbox = () => {
      setIsFooterCheckboxChecked?.((value: boolean) => !value);
    };

    return (
      <div
        ref={ref}
        className={classNames(styles.footer, "selector-footer", {
          [styles.withFooterCheckbox]: withFooterCheckbox && !withFooterInput,
          [styles.withFooterInput]: !withFooterCheckbox && withFooterInput,
          [styles.defaultHeight]: !withFooterCheckbox && !withFooterInput,
        })}
      >
        {withFooterInput ? (
          <div className={styles.newNameContainer}>
            <Text
              className={styles.newNameHeader}
              lineHeight="20px"
              fontWeight={600}
              fontSize="13px"
              noSelect
            >
              {footerInputHeader}
            </Text>
            <TextInput
              type={InputType.text}
              size={InputSize.base}
              className={styles.newFileInput}
              value={currentFooterInputValue || ""}
              scale
              onChange={onChangeFileName}
            />
            {withFooterCheckbox ? (
              <Checkbox
                label={footerCheckboxLabel}
                isChecked={isChecked}
                onChange={onChangeCheckbox}
              />
            ) : null}
          </div>
        ) : null}

        {withFooterCheckbox && !withFooterInput ? (
          <Checkbox
            label={footerCheckboxLabel}
            isChecked={isChecked}
            onChange={onChangeCheckbox}
            className="selector_footer-checkbox"
          />
        ) : null}

        <div className={styles.buttonContainer}>
          <Button
            id={submitButtonId}
            className={styles.button}
            label={label}
            primary
            scale
            size={ButtonSize.normal}
            isLoading={requestRunning}
            isDisabled={
              !withFooterInput
                ? disableSubmitButton
                : disableSubmitButton || !currentFooterInputValue.trim()
            }
            onClick={onSubmit}
          />

          {withAccessRights ? (
            <AccessSelector
              accessRights={accessRights}
              selectedAccessRight={selectedAccessRight}
              onAccessRightsChange={onAccessRightsChange}
              footerRef={ref}
              accessRightsMode={accessRightsMode}
            />
          ) : null}

          {withCancelButton ? (
            <Button
              className={styles.button}
              id={cancelButtonId}
              label={cancelButtonLabel || ""}
              scale
              size={ButtonSize.normal}
              onClick={onCancel}
              isDisabled={requestRunning}
            />
          ) : null}
        </div>
      </div>
    );
  },
);

Footer.displayName = "Footer";

export { Footer };
