import { API_PREFIX, BASE_URL } from "../../utils";

const PATH = "settings/colortheme";

const url = `${BASE_URL}/${API_PREFIX}/${PATH}`;

export const colorTheme = (): Response => {
  return new Response(
    JSON.stringify({
      response: {
        themes: [
          {
            id: 1,
            name: "blue",
            main: {
              accent: "#4781D1",
              buttons: "#5299E0",
            },
            text: {
              accent: "#FFFFFF",
              buttons: "#FFFFFF",
            },
          },
          {
            id: 2,
            name: "orange",
            main: {
              accent: "#F97A0B",
              buttons: "#FF9933",
            },
            text: {
              accent: "#FFFFFF",
              buttons: "#FFFFFF",
            },
          },
          {
            id: 3,
            name: "green",
            main: {
              accent: "#2DB482",
              buttons: "#22C386",
            },
            text: {
              accent: "#FFFFFF",
              buttons: "#FFFFFF",
            },
          },
          {
            id: 4,
            name: "red",
            main: {
              accent: "#F2675A",
              buttons: "#F27564",
            },
            text: {
              accent: "#FFFFFF",
              buttons: "#FFFFFF",
            },
          },
          {
            id: 5,
            name: "purple",
            main: {
              accent: "#6D4EC2",
              buttons: "#8570BD",
            },
            text: {
              accent: "#FFFFFF",
              buttons: "#FFFFFF",
            },
          },
          {
            id: 6,
            name: "light-blue",
            main: {
              accent: "#11A4D4",
              buttons: "#13B7EC",
            },
            text: {
              accent: "#FFFFFF",
              buttons: "#FFFFFF",
            },
          },
        ],
        selected: 1,
        limit: 9,
      },
      count: 1,
      links: [
        {
          href: url,
          action: "GET",
        },
      ],
      status: 0,
      ok: true,
    }),
  );
};
