import { inject, observer } from "mobx-react";

import Column from "@docspace/components/Column";
import Card from "@docspace/components/Card";

import { DashboardContainer } from "./Dashboard.styled";

import DownloadReactSvgUrl from "PUBLIC_DIR/images/download.react.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/trash.react.svg?url";
import LinkReactSvgUrl from "PUBLIC_DIR/images/invitation.link.react.svg?url";
import { DashboardInjectType } from "./types";
import DashboardProps from "./Dashboard.props";
import Table from "./Table";

function Dashboard({ viewAs }: DashboardProps) {
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
    return <Table />;
  }

  return (
    <DashboardContainer>
      {columns.map(({ id, user, title, color, cards, badge }) => (
        <Column key={id} user={user} title={title} color={color} badge={badge}>
          {cards?.map((card) => (
            <Card
              key={card.id}
              username={card.username}
              filename={card.filename}
            />
          ))}
        </Column>
      ))}

      <Column as="accepted" title="Готовые" getOptions={getOptions}>
        {columns[0].cards?.map((card) => (
          <Card
            key={card.id}
            username={card.username}
            filename={card.filename}
          />
        ))}
      </Column>
      <Column as="cancelled" title="Отказы" getOptions={getOptions}>
        {columns[0].cards?.map((card) => (
          <Card
            key={card.id}
            username={card.username}
            filename={card.filename}
          />
        ))}
      </Column>
    </DashboardContainer>
  );
}

export default inject<DashboardInjectType>(({ dashboardStore }) => {
  const { viewAs } = dashboardStore;

  return {
    viewAs,
  };
})(observer(Dashboard));
