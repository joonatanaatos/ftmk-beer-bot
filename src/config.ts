import type { DrinkType } from "./generated/prisma/enums";

export { DrinkType } from "./generated/prisma/enums";

const rawOffset = process.env["TIME_OFFSET_HOURS"];
const parsedOffset = rawOffset !== undefined ? Number(rawOffset) : 0;
export const TIME_OFFSET_MS =
  (Number.isFinite(parsedOffset) ? parsedOffset : 0) * 60 * 60 * 1000;

export const PRICES: Record<DrinkType, number> = {
  BEER: 4,
  DRINK: 5,
  SHOT: 4,
  ICE_CREAM: 1,
  WINE: 4,
};

export const DRINK_EMOJI: Record<DrinkType, string> = {
  BEER: "🍺",
  DRINK: "🍹",
  SHOT: "🥃",
  ICE_CREAM: "🍦",
  WINE: "🍷",
};

export const MOTIVATIONAL_MESSAGES = [
  "Jatka samaan malliin! 🍻",
  "Olet todellinen taistelija! 🥳",
  "Uuteen nousuun! 🚀",
  "Jokainen kalja lasketaan! 🍻",
  "JESSSS! 💯",
  "Huhhuh, mikä saldo! 😎",
  "Onnistut paremmin kuin muut! 🌟",
  "Pidä hyvä tahti yllä! 🏃‍♂️",
  "Olet todellinen kaljaguru! 🍺",
  "Jokainen drinkki on drinkki kohti voittoa! 🍹",
  "Shotti päivässä pitää rapakon loitolla! 🥃",
  "Älä anna krapulan iskeä! 🍦",
  "Et tuota Daddylle pettymystä! 👑",
  "Taas mennään! 🚀",
  "Kellota! ⏱️",
  "Juot kuin koneteekkari! 🤖",
  "Tämä on elämäntapa! 🌈",
  "Olet FTMK:n ylpeys! 🎓",
  "Näytä niille fukseille! 💪",
  "Iuventus in aeternum! 🎓",
  "Näytä muna! 🍆",
];

export const COLORS = [
  "#e6194b",
  "#3cb44b",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#42d4f4",
  "#f032e6",
  "#bfef45",
];
