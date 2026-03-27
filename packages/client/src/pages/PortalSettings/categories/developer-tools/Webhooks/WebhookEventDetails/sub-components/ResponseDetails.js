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
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import json_beautifier from "csvjson-json_beautifier";

import { Textarea } from "@docspace/ui-kit/components/textarea";
import { Button } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";

import { isMobile } from "@docspace/shared/utils";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { isJSON } from "@docspace/shared/utils/json";

import styles from "../WebhookEventDetails.styled.module.scss";

const ResponseDetails = ({ eventDetails }) => {
	const responsePayload = eventDetails.responsePayload?.trim();
	const { t } = useTranslation(["Webhooks"]);

	const beautifiedJSON = isJSON(responsePayload)
		? json_beautifier(JSON.parse(responsePayload), {
				inlineShortArrays: true,
			})
		: responsePayload;

	const numberOfLines = isJSON(responsePayload)
		? beautifiedJSON.split("\n").length
		: responsePayload.split("\n").length;

	const openRawPayload = () => {
		const rawPayload = window.open("");
		isJSON(responsePayload)
			? rawPayload.document.write(
					beautifiedJSON.replace(/(?:\r\n|\r|\n)/g, "<br/>"),
				)
			: rawPayload.document.write(responsePayload);
		rawPayload.focus();
	};

	return (
		<div className={styles.messageDetailsWrapper}>
			<Text as="h3" fontWeight={600} className="mb-4 mt-7">
				{t("ResponsePostHeader")}
			</Text>
			{isJSON(eventDetails.responseHeaders) ? (
				<Textarea
					classNameCopyIcon="response-header-copy"
					value={eventDetails.responseHeaders}
					enableCopy
					hasNumeration
					isFullHeight
					isJSONField
					copyInfoText={t("ResponseHeaderCopied")}
				/>
			) : (
				<Textarea
					value={eventDetails.responseHeaders}
					heightScale
					className="textareaBody"
				/>
			)}
			<Text as="h3" fontWeight={600} className="mb-4 mt-16">
				{t("ResponsePostBody")}
			</Text>
			{responsePayload.length > 4000 || numberOfLines > 100 ? (
				<div className={styles.largePayloadStub}>
					<Text fontWeight={600} color={globalColors.lightGrayDark}>
						{t("PayloadIsTooLarge")}
					</Text>
					<Button
						className="view-raw-payload"
						size="small"
						onClick={openRawPayload}
						label={t("ViewRawPayload")}
						scale={isMobile()}
					/>
				</div>
			) : responsePayload === "" ? (
				<Textarea isDisabled />
			) : isJSON(responsePayload) ? (
				<Textarea
					classNameCopyIcon="response-body-copy"
					value={responsePayload}
					isJSONField
					enableCopy
					hasNumeration
					isFullHeight
					copyInfoText={t("ResponseBodyCopied")}
				/>
			) : (
				<Textarea
					classNameCopyIcon="response-body-copy"
					value={responsePayload}
					enableCopy
					heightScale
					className="textareaBody"
					copyInfoText={t("ResponseBodyCopied")}
				/>
			)}
		</div>
	);
};

export default inject(({ webhooksStore }) => {
	const { eventDetails } = webhooksStore;

	return { eventDetails };
})(observer(ResponseDetails));
