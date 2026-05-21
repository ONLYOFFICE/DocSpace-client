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
import { ReactSVG } from "react-svg";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { toastr } from "@docspace/ui-kit/components/toast";

import ActionsUploadReactSvgUrl from "PUBLIC_DIR/images/actions.upload.react.svg?url";
import MoveReactSvgUrl from "PUBLIC_DIR/images/icons/16/move.react.svg?url";

import { StyledParam } from "../../../CreateEditDialogParams/StyledParam";
import { getBrandName } from "@docspace/shared/constants/brands";

const KnowledgeSettings = () => {
	const { t } = useTranslation(["AIRoom", "Common", "Article"]);

	const onClickAction = () => toastr.info(t("Common:WorkInProgress"));

	return (
		<StyledParam increaseGap>
			<div className=" set_room_params-info">
				<div>
					<Text fontSize="13px" lineHeight="20px" fontWeight={600} noSelect>
						{t("Knowledge")}
					</Text>
					<Text
						fontSize="12px"
						lineHeight="16px"
						fontWeight={400}
						className="set_room_params-info-description"
						noSelect
					>
						{t("KnowledgeDescription", {
							productName: getBrandName("ProductName"),
						})}
					</Text>
				</div>
				<div className="ai-button-group">
					<Button
						size={ButtonSize.small}
						icon={
							<ReactSVG
								className="ai-button-icon"
								src={ActionsUploadReactSvgUrl}
							/>
						}
						label={t("Common:UploadFiles")}
						scale
						filled
						filledStroke
						onClick={onClickAction}
					/>
					<Button
						size={ButtonSize.small}
						icon={<ReactSVG className="ai-button-icon" src={MoveReactSvgUrl} />}
						label={t("KnowledgeSelectIn", {
							productName: getBrandName("ProductName"),
						})}
						scale
						filled
						onClick={onClickAction}
					/>
				</div>
			</div>
		</StyledParam>
	);
};

export default KnowledgeSettings;
