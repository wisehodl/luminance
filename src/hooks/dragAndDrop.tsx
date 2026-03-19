import { useCallback, useEffect, useReducer, useRef } from "react";
import type { RefObject } from "react";

import {
  extractEventCoordinates,
  isLeftMouseButton,
  isTouchEvent,
} from "@/util";

type DragAction<T> =
  | { type: "resetItems"; items: T[] }
  | { type: "startDrag"; sourceIndex: number; items: T[] }
  | { type: "processMove"; cursor: { x: number; y: number }; rects: DOMRect[] }
  | { type: "endDrag"; handleReorder: (newItems: T[]) => void };

interface DragState<T> {
  isDragging: boolean;
  sourceIndex: number;
  targetIndex: number;
  items: T[];
  previewItems: T[];
}

function reducer<T>(state: DragState<T>, action: DragAction<T>) {
  let items, cursor, rects, newTargetIndex, newPreviewItems, movedItem;

  switch (action.type) {
    case "resetItems":
      items = action.items;
      return {
        ...state,
        items: [...items],
        previewItems: [...items],
      };

    case "startDrag":
      return {
        ...state,
        isDragging: true,
        sourceIndex: action.sourceIndex,
        targetIndex: action.sourceIndex,
        items: [...action.items],
        previewItems: [...action.items],
      };

    case "processMove":
      if (!state.isDragging) return state;

      cursor = action.cursor;
      rects = action.rects;
      newTargetIndex = state.targetIndex;

      for (let i = 0; i < rects.length; i++) {
        const rect = rects[i];
        if (
          cursor.x >= rect.left &&
          cursor.x <= rect.right &&
          cursor.y >= rect.top &&
          cursor.y <= rect.bottom
        ) {
          newTargetIndex = i;
          break;
        }
      }

      if (newTargetIndex === state.targetIndex) return state;

      newPreviewItems = [...state.items];
      [movedItem] = newPreviewItems.splice(state.sourceIndex, 1);
      newPreviewItems.splice(newTargetIndex, 0, movedItem);

      return {
        ...state,
        targetIndex: newTargetIndex,
        previewItems: newPreviewItems,
      };

    case "endDrag":
      if (state.sourceIndex !== state.targetIndex) {
        action.handleReorder(state.previewItems);
      }

      return {
        ...state,
        isDragging: false,
        sourceIndex: -1,
        targetIndex: -1,
      };

    default:
      return state;
  }
}

interface DragAndDropHook<T> {
  containerRef: RefObject<HTMLDivElement | null>;
  getItemRef: (id: string) => RefObject<HTMLElement | null>;
  setItemRef: (el: HTMLElement | null, id: string) => void;
  isDragging: boolean;
  sourceIndex: number;
  targetIndex: number;
  previewItems: T[];
}

type ItemRefMap = {
  [key: string]: RefObject<HTMLElement | null>;
};

export function useDragAndDrop<T extends { id: string }>({
  items,
  handleReorder,
  disabled = false,
}: {
  items: T[];
  handleReorder: (newItems: T[]) => void;
  disabled?: boolean;
}): DragAndDropHook<T> {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { itemRefs, getItemRef, setItemRef } = useItemRefs<T>(items);
  const itemBoundingRects = useRef<DOMRect[]>([]);
  const [state, dispatch] = useReducer(reducer, {
    isDragging: false,
    sourceIndex: -1,
    targetIndex: -1,
    items: [...items],
    previewItems: [...items],
  });

  // Set preview items when 'items' changes externally
  useEffect(() => {
    dispatch({ type: "resetItems", items });
  }, [items]);

  // Event Handlers
  function getItemElement(event: MouseEvent | TouchEvent) {
    const target = event.target as HTMLElement;
    const itemElement = target.closest("[data-item-id]") as HTMLElement | null;

    return itemElement;
  }

  const getItemIndex = useCallback(
    (el: HTMLElement) => {
      const itemId = el.dataset.itemId;
      const index = items.findIndex((item) => item.id === itemId);
      return index;
    },
    [items],
  );

  const captureItemBoundaries = useCallback(() => {
    itemBoundingRects.current = items.map((item) => {
      const el = itemRefs.current[item.id]?.current;
      return el ? el.getBoundingClientRect() : new DOMRect();
    });
  }, [itemRefs, items]);

  const handleDragMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      event.preventDefault();

      const { clientX, clientY } = extractEventCoordinates(event);
      dispatch({
        type: "processMove",
        cursor: { x: clientX, y: clientY },
        rects: itemBoundingRects.current,
      });
    },
    [dispatch],
  );

  const handleDragEnd = useCallback(() => {
    document.removeEventListener("mousemove", handleDragMove);
    document.removeEventListener("touchmove", handleDragMove);
    document.removeEventListener("mouseup", handleDragEnd);
    document.removeEventListener("touchend", handleDragEnd);
    document.removeEventListener("touchcancel", handleDragEnd);

    dispatch({ type: "endDrag", handleReorder });
  }, [dispatch, handleDragMove, handleReorder]);

  const handleDragStart = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!isTouchEvent(event) && !isLeftMouseButton(event.buttons)) {
        return;
      }
      event.preventDefault();

      const itemElement = getItemElement(event);
      if (itemElement) {
        const sourceIndex = getItemIndex(itemElement);
        if (sourceIndex !== -1) {
          captureItemBoundaries();
          dispatch({ type: "startDrag", sourceIndex, items });
        }
      }

      document.addEventListener("mousemove", handleDragMove);
      document.addEventListener("touchmove", handleDragMove);
      document.addEventListener("mouseup", handleDragEnd);
      document.addEventListener("touchend", handleDragEnd);
      document.addEventListener("touchcancel", handleDragEnd);
    },
    [
      items,
      dispatch,
      handleDragEnd,
      handleDragMove,
      captureItemBoundaries,
      getItemIndex,
    ],
  );

  // Set/cleanup event handlers
  useEffect(() => {
    const elements = Object.values(itemRefs.current)
      .map((ref) => ref.current)
      .filter((el) => el !== null);

    if (!disabled) {
      elements.forEach((el) => {
        if (el) {
          el.addEventListener("mousedown", handleDragStart);
          el.addEventListener("touchstart", handleDragStart);
        }
      });

      return () => {
        elements.forEach((el) => {
          if (el) {
            el.removeEventListener("mousedown", handleDragStart);
            el.removeEventListener("touchstart", handleDragStart);
          }
        });
      };
    }
  }, [items, handleDragStart, disabled, itemRefs]);

  return {
    containerRef,
    getItemRef,
    setItemRef,
    isDragging: state.isDragging,
    sourceIndex: state.sourceIndex,
    targetIndex: state.targetIndex,
    previewItems: state.previewItems,
  };
}

function useItemRefs<T extends { id: string }>(items: T[]) {
  const itemRefs = useRef<ItemRefMap>({});

  useEffect(() => {
    itemRefs.current = items.reduce((acc, item) => {
      acc[item.id] = itemRefs.current[item.id] || { current: null };
      return acc;
    }, {} as ItemRefMap);
  }, [items]);

  const getItemRef = useCallback((id: string) => {
    return itemRefs.current[id] || { current: null };
  }, []);

  const setItemRef = useCallback((el: HTMLElement | null, id: string) => {
    if (!itemRefs.current[id]) {
      itemRefs.current[id] = { current: null };
    }
    itemRefs.current[id].current = el;
  }, []);

  return { itemRefs, getItemRef, setItemRef };
}
