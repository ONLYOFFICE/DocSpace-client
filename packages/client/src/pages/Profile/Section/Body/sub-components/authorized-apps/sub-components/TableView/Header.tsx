import { useTranslation } from "react-i18next";

import { TTableColumn, TableHeader } from "@docspace/shared/components/table";

import { HeaderProps } from "./TableView.types";

const Header = (props: HeaderProps) => {
  const { sectionWidth, tableRef, columnStorageName, tagRef } = props;
  const { t } = useTranslation(["Common", "OAuth"]);

  const defaultColumns: TTableColumn[] = [
    {
      key: "App",
      title: t("Apps"),
      resizable: true,
      enable: true,
      default: true,
      active: false,
      minWidth: 210,
    },
    {
      key: "Website",
      title: t("Website"),
      resizable: true,
      enable: true,
      minWidth: 150,
    },
    {
      key: "Access granted",
      title: t("OAuth:AccessGranted"),
      resizable: true,
      enable: true,
      minWidth: 150,
    },
  ];

  return (
    <TableHeader
      containerRef={{ current: tableRef }}
      columns={defaultColumns}
      columnStorageName={columnStorageName}
      columnInfoPanelStorageName="infoPanelAutorizedApps"
      sectionWidth={sectionWidth}
      showSettings={false}
      useReactWindow
      infoPanelVisible={false}
      tagRef={tagRef}
    />
  );
};

export default Header;
