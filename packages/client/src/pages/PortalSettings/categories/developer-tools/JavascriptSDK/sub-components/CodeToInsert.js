// (c) Copyright Ascensio System SIA 2009-2025
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

import { useState } from "react";
import { Textarea } from "@docspace/shared/components/textarea";
import { Text } from "@docspace/shared/components/text";
import { Tabs, TabsTypes } from "@docspace/shared/components/tabs";
import CodeBlock from "./CodeBlock";

import { CategorySubHeader, CodeWrapper } from "../presets/StyledPresets";

export const CodeToInsert = ({ t, codeBlock, config, theme, scriptUrl }) => {
  const html = (
    <CodeWrapper height="fit-content">
      <CategorySubHeader className="copy-window-code">
        {`HTML ${t("CodeTitle")}`}
      </CategorySubHeader>
      <Text lineHeight="20px" className="preview-description">
        {t("HtmlCodeDescription", { productName: t("Common:ProductName") })}
      </Text>
      <Textarea value={codeBlock} heightTextArea={153} isReadOnly enableCopy />
    </CodeWrapper>
  );
  const js = (
    <CodeWrapper height="fit-content">
      <CategorySubHeader className="copy-window-code">
        {`JavaScript ${t("CodeTitle")}`}
      </CategorySubHeader>
      <Text lineHeight="20px" className="preview-description">
        {t("JavaScriptCodeDescription", {
          productName: t("Common:ProductName"),
        })}
      </Text>
      <CodeBlock config={config} scriptUrl={scriptUrl} theme={theme} />
    </CodeWrapper>
  );

  const npm = (
    <CodeWrapper height="fit-content">
      <CategorySubHeader className="copy-window-code">NPM</CategorySubHeader>
      <Text lineHeight="20px" className="preview-description">
        {t("NPMCodeDescription")}
      </Text>
      <Text lineHeight="20px" className="preview-description">
        {t("NPMCodeInstallStep")}
      </Text>
      <Textarea
        value="npm install --save @onlyoffice/docspace-sdk-js"
        heightTextArea={32}
        isReadOnly
        enableCopy
      />
      <Text lineHeight="20px" className="preview-description">
        {t("NPMCodeImportStep")}
      </Text>
      <Textarea
        value="import SDK from '@onlyoffice/docspace-sdk-js';"
        heightTextArea={32}
        isReadOnly
        enableCopy
      />
      <Text lineHeight="20px" className="preview-description">
        {t("NPMCodeConfigStep")}
      </Text>
      <Textarea
        value={JSON.stringify(config)}
        heightTextArea={118}
        isReadOnly
        enableCopy
        isJSONField
      />
      <Text lineHeight="20px" className="preview-description">
        {t("NPMCodeCreateStep")}
      </Text>
      <Textarea
        value={`const container = document.createElement('div');
        container.id = '${config.frameId}';
        document.body.appendChild(container);`}
        heightTextArea={68}
        isReadOnly
        enableCopy
      />
      <Text lineHeight="20px" className="preview-description">
        {t("NPMCodeInitStep")}
      </Text>
      <Textarea
        value="const sdk = new SDK();"
        heightTextArea={32}
        isReadOnly
        enableCopy
      />
      <Text lineHeight="20px" className="preview-description">
        {t("NPMCodeUsageStep")}
      </Text>
      <Textarea
        value="sdk.init(config);"
        heightTextArea={32}
        isReadOnly
        enableCopy
      />
    </CodeWrapper>
  );

  const tabs = [
    {
      id: "html",
      name: "HTML",
      content: html,
    },
    {
      id: "js",
      name: "JavaScript",
      content: js,
    },
    {
      id: "npm",
      name: "NPM",
      content: npm,
    },
  ];

  const [selectedItemId, setSelectedItemId] = useState(tabs[0].id);

  return (
    <Tabs
      type={TabsTypes.Secondary}
      items={tabs}
      selectedItemId={selectedItemId}
      onSelect={(e) => setSelectedItemId(e.id)}
    />
  );
};
