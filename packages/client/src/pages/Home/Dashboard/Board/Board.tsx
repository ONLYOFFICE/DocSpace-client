import Column from "@docspace/common/components/Column";
import Card from "@docspace/common/components/Card";
import { BoardContainer } from "./Board.styled";
import BoardProps from "./Board.props";

function Board({ roles }: BoardProps) {
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

  return (
    <BoardContainer>
      {roles.map((role, index) => (
        <Column key={role.id} {...role}>
          {columns[index]?.cards?.map((card) => {
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
    </BoardContainer>
  );
}

export default Board;
