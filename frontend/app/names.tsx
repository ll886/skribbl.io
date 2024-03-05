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
  "Mango",
  "Pineapple",
  "Watermelon",
  "Orange",
  "Strawberry",
  "Raspberry",
  "Blueberry",
  "Blackberry",
  "Peach",
  "Plum",
  "Apricot",
  "Papaya",
  "Pomegranate",
  "Guava",
  "Passionfruit",
  "Avocado",
  "Cranberry",
  "Lime",
  "Coconut",
  "Cantaloupe",
  "Dragon Fruit",
  "Elderberry",
  "Honeydew",
  "Lychee",
  "Nectarine",
  "Persimmon",
  "Rambutan",
  "Tangerine",
  "Ugli Fruit",
  "Quince",
  "Kumquat",
  "Starfruit",
  "Mandarin",
  "Boysenberry",
  "Currant",
  "Cherimoya",
  "Feijoa",
  "Mulberry",
  "Soursop",
  "Tamarillo",
  "Plantain",
  "Rutabaga",
  "Salak",
  "Jujube",
  "Sapote",
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
