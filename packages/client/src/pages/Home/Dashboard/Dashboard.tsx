import { useContext, useLayoutEffect } from "react";
import { inject, observer } from "mobx-react";
import { isMobile, isMobileOnly } from "react-device-detect";

import Column from "@docspace/common/components/Column";
import Card from "@docspace/common/components/Card";
import { Context } from "@docspace/components/utils/context";
import Scrollbar from "@docspace/components/scrollbar";

import withDashboardLoader from "SRC_DIR/HOCs/withDashboardLoader";

import List from "./List";
import Table from "./Table";

import { DashboardContainer } from "./Dashboard.styled";

import DashboardProps from "./Dashboard.props";
import { ContextType, StoreType } from "./types";

import DownloadReactSvgUrl from "PUBLIC_DIR/images/download.react.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/trash.react.svg?url";
import LinkReactSvgUrl from "PUBLIC_DIR/images/invitation.link.react.svg?url";

function Dashboard({ viewAs, roles, setViewAs }: DashboardProps) {
  const { sectionWidth } = useContext<ContextType>(Context);

  useLayoutEffect(() => {
    if (viewAs === "dashboard") return;

    const width = window.innerWidth;

    setViewAs(width < 1024 ? "row" : "table");
  }, [sectionWidth, viewAs]);

  const columns = [
    {
      id: 1,
      user: "@Anyone",
      title: "Сотрудник",
      color: "#a3c3fa",
      cards: [
        {
          id: 1,
          username: "Leo Dokidis",
          filename: "Заявление на отпуск",
        },
        {
          id: 2,
          username: "William White",
          filename: "Заявление на отпуск",
        },
        {
          id: 3,
          username: "Robert Coleman",
          filename: "Заявление на отпуск",
        },
        {
          id: 4,
          username: "John Dean",
          filename: "Заявление на отпуск",
        },
        {
          id: 5,
          username: "Anna Allen",
          filename: "Заявление на отпуск",
        },
        {
          id: 6,
          username: "James Chavez",
          filename: "Заявление на отпуск",
        },
        {
          id: 7,
          username: "Geraldine Rodriguez",
          filename: "Заявление на отпуск",
        },
      ],
    },
    {
      id: 2,
      user: "Irina Vikulova",
      title: "Бухгалтер",
      color: "#CBDFB7",
    },
    {
      id: 3,
      user: "Lev Bannov",
      title: "Директор",
      color: "#D2AFC6;",
      badge: 1,
      cards: [
        {
          id: 7,
          username: "Linnik Sergey",
          filename: "Заявление на отпуск",
        },
      ],
    },
  ];

  const getOptions = () => [
    {
      key: "link_for_room_members",
      label: "Link for room members",
      icon: LinkReactSvgUrl,
      onClick: () => console.log("onClick Link for room members"),
      disabled: false,
    },
    {
      key: "download_folder",
      label: "Download folder",
      icon: DownloadReactSvgUrl,
      onClick: () => console.log("onClick Download folder"),
      disabled: false,
    },
    {
      key: "copy_folder",
      label: "Copy folder",
      icon: CopyReactSvgUrl,
      onClick: () => console.log("onClick Copy folder"),
      disabled: false,
    },
    {
      key: "separator0",
      isSeparator: true,
      disabled: false,
    },
    {
      key: "delete_all_forms",
      label: "Delete all forms",
      icon: TrashReactSvgUrl,
      onClick: () => console.log("onClick Delete all forms"),
      disabled: false,
    },
  ];

  if (viewAs === "row") {
    return <List sectionWidth={sectionWidth} roles={roles} />;
  }

  if (viewAs === "table") {
    return <Table roles={roles} />;
  }

  if (isMobile) {
    return (
      //@ts-ignore
      <Scrollbar
        style={{
          width: sectionWidth,
          height: `calc(100vh  - ${isMobileOnly ? 255 : 155}px)`,
        }}
      >
        <DashboardContainer>
          {roles.map((role) => (
            <Column key={role.id} {...role}>
              {columns[0].cards?.map((card) => {
                return (
                  <Card
                    key={card.id}
                    username={card.username}
                    filename={card.filename}
                  />
                );
              })}
            </Column>
          ))}
        </DashboardContainer>
      </Scrollbar>
    );
  }

  return (
    <DashboardContainer>
      {roles.map((role) => (
        <Column key={role.id} {...role}>
          {columns[0].cards?.map((card) => {
            return (
              <Card
                key={card.id}
                username={card.username}
                filename={card.filename}
              />
            );
          })}
        </Column>
      ))}
    </DashboardContainer>
  );
}

export default inject<StoreType>(
  ({ dashboardStore, filesStore, clientLoadingStore, auth }) => {
    const { viewAs, setViewAs, roles } = dashboardStore;
    const { isInit, isLoadingFilesFind } = filesStore;
    const { firstLoad, showBodyLoader } = clientLoadingStore;

    const isLoading =
      isLoadingFilesFind ||
      showBodyLoader ||
      !auth.isLoaded ||
      firstLoad ||
      !isInit;

    return {
      viewAs,
      setViewAs,
      roles,
      isLoading,
    };
  }
)(observer(withDashboardLoader(Dashboard)));
