export const TABLE_STATUS = {
  all: "All Tables",
  available: "available",
  occupied: "occupied",
  reserved: "reserved",
  billed: "billed",
  cleaning: "cleaning"
}

export const TABLE_FLOORS = {
  all: "All Floors",
  ground: "Ground Floor",
  rooftop: "Rooftop",
  outdoor: "Outdoor",
  first: "First Floor",
  second: "Second Floor",
  third: "Third Floor",
  fourth: "Fourth Floor",
}
export const ORDER_STATUS = {
  Preparing: "Preparing",
  Ready: "Ready",
  Served: "Served",
  Cancelled: "Cancelled",
};

export const PAYMENT_MODE = {
  unpaid: "Unpaid",
  cash: "Cash",
  card: "Card",
  online: "Online",
}

export const PRINT_TYPE = {
  A4: "A4",
  MODERN: "Modern",
  THREE_INCH_A: "3 Inch A",
  THREE_INCH_B: "3 Inch B",
  TWO_INCH_A: "2 Inch A",
  TWO_INCH_B: "2 Inch B",
};

export const PRINT_SIZE = {
  [PRINT_TYPE.A4]: {
    width: "210mm",
    height: "auto",
    widthPx: 794,
  },

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
export const PRINT_SIZE_OPTIONS = [
  { label: "A4 (Standard Sheet)", value: PRINT_TYPE.A4 },
  { label: "Modern (80mm Thermal)", value: PRINT_TYPE.MODERN },
  { label: "3 Inch A (80mm)", value: PRINT_TYPE.THREE_INCH_A },
  { label: "3 Inch B (80mm)", value: PRINT_TYPE.THREE_INCH_B },
  { label: "2 Inch A (58mm)", value: PRINT_TYPE.TWO_INCH_A },
  { label: "2 Inch B (58mm)", value: PRINT_TYPE.TWO_INCH_B },
];