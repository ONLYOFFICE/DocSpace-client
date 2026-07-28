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

import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import TrashIcon from "PUBLIC_DIR/images/icons/16/trash.react.svg";
import PlusIcon from "PUBLIC_DIR/images/plus.react.svg";
import { Link } from "@docspace/ui-kit/components/link";
import {
	TextInput,
	InputSize,
	InputType,
} from "@docspace/ui-kit/components/text-input";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { useTranslation } from "react-i18next";

import styles from "./user-fields.module.scss";

const usePrevious = (value) => {
	const ref = useRef();
	useEffect(() => {
		ref.current = value;
	}, [value]);
	return ref.current;
};

const UserFields = (props) => {
	const {
		className,
		buttonLabel,
		onChangeInput,
		onDeleteInput,
		onBlurAction,
		onClickAdd,
		inputs,
		validateFunc,
		classNameAdditional,
		isAutoFocussed = false,
		inputDataTestId,
		deleteIconDataTestId,
		addButtonDataTestId,
		hideDeleteIcon = false,
		errorMessages,
	} = props;

	const [errors, setErrors] = useState(new Array(inputs.length).fill(false));
	const prevInputsCount = usePrevious(inputs.length);

	useEffect(() => {
		if (inputs.length > prevInputsCount) setErrors([...errors, false]);
	}, [inputs]);

	const onBlur = (index) => {
		const newErrors = Array.from(errors);
		newErrors[index] = true;
		setErrors(newErrors);

		onBlurAction?.(index);
	};

	const onFocus = (index) => {
		const newErrors = Array.from(errors);
		newErrors[index] = false;
		setErrors(newErrors);
	};

	const onDelete = (index) => {
		const newErrors = Array.from(errors);
		newErrors.splice(index, 1);
		setErrors(newErrors);

		onDeleteInput(index);
	};

	return (
		<div className={className}>
			{inputs
				? inputs.map((input, index) => {
						let newInput1;
						let newInput2;

						if (input?.includes("-")) {
							newInput1 = input.split("-")[0];
							newInput2 = input.split("-")[1];
						}

						const error = newInput2
							? (input && input.split("-").length - 1 > 1) ||
								!validateFunc(newInput1) ||
								!validateFunc(newInput2) ||
								errorMessages?.[index]
							: !validateFunc(input) || errorMessages?.[index];

						return (
							<div
								key={`user-input-${inputs.length - index}`}
								className={classNames(styles["input-wrapper"], {
									[styles["hide-delete-icon"]]: hideDeleteIcon,
								})}
							>
								<FieldContainer
									className="field-container"
									isVertical
									labelVisible={false}
									hasError={error}
									errorMessage={errorMessages?.[index]}
								>
									<div className="input-wrapper">
										<TextInput
											type={InputType.text}
											size={InputSize.base}
											tabIndex={index}
											className={`${classNameAdditional}-input text-input`}
											id={`user-input-${input}`}
											name={`${classNameAdditional}_${index}`}
											isAutoFocussed={isAutoFocussed}
											keepCharPositions
											value={input}
											onChange={(e) => onChangeInput(e, index)}
											onBlur={() => onBlur(index)}
											onFocus={() => onFocus(index)}
											hasError={
												errors[index] || errorMessages?.[index] ? error : null
											}
											testId={inputDataTestId}
										/>
										{hideDeleteIcon ? null : (
											<TrashIcon
												className={`${styles["trash-icon"]} ${classNameAdditional}-delete-icon`}
												onClick={() => onDelete(index)}
												data-testid={deleteIconDataTestId}
											/>
										)}
									</div>
								</FieldContainer>
							</div>
						);
					})
				: null}

			<div
				className={classNames(
					styles["add-wrapper"],
					{ [styles["has-inputs"]]: inputs.length > 0 },
					classNameAdditional,
				)}
				onClick={onClickAdd}
				data-testid={addButtonDataTestId}
			>
				<PlusIcon className={styles["plus-icon"]} />
				<Link type="action" isHovered fontWeight={600}>
					{buttonLabel}
				</Link>
			</div>
		</div>
	);
};

export default UserFields;
