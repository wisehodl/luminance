// Interfaces
export interface CartesianSpace {
  x: number;
  y: number;
}

export interface Range {
  min: number;
  max: number;
}

// Types
export type Setter<T> = (valueOrCallback: SetterValueOrCallback<T>) => void;
export type SetterValueOrCallback<T> = T | ((prev: T) => T);
export type Timeout = ReturnType<typeof setTimeout>;

// Enums
export enum Direction {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
}
