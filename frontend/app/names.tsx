import Cookies from "js-cookie";

const names = [
  "Apple",
  "Banana",
  "Cherry",
  "Date",
  "Fig",
  "Grapes",
  "Kiwi",
  "Lemon",
];

export function getRandomFruit() {
  const randomIndex = Math.floor(Math.random() * names.length);
  return names[randomIndex];
}

export function getGuestId() {
  let guestId = Cookies.get("guestId");

  if (!guestId) {
    guestId = getRandomFruit();
    Cookies.set("guestId", guestId);
  }

  return guestId;
}
