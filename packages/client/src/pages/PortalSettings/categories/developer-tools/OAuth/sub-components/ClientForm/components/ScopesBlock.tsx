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

import {
	IClientReqDTO,
	TFilteredScopes,
	TScope,
} from "@docspace/shared/utils/oauth/types";
import {
	filterScopeByGroup,
	getScopeTKeyName,
} from "@docspace/shared/utils/oauth";
import { ScopeGroup, ScopeType } from "@docspace/shared/enums";
import { TTranslation } from "@docspace/shared/types";
import { Text } from "@docspace/ui-kit/components/text";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import BlockHeader from "./BlockHeader";

import styles from "../ClientForm.styled.module.scss";

interface TScopesBlockProps {
	scopes: TScope[];
	selectedScopes: string[];
	onAddScope: (name: keyof IClientReqDTO, scope: string) => void;
	t: TTranslation;
	isEdit: boolean;
	requiredErrorFields: string[];
}

const ScopesBlock = ({
	scopes,
	selectedScopes,
	onAddScope,
	t,
	isEdit,
	requiredErrorFields,
}: TScopesBlockProps) => {
	const { isBase } = useTheme();
	const [checkedScopes, setCheckedScopes] = React.useState<string[]>([]);
	const [filteredScopes, setFilteredScopes] = React.useState<TFilteredScopes>(
		filterScopeByGroup(selectedScopes, scopes, t),
	);

	React.useEffect(() => {
		const filtered = filterScopeByGroup(selectedScopes, scopes, t);

		setCheckedScopes([...selectedScopes]);
		setFilteredScopes({ ...filtered });
	}, [scopes, selectedScopes, t]);

	const onAddCheckedScope = (
		group: ScopeGroup,
		type: ScopeType,
		name: string = "",
	) => {
		const isChecked = checkedScopes.includes(name);

		const isWrite = type === "write";

		if (!isChecked) {
			setFilteredScopes((val) => {
				val[group].isChecked = true;
				val[group].checkedType = type;

				return { ...val };
			});
			setCheckedScopes((val) => [...val, name]);
		} else {
			if (type === ScopeType.read) {
				setFilteredScopes((val) => {
					val[group].isChecked = false;
					val[group].checkedType = undefined;

					return { ...val };
				});
			} else {
				setFilteredScopes((val) => {
					const isReadChecked = checkedScopes.includes(
						val[group].read?.name || "",
					);

					val[group].isChecked = isReadChecked;
					val[group].checkedType = isReadChecked ? ScopeType.read : undefined;

					return { ...val };
				});
			}

			setCheckedScopes((val) => val.filter((v) => v !== name));
		}

		if (isWrite) onAddScope("scopes", name.replace("write", "read"));

		onAddScope("scopes", name);
	};

	const getRenderedScopeList = () => {
		const list: React.ReactNode[] = [];

		Object.entries(filteredScopes).forEach(([key, value]) => {
			const name = getScopeTKeyName(key as ScopeGroup, t);

			const isReadDisabled = value.checkedType === ScopeType.write;
			const isReadChecked = value.isChecked;

			const row = (
				<React.Fragment key={name}>
					<div className={styles.styledScopesName}>
						<Text
							className="scope-name"
							fontSize="14px"
							fontWeight={600}
							lineHeight="16px"
						>
							{/* biome-ignore lint/plugin/no-dynamic-i18n-key: name is an already-translated string returned by getScopeTKeyName; keys are declared as literals inside that helper */}
							{t(name)}
						</Text>

						{value.read?.name ? (
							<Text
								className="scope-desc"
								fontSize="12px"
								fontWeight={400}
								lineHeight="16px"
							>
								<Text
									className="scope-desc"
									as="span"
									fontSize="12px"
									fontWeight={600}
									lineHeight="16px"
								>
									{value.read?.name}
								</Text>{" "}
								{/* biome-ignore lint/plugin/no-dynamic-i18n-key: tKey keys are declared as literals in getScopeTKeyDescription */}
								— {t(value.read?.tKey ?? "")}
							</Text>
						) : null}
						{value.write?.name ? (
							<Text
								className="scope-desc"
								fontSize="12px"
								fontWeight={400}
								lineHeight="16px"
							>
								<Text
									className="scope-desc"
									as="span"
									fontSize="12px"
									fontWeight={600}
									lineHeight="16px"
								>
									{value.write?.name}
								</Text>{" "}
								{/* biome-ignore lint/plugin/no-dynamic-i18n-key: tKey keys are declared as literals in getScopeTKeyDescription */}
								— {t(value.write?.tKey ?? "")}
							</Text>
						) : null}
					</div>
					<div className={styles.styledScopesCheckbox}>
						<Checkbox
							className="checkbox-read"
							isChecked={isReadChecked}
							isDisabled={isReadDisabled || isEdit}
							onChange={() =>
								onAddCheckedScope(
									key as ScopeGroup,
									ScopeType.read,
									value.read?.name,
								)
							}
							dataTestId={`${key}_read_checkbox`}
						/>
					</div>
					<div className={styles.styledScopesCheckbox}>
						{value.write?.name ? (
							<Checkbox
								isChecked={isReadDisabled}
								isDisabled={isEdit || !value.write?.name}
								onChange={() =>
									onAddCheckedScope(
										key as ScopeGroup,
										ScopeType.write,
										value.write?.name,
									)
								}
								dataTestId={`${key}_write_checkbox`}
							/>
						) : null}
					</div>
				</React.Fragment>
			);

			list.push(row);
		});

		return list;
	};

	const list = getRenderedScopeList();

	const isRequiredError = requiredErrorFields.includes("scopes");

	return (
		<div className={classNames(styles.styledScopesContainer, { [styles.requiredError]: isRequiredError })}>
			<BlockHeader
				className="header"
				header={t("ScopesHeader")}
				helpButtonText={t("ScopesHelp")}
				isRequired
			/>

			<Text
				className="header"
				fontSize="14px"
				fontWeight={600}
				lineHeight="22px"
			>
				{t("Read")}
			</Text>

			<Text
				className="header header-last"
				fontSize="14px"
				fontWeight={600}
				lineHeight="22px"
			>
				{t("Write")}
			</Text>
			{isRequiredError ? (
				<>
					<Text
						className="header-error"
						fontWeight={400}
						fontSize="12px"
						lineHeight="16px"
						color={
							isBase
								? globalColors.lightErrorStatus
								: globalColors.darkErrorStatus
						}
					>
						{t("Common:SectionRequired")}
					</Text>
					<span />
					<span />
				</>
			) : null}
			{list.map((item) => item)}
		</div>
	);
};

export default ScopesBlock;
