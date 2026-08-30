/** Named Gulf places for the UAE desk map. No scores — geography only. */

export type GulfPlace = {
  id: string;
  nameEn: string;
  nameAr: string;
  lat: number;
  lng: number;
  inUae: boolean;
};

export const GULF_PLACES: GulfPlace[] = [
  { id: "dubai", nameEn: "Dubai", nameAr: "دبي", lat: 25.2048, lng: 55.2708, inUae: true },
  { id: "abu-dhabi", nameEn: "Abu Dhabi", nameAr: "أبوظبي", lat: 24.4539, lng: 54.3773, inUae: true },
  { id: "sharjah", nameEn: "Sharjah", nameAr: "الشارقة", lat: 25.3463, lng: 55.4209, inUae: true },
  { id: "al-ain", nameEn: "Al Ain", nameAr: "العين", lat: 24.2075, lng: 55.7447, inUae: true },
  { id: "rak", nameEn: "Ras Al Khaimah", nameAr: "رأس الخيمة", lat: 25.8007, lng: 55.9762, inUae: true },
  { id: "doha", nameEn: "Doha", nameAr: "الدوحة", lat: 25.2854, lng: 51.531, inUae: false },
  { id: "manama", nameEn: "Manama", nameAr: "المنامة", lat: 26.2285, lng: 50.586, inUae: false },
  { id: "kuwait", nameEn: "Kuwait City", nameAr: "مدينة الكويت", lat: 29.3759, lng: 47.9774, inUae: false },
  { id: "dammam", nameEn: "Dammam", nameAr: "الدمام", lat: 26.4207, lng: 50.0888, inUae: false },
  { id: "muscat", nameEn: "Muscat", nameAr: "مسقط", lat: 23.588, lng: 58.3829, inUae: false },
];

/** Tight UAE frame. */
export const UAE_BOUNDS: [[number, number], [number, number]] = [
  [22.55, 51.45],
  [26.15, 56.6],
];

/** UAE + surrounding Gulf (GCC east + south Iran coast). */
export const GULF_BOUNDS: [[number, number], [number, number]] = [
  [21.4, 46.8],
  [30.9, 60.3],
];

export const GULF_CENTER: [number, number] = [25.3, 54.4];
