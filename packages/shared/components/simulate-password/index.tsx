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

import React, { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import EyeOffReactSvgUrl from "PUBLIC_DIR/images/eye.off.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";

import { globalColors } from "@docspace/ui-kit/providers/theme";
import { InputBlock } from "@docspace/ui-kit/components/input-block";
import { InputType } from "@docspace/ui-kit/components/text-input";

import styles from "./SimulatePassword.module.scss";
import type { SimulatePasswordProps } from "./SimulatePassword.types";

const iconColor = globalColors.gray;

const bulletsFont = "•";

export const SimulatePassword = memo(
	({
		onChange,
		onKeyDown,
		inputMaxWidth,
		isDisabled = false,
		hasError = false,
		forwardedRef,
		inputValue,
	}: SimulatePasswordProps) => {
		const [password, setPassword] = useState(inputValue ?? "");
		const [caretPosition, setCaretPosition] = useState(0);
		const [inputType, setInputType] = useState("password");

		const { t } = useTranslation("Common");

		const setPasswordSettings = (newPassword: string) => {
			const oldPassword = password;
			const oldPasswordLength = oldPassword.length;
			const position = forwardedRef.current?.selectionStart ?? 0;

			setCaretPosition(position);
			const newCharactersUntilCaret = newPassword.substring(0, position);

			const unchangedStartCharacters = newCharactersUntilCaret
				.split("")
				.filter((el) => el === bulletsFont).length;

			const unchangedEndingCharacters = newPassword.substring(position).length;
			const addedCharacters = newCharactersUntilCaret.substring(
				unchangedStartCharacters,
			);

			const startingPartOldPassword = oldPassword.substring(
				0,
				unchangedStartCharacters,
			);
			const countOfCharacters = oldPasswordLength - unchangedEndingCharacters;
			const endingPartOldPassword = oldPassword.substring(countOfCharacters);

			let newValue = startingPartOldPassword + addedCharacters;

			if (unchangedEndingCharacters) {
				newValue += endingPartOldPassword;
			}

			setPassword(newValue);
			return newValue;
		};

		const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
			const newPassword = e.target.value;

			if (inputType === "password") {
				const updatedPassword = setPasswordSettings(newPassword);
				onChange?.(updatedPassword);
			} else {
				setPassword(newPassword);
				onChange?.(newPassword);
			}
		};

		const onKeyDownAction = (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter") {
				onKeyDown?.(e);
			}
		};

		const onChangeInputType = () => {
			setInputType(inputType === "password" ? "text" : "password");
		};

		const copyPassword = password;
		const bullets = copyPassword.replace(/(.)/g, bulletsFont);

		const iconName =
			inputType === "password" ? EyeOffReactSvgUrl : EyeReactSvgUrl;

		useEffect(() => {
			if (caretPosition && inputType === "password") {
				forwardedRef.current?.setSelectionRange(caretPosition, caretPosition);
			}
		}, [caretPosition, forwardedRef, inputType]);

		useEffect(() => {
			if (isDisabled && inputType !== "password") {
				setInputType("password");
			}
		}, [inputType, isDisabled]);

		useEffect(() => {
			if (inputValue !== undefined && inputValue !== password) {
				setPassword(inputValue);
			}
		}, [inputValue, password]);

		const inputBlockStyle = inputMaxWidth
			? ({ maxWidth: inputMaxWidth } as React.CSSProperties)
			: undefined;

		return (
			<div
				className={classNames(
					styles.simulatePassword,
					"conversation-password-wrapper",
				)}
			>
				<InputBlock
					id="conversion-password"
					className={classNames(styles.conversionInput)}
					type={InputType.text}
					hasError={hasError}
					isDisabled={isDisabled}
					iconName={iconName}
					value={inputType === "password" ? bullets : password}
					onIconClick={onChangeInputType}
					onChange={onChangePassword}
					onKeyDown={onKeyDownAction}
					scale
					iconSize={16}
					iconColor={iconColor}
					hoverColor={iconColor}
					placeholder={t("Common:EnterPassword")}
					forwardedRef={forwardedRef}
					isAutoFocussed
					style={inputBlockStyle}
				/>
			</div>
		);
	},
);

SimulatePassword.displayName = "SimulatePassword";
