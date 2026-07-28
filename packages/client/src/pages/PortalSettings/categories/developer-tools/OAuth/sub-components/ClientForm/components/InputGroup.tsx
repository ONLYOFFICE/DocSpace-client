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

import React from "react";

import { InputBlock } from "@docspace/ui-kit/components/input-block";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { RectangleSkeleton } from "@docspace/ui-kit/components/rectangle";
import { InputSize, InputType } from "@docspace/ui-kit/components/text-input";

import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";

import styles from "../ClientForm.styled.module.scss";

interface InputGroupProps {
	label: string;

	name: string;
	value: string;
	placeholder?: string;

	error: string;

	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

	helpButtonText?: string;

	buttonLabel?: string;
	onButtonClick?: () => void;

	withCopy?: boolean;
	onCopyClick?: (e: React.MouseEvent) => void;
	isPassword?: boolean;

	disabled?: boolean;
	isRequired?: boolean;
	isError?: boolean;
	children?: React.ReactNode;

	onBlur?: (name: string) => void;
	dataTestId?: string;
}

const InputGroup = ({
	label,

	name,
	value,
	placeholder,

	error,

	onChange,
	onBlur,

	helpButtonText,

	buttonLabel,
	onButtonClick,

	withCopy,
	onCopyClick,
	isPassword,
	disabled,
	isRequired,
	isError,
	children,
	dataTestId,
}: InputGroupProps) => {
	const [isRequestRunning, setIsRequestRunning] = React.useState(false);

	const onButtonClickAction = async () => {
		setIsRequestRunning(true);

		onButtonClick?.();

		setTimeout(() => {
			setIsRequestRunning(false);
		});
	};

	return (
		<div className={styles.styledInputGroup}>
			<FieldContainer
				className={buttonLabel ? "input-block-with-button" : ""}
				isVertical
				isRequired={isRequired}
				labelVisible
				labelText={label}
				tooltipContent={helpButtonText}
				errorMessage={error}
				removeMargin
				hasError={isError}
				dataTestId={dataTestId}
			>
				{children || (
					<>
						{isRequestRunning ? (
							<RectangleSkeleton
								className="loader"
								width="100%"
								height="32px"
							/>
						) : (
							<InputBlock
								name={name}
								value={value}
								placeholder={placeholder}
								onChange={onChange}
								scale
								tabIndex={0}
								maxLength={255}
								isReadOnly={withCopy}
								isDisabled={disabled}
								size={InputSize.base}
								iconName={withCopy ? CopyReactSvgUrl : ""}
								onIconClick={withCopy ? onCopyClick : undefined}
								type={isPassword ? InputType.password : InputType.text}
								onBlur={() => onBlur?.(name)}
								hasError={isError}
								noIcon={!withCopy}
								testId={`${dataTestId}_input`}
							/>
						)}
						{buttonLabel ? (
							<Button
								label={buttonLabel}
								size={ButtonSize.small}
								onClick={onButtonClickAction}
								isDisabled={isRequestRunning}
								testId={`${dataTestId}_button`}
							/>
						) : null}
					</>
				)}
			</FieldContainer>
		</div>
	);
};

export default InputGroup;
