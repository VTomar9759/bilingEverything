export const TABLE_STATUS = {
  all: "All Tables",
    available: "available",
    occupied: "occupied",
    reserved: "reserved",
    billed: "billed",
    cleaning: "cleaning"
}

export const PAYMENT_MODE = {
    unpaid: "Unpaid",
    cash: "Cash",
    card: "Card",
    online: "Online",
}

export const PRINT_TYPE = {
  MODERN: "Modern",
  THREE_INCH_A: "3 Inch A",
  THREE_INCH_B: "3 Inch B",
  TWO_INCH_A: "2 Inch A",
  TWO_INCH_B: "2 Inch B",
};

export const PRINT_TYPE_OPTIONS = [
  { label: "Modern", value: PRINT_TYPE.MODERN },
  { label: "3 Inch A", value: PRINT_TYPE.THREE_INCH_A },
  { label: "3 Inch B", value: PRINT_TYPE.THREE_INCH_B },
  { label: "2 Inch A", value: PRINT_TYPE.TWO_INCH_A },
  { label: "2 Inch B", value: PRINT_TYPE.TWO_INCH_B },
];

export const PRINT_SIZE = {
  [PRINT_TYPE.MODERN]: {
    width: "80mm",
    height: "auto",
    widthPx: 302,
  },

  [PRINT_TYPE.THREE_INCH_A]: {
    width: "80mm",
    height: "auto",
    widthPx: 302,
  },

  [PRINT_TYPE.THREE_INCH_B]: {
    width: "80mm",
    height: "auto",
    widthPx: 302,
  },

  [PRINT_TYPE.TWO_INCH_A]: {
    width: "58mm",
    height: "auto",
    widthPx: 219,
  },

  [PRINT_TYPE.TWO_INCH_B]: {
    width: "58mm",
    height: "auto",
    widthPx: 219,
  },
};


export const TABLE_FLOORS = {
    all: "All Floors",
    ground: "Ground Floor",
    rooftop: "Rooftop",
    outdoor: "Outdoor",
    first: "First Floor",
    second: "Second Floor",
    third: "Third Floor",
    fourth: "Fourth Floor",
//     fifth: "Fifth Floor",
//     sixth: "Sixth Floor",
//     seventh: "Seventh Floor",
//     eighth: "Eighth Floor",
//     ninth: "Ninth Floor",
//     tenth: "Tenth Floor",
}