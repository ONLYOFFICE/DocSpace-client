import { useTranslation } from "react-i18next";

//@ts-ignore
import TableHeader from "@docspace/components/table-container/TableHeader";

import { HeaderProps } from "./TableView.types";

const Header = (props: HeaderProps) => {
  const { sectionWidth, tableRef, columnStorageName, tagRef } = props;
  const { t } = useTranslation(["Oauth", "Files", "Webhooks", "Common"]);

  const defaultColumns: {
    [key: string]:
      | string
      | number
      | boolean
      | ((key: string, e: any) => void | undefined);
  }[] = [
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
      checkboxSize="48px"
      containerRef={tableRef}
      columns={defaultColumns}
      columnStorageName={columnStorageName}
      sectionWidth={sectionWidth}
      checkboxMargin="12px"
      showSettings={false}
      useReactWindow
      infoPanelVisible={false}
      tagRef={tagRef}
    />
  );
};

export default Header;
