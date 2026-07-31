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
import classNames from "classnames";

import { RectangleSkeleton } from "@docspace/ui-kit/components/rectangle";
import { DeviceType } from "@docspace/shared/enums";

import styles from "./ClientForm.styled.module.scss";

const HelpButtonSkeleton = () => {
	return <RectangleSkeleton width="12px" height="12px" />;
};

const CheckboxSkeleton = ({ className }: { className?: string }) => {
	return <RectangleSkeleton className={className} width="16px" height="16px" />;
};

const ClientFormLoader = ({
	currentDeviceType,
	isEdit,
}: {
	currentDeviceType?: DeviceType;
	isEdit: boolean;
}) => {
	const buttonHeight = currentDeviceType !== "desktop" ? "40px" : "32px";

	return (
		<div className={styles.styledContainer}>
			<div className={styles.styledBlock}>
				<div className={styles.styledHeaderRow}>
					<RectangleSkeleton width="78px" height="22px" />
				</div>
				<div className={styles.styledInputBlock}>
					<div className={styles.styledInputGroup}>
						<div className={styles.styledHeaderRow}>
							<RectangleSkeleton width="65px" height="20px" />
						</div>
						<div className={styles.styledInputRow}>
							<RectangleSkeleton width="100%" height="32px" />
						</div>
					</div>
					<div className={styles.styledInputGroup}>
						<div className={styles.styledHeaderRow}>
							<RectangleSkeleton width="80px" height="20px" />
						</div>
						<div className={styles.styledInputRow}>
							<RectangleSkeleton width="100%" height="32px" />
						</div>
					</div>
					<div className={styles.styledInputGroup}>
						<div className="label">
							<RectangleSkeleton width="60px" height="20px" />
						</div>
						<div className="select">
							<RectangleSkeleton width="32px" height="32px" />
							<RectangleSkeleton width="32px" height="32px" />
							<RectangleSkeleton width="109px" height="20px" />
						</div>
						<RectangleSkeleton width="130px" height="16px" />
					</div>
					<div className={styles.styledInputGroup}>
						<div className={styles.styledHeaderRow}>
							<RectangleSkeleton width="75px" height="20px" />
						</div>
						<div className={styles.styledInputRow}>
							<RectangleSkeleton width="100%" height="60px" />
						</div>
					</div>
					<div className={styles.styledInputGroup}>
						<div className={styles.styledHeaderRow}>
							<RectangleSkeleton width="75px" height="20px" />
						</div>
						<div className={styles.styledCheckboxGroup}>
							<CheckboxSkeleton />
							<RectangleSkeleton width="151px" height="18px" />
							<HelpButtonSkeleton />
						</div>
					</div>
				</div>
			</div>
			{isEdit ? (
				<div className={styles.styledBlock}>
					<div className={styles.styledHeaderRow}>
						<RectangleSkeleton width="47px" height="22px" />
						<HelpButtonSkeleton />
					</div>
					<div className={styles.styledInputBlock}>
						<div className={styles.styledInputGroup}>
							<div className={styles.styledHeaderRow}>
								<RectangleSkeleton width="96px" height="20px" />
							</div>
							<div className={styles.styledInputRow}>
								<RectangleSkeleton width="100%" height="32px" />
							</div>
						</div>
						<div className={styles.styledInputGroup}>
							<div className={styles.styledHeaderRow}>
								<RectangleSkeleton width="60px" height="20px" />
							</div>
							<div className={styles.styledInputRow}>
								<RectangleSkeleton
									className="loader"
									width="calc(100% - 91px)"
									height="32px"
								/>
								<RectangleSkeleton width="91px" height="32px" />
							</div>
						</div>
					</div>
				</div>
			) : null}
			<div className={styles.styledBlock}>
				<div className={styles.styledHeaderRow}>
					<RectangleSkeleton width="96px" height="22px" />
				</div>
				<div className={styles.styledInputBlock}>
					<div className={styles.styledInputGroup}>
						<div className={styles.styledHeaderRow}>
							<RectangleSkeleton width="87px" height="20px" />
							<HelpButtonSkeleton />
						</div>
						<div className={styles.styledInputRow}>
							<RectangleSkeleton
								className="loader"
								width="calc(100% - 40px)"
								height="32px"
							/>
							<RectangleSkeleton width="32px" height="32px" />
						</div>
					</div>
					<div className={styles.styledInputGroup}>
						<div className={styles.styledHeaderRow}>
							<RectangleSkeleton width="96px" height="20px" />
							<HelpButtonSkeleton />
						</div>
						<div className={styles.styledInputRow}>
							<RectangleSkeleton
								className="loader"
								width="calc(100% - 40px)"
								height="32px"
							/>
							<RectangleSkeleton width="32px" height="32px" />
						</div>
					</div>
				</div>
			</div>
			<div className={styles.styledScopesContainer}>
				<div className={classNames(styles.styledHeaderRow, "header")}>
					<RectangleSkeleton width="111px" height="22px" />
					<HelpButtonSkeleton />
				</div>
				<RectangleSkeleton className="header" width="34px" height="22px" />
				<RectangleSkeleton
					className="header header-last"
					width="37px"
					height="22px"
				/>
				<div className={styles.styledScopesName}>
					<RectangleSkeleton
						className="scope-name-loader"
						width="98px"
						height="16px"
					/>
					<RectangleSkeleton
						className="scope-desc-loader"
						width="200px"
						height="17px"
					/>
					<RectangleSkeleton
						className="scope-desc-loader"
						width="230px"
						height="17px"
					/>
				</div>
				<div className={styles.styledScopesCheckbox}>
					<CheckboxSkeleton className="checkbox-read" />
				</div>
				<div className={styles.styledScopesCheckbox}>
					<CheckboxSkeleton />
				</div>
				<div className={styles.styledScopesName}>
					<RectangleSkeleton
						className="scope-name-loader"
						width="98px"
						height="16px"
					/>
					<RectangleSkeleton
						className="scope-desc-loader"
						width="200px"
						height="17px"
					/>
					<RectangleSkeleton
						className="scope-desc-loader"
						width="230px"
						height="17px"
					/>
				</div>
				<div className={styles.styledScopesCheckbox}>
					<CheckboxSkeleton className="checkbox-read" />
				</div>
				<div className={styles.styledScopesCheckbox}>
					<CheckboxSkeleton />
				</div>
				<div className={styles.styledScopesName}>
					<RectangleSkeleton
						className="scope-name-loader"
						width="98px"
						height="16px"
					/>
					<RectangleSkeleton
						className="scope-desc-loader"
						width="200px"
						height="17px"
					/>
					<RectangleSkeleton
						className="scope-desc-loader"
						width="230px"
						height="17px"
					/>
				</div>
				<div className={styles.styledScopesCheckbox}>
					<CheckboxSkeleton className="checkbox-read" />
				</div>
				<div className={styles.styledScopesCheckbox}>
					<CheckboxSkeleton />
				</div>
				<div className={styles.styledScopesName}>
					<RectangleSkeleton
						className="scope-name-loader"
						width="98px"
						height="16px"
					/>
					<RectangleSkeleton
						className="scope-desc-loader"
						width="200px"
						height="17px"
					/>
					<RectangleSkeleton
						className="scope-desc-loader"
						width="230px"
						height="17px"
					/>
				</div>
				<div className={styles.styledScopesCheckbox}>
					<CheckboxSkeleton className="checkbox-read" />
				</div>
				<div className={styles.styledScopesCheckbox}>
					<CheckboxSkeleton />
				</div>{" "}
				<div className={styles.styledScopesName}>
					<RectangleSkeleton
						className="scope-name-loader"
						width="98px"
						height="16px"
					/>
					<RectangleSkeleton
						className="scope-desc-loader"
						width="200px"
						height="17px"
					/>
				</div>
				<div className={styles.styledScopesCheckbox}>
					<CheckboxSkeleton className="checkbox-read" />
				</div>
			</div>
			<div className={styles.styledBlock}>
				<div className={styles.styledHeaderRow}>
					<RectangleSkeleton width="162px" height="22px" />
				</div>
				<div className={styles.styledInputBlock}>
					<div className={styles.styledInputGroup}>
						<div className={styles.styledHeaderRow}>
							<RectangleSkeleton width="114px" height="20px" />
							<HelpButtonSkeleton />
						</div>
						<div className={styles.styledInputRow}>
							<RectangleSkeleton width="100%" height="32px" />
						</div>
					</div>
					<div className={styles.styledInputGroup}>
						<div className={styles.styledHeaderRow}>
							<RectangleSkeleton width="96px" height="20px" />
							<HelpButtonSkeleton />
						</div>
						<div className={styles.styledInputRow}>
							<RectangleSkeleton width="100%" height="32px" />
						</div>
					</div>
				</div>
			</div>
			<div className={styles.styledButtonContainer}>
				<RectangleSkeleton
					width={currentDeviceType === "desktop" ? "86px" : "100%"}
					height={buttonHeight}
				/>
				<RectangleSkeleton
					width={currentDeviceType === "desktop" ? "86px" : "100%"}
					height={buttonHeight}
				/>
			</div>
		</div>
	);
};

export default ClientFormLoader;
