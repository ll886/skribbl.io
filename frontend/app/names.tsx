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

function getRandomFruit() {
  const randomIndex = Math.floor(Math.random() * names.length);
  return names[randomIndex];
}

function getGuestId() {
  return Cookies.get("guestId");
}

function generateGuestIdIfNull() {
  let guestId = getGuestId();

  if (!guestId) {
    guestId = getRandomFruit();
    Cookies.set("guestId", guestId);
  }

  return guestId;
}

export { generateGuestIdIfNull };
