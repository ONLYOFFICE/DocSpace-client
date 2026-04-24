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

import { useEffect } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Text } from "@docspace/ui-kit/components/text";
import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";
import { Loader } from "@docspace/ui-kit/components/loader";
import { Link } from "@docspace/ui-kit/components/link";

import styles from "./DebugInfo.module.scss";

const MarkdownLink = ({ href, children }) => (
	<Link fontWeight="600" target="_blank" tag="a" href={href} color="accent">
		{children}
	</Link>
);

const DebugInfoDialog = (props) => {
	const { visible, onClose, user, debugInfoData, getDebugInfo } = props;

	useEffect(() => {
		getDebugInfo();
	}, []);

	return (
		<ModalDialog
			withFooterBorder
			visible={visible}
			onClose={onClose}
			displayType="modal"
			autoMaxHeight
			autoMaxWidth
			isHuge
		>
			<ModalDialog.Header>Debug Info</ModalDialog.Header>
			<ModalDialog.Body className="debug-info-body">
				<div className={styles.bodyContent}>
					{/* <Text>{`# Build version: ${BUILD_VERSION}`}</Text> */}
					<Text>
						# Version: <span className="version">{VERSION}</span>
					</Text>
					<Text>{`# Build date: ${BUILD_AT}`}</Text>
					{user ? (
						<Text>{`# Current User: ${user?.displayName} (id:${user?.id})`}</Text>
					) : null}
					<Text>{`# User Agent: ${navigator.userAgent}`}</Text>
				</div>
			</ModalDialog.Body>
			<ModalDialog.Footer className="debug-info-footer">
				<div className={styles.footerContent}>
					<div className={styles.markdownWrapper}>
						<Scrollbar>
							{!debugInfoData ? <Loader size="20px" type="track" /> : null}
							{debugInfoData ? (
								<ReactMarkdown
									remarkPlugins={[remarkGfm]}
									components={{
										a: MarkdownLink,
									}}
								>
									{debugInfoData}
								</ReactMarkdown>
							) : null}
						</Scrollbar>
					</div>
				</div>
			</ModalDialog.Footer>
		</ModalDialog>
	);
};

DebugInfoDialog.propTypes = {
	visible: PropTypes.bool,
	onClose: PropTypes.func,
};

export default inject(({ userStore, settingsStore }) => {
	const { user } = userStore;
	const { debugInfoData, getDebugInfo } = settingsStore;

	return {
		user,
		debugInfoData,
		getDebugInfo,
	};
})(observer(DebugInfoDialog));
