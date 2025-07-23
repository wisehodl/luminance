import { useState, useRef, useCallback, useEffect } from "react";

type Position = {
  x: number;
  y: number;
};

type DragAndDropConfig = {
  longPressEnabled?: boolean;
  longPressDelay?: number;
  dragHandleSelector?: string;
};

type DragAndDropState = {
  isDragging: boolean;
  currentIndex: number | null;
  targetIndex: number | null;
};

export function useDragAndDrop<T>(
  items: T[],
  onReorder: (newOrder: T[]) => void,
  config: DragAndDropConfig = {},
) {
  const {
    longPressEnabled = false,
    longPressDelay = 300,
    dragHandleSelector,
  } = config;

  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const containerRef = useRef<HTMLElement | null>(null);

  const [dragState, setDragState] = useState<DragAndDropState>({
    isDragging: false,
    currentIndex: null,
    targetIndex: null,
  });

  const getItemProps = (index: number) => {
    return { style: {} };
  };

  return {
    containerRef,
    itemRefs,
    isDragging: dragState.isDragging,
    currentIndex: dragState.currentIndex,
    targetIndex: dragState.targetIndex,
    getItemProps,
  };
}
