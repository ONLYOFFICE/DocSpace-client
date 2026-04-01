// (c) Copyright Ascensio System SIA 2009-2026
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
