import { useTranslation } from "react-i18next";

import { TTableColumn, TableHeader } from "@docspace/shared/components/table";

import { HeaderProps } from "../TableView.types";

const Header = (props: HeaderProps) => {
  const { sectionWidth, tableRef, columnStorageName, tagRef } = props;
  const { t } = useTranslation(["Oauth", "Files", "Webhooks", "Common"]);

  const defaultColumns: TTableColumn[] = [
    {
      key: "Name",
      title: t("Common:Name"),
      resizable: true,
      enable: true,
      default: true,
      active: false,
      minWidth: 210,
    },
    {
      key: "Creator",
      title: t("Creator"),
      resizable: true,
      enable: true,
      minWidth: 150,
    },
    {
      key: "Modified",
      title: t("Files:ByLastModified"),
      resizable: true,
      enable: true,
      minWidth: 150,
    },
    {
      key: "Scopes",
      title: t("Scopes"),
      resizable: true,
      enable: true,
      withTagRef: true,
      minWidth: 150,
    },
    {
      key: "State",
      title: t("Webhooks:State"),
      enable: true,
      resizable: false,
      defaultSize: 64,
    },
  ];

  return (
    <TableHeader
      containerRef={{ current: tableRef }}
      columns={defaultColumns}
      columnStorageName={columnStorageName}
      tableStorageName={columnStorageName}
      sectionWidth={sectionWidth}
      showSettings={false}
      useReactWindow
      infoPanelVisible={false}
      tagRef={tagRef}
    />
  );
};

export default Header;
