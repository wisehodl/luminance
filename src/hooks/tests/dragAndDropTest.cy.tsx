import { useState } from "react";
import type { RefObject } from "react";
import { useDragAndDrop } from "../dragAndDrop";
import styles from "./dragAndDropTest.module.css";
import clsx from "clsx";

type Item = {
  id: string;
  content: string;
  color: string;
};

const initialItems: Item[] = [
  { id: "1", content: "Item 1", color: "firebrick" },
  { id: "2", content: "Item 2", color: "mediumseagreen" },
  { id: "3", content: "Item 3", color: "orange" },
  { id: "4", content: "Item 4", color: "deepskyblue" },
  { id: "5", content: "Item 5", color: "mediumorchid" },
];

function TestDragAndDrop() {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [useLongPress, setUseLongPress] = useState(false);
  const [useDragHandle, setUseDragHandle] = useState(false);

  const handleReorder = (newItems: Item[]) => {
    setItems(newItems);
  };

  const { containerRef, getItemProps, isDragging, currentIndex, targetIndex } =
    useDragAndDrop(items, handleReorder, {
      longPressEnabled: useLongPress,
      dragHandleSelector: useDragHandle ? ".drag-handle" : undefined,
    });

  return (
    <div className={styles.wrapper}>
      <div
        ref={containerRef as RefObject<HTMLDivElement>}
        className={styles.itemsWrapper}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            data-cy={`draggable-item-${item.id}`}
            {...getItemProps(index)}
            className={clsx(
              styles.draggableItem,
              isDragging && currentIndex === index && styles.dragging,
            )}
            style={{
              ...getItemProps(index).style,
              backgroundColor: item.color,
            }}
          >
            <span className={styles.content}>{item.content}</span>
            {useDragHandle && <div className={styles.handle}></div>}
          </div>
        ))}
      </div>

      <hr />

      <div className={styles.controls}>
        <label>
          <input
            type="checkbox"
            checked={useLongPress}
            onChange={() => setUseLongPress(!useLongPress)}
          />
          Use Long Press
        </label>

        <label>
          <input
            type="checkbox"
            checked={useDragHandle}
            onChange={() => setUseDragHandle(!useDragHandle)}
          />
          Use Drag Handle
        </label>
      </div>

      <hr />

      <div className={styles.status}>
        <p>Dragging: {isDragging ? "True" : "False"}</p>
        <p>
          Status:
          {isDragging && (
            <p>
              Moving Item {currentIndex !== null ? items[currentIndex].id : ""}
              {targetIndex !== null ? ` to position ${targetIndex}` : ""}
            </p>
          )}
        </p>
      </div>

      <hr />

      <div className={styles.currentOrder}>
        <p>Current order:</p>
        <pre>
          {JSON.stringify(
            items.map((i) => i.id),
            null,
            2,
          )}
        </pre>
      </div>
    </div>
  );
}

describe("Drag and Drop Component Test", () => {
  beforeEach(() => {
    cy.mount(<TestDragAndDrop />);
    cy.viewport(500, 600);
  });

  it("should drag and drop", () => {});
});
