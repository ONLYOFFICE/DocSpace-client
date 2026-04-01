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
