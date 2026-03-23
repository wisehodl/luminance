import { Hex as HexColor } from "colorlib";

import type { PaletteCard, PaletteColor } from "./paletteCard";

const CARDS_KEY = "luminance:cards";
const ACTIVE_ID_KEY = "luminance:activeCardId";

interface SerializedColor {
  id: string;
  name: string;
  hex: string;
}
interface SerializedCard {
  id: string;
  name: string;
  colors: SerializedColor[];
}

function serializeColor(color: PaletteColor): SerializedColor {
  return {
    id: color.id,
    name: color.name,
    hex: color.hex.to_code(),
  };
}

function deserializeColor(raw: SerializedColor): PaletteColor {
  return {
    id: raw.id,
    name: raw.name,
    hex: HexColor.from_code(raw.hex),
  };
}

export function serializeCard(card: PaletteCard): SerializedCard {
  return {
    id: card.id,
    name: card.name,
    colors: card.colors.map(serializeColor),
  };
}

export function deserializeCard(raw: SerializedCard): PaletteCard {
  return {
    id: raw.id,
    name: raw.name,
    colors: raw.colors.map(deserializeColor),
    selectedColorIds: [],
  };
}

export function loadCards(): Record<string, SerializedCard> {
  try {
    return JSON.parse(localStorage.getItem(CARDS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveCards(cards: Record<string, SerializedCard>) {
  localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
}

export function loadActiveCardId(): string | null {
  return localStorage.getItem(ACTIVE_ID_KEY);
}

export function saveActiveCardId(id: string): void {
  localStorage.setItem(ACTIVE_ID_KEY, id);
}
