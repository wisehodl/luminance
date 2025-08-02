import clsx from "clsx";
import { motion } from "motion/react";
import { useState } from "react";

import { useDragAndDrop } from "../dragAndDrop";
import styles from "./dragAndDropTest.module.css";

type Item = {
  id: string;
  content: string;
  color: string;
};

const initialItems: Item[] = [
  { id: "A", content: "Item A", color: "firebrick" },
  { id: "B", content: "Item B", color: "mediumseagreen" },
  { id: "C", content: "Item C", color: "orange" },
  { id: "D", content: "Item D", color: "deepskyblue" },
  { id: "E", content: "Item E", color: "mediumorchid" },
];

function TestDragAndDrop() {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [dragEnabled, setDragEnabled] = useState(true);

  const handleReorder = (newItems: Item[]) => setItems(newItems);

  const {
    containerRef,
    setItemRef,
    isDragging,
    sourceIndex,
    targetIndex,
    previewItems,
  } = useDragAndDrop({
    items,
    handleReorder,
    disabled: !dragEnabled,
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.itemsWrapper}>
        <div className={styles.indexColumn}>
          {(isDragging ? previewItems : items).map((_, index) => (
            <div key={`index-${index}`} className={styles.indexItem}>
              {index}
            </div>
          ))}
        </div>

        <div ref={containerRef} className={styles.draggableItemsWrapper}>
          {(isDragging ? previewItems : items).map((item, index) => (
            <motion.div
              key={item.id}
              ref={(el) => setItemRef(el, item.id)}
              data-item-id={item.id}
              data-cy={`draggable-item-${item.id}`}
              className={clsx(styles.item, {
                [styles.draggableItem]: dragEnabled,
                [styles.draggingItem]: isDragging && targetIndex === index,
              })}
              style={{
                backgroundColor: item.color,
              }}
              layout
              transition={{ duration: 0.2 }}
            >
              <span className={styles.content}>{item.content}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <hr />

      <div className={styles.status}>
        <button
          onClick={() => setDragEnabled(!dragEnabled)}
          data-cy="enable-button"
        >
          {dragEnabled ? "Cancel" : "Reorder Items"}
        </button>
        <p>Dragging: {isDragging ? "True" : "False"}</p>
        <p>
          Status:{" "}
          {isDragging && (
            <>
              Moving Item {sourceIndex !== null ? items[sourceIndex].id : ""}
              {targetIndex !== null ? ` to position ${targetIndex}` : ""}
            </>
          )}
        </p>
      </div>

      <hr />

      <div className={styles.currentOrder}>
        <p>Item order: {items.map((i) => i.id)}</p>
        <p>Preview order: {previewItems.map((i) => i.id)}</p>
      </div>
    </div>
  );
}

const triggerMouseEvent = (
  testId: string,
  eventType: string,
  args: any[] = [],
  opts: { [key: string]: any } = {},
) => {
  cy.dataCy(testId).trigger(eventType, ...args, {
    buttons: 1,
    eventConstructor: "MouseEvent",
    ...opts,
  });
};

const triggerTouchEvent = (
  testId: string,
  eventType: string,
  args: any[] = [],
  opts: { [key: string]: any } = {},
) => {
  cy.dataCy(testId).then(($el) => {
    const { left, top, width, height } = $el[0].getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const clientX = opts.clientX || centerX;
    const clientY = opts.clientY || centerY;

    const touchList = [
      {
        identifier: 0,
        target: $el[0],
        clientX,
        clientY,
      },
    ];

    const touchOptions = {
      ...opts,
      touches: touchList,
    };

    return cy.dataCy(testId).trigger(eventType, ...args, touchOptions);
  });
};

const assertItemOrder = (expectedOrder: string) => {
  cy.contains(`Item order: ${expectedOrder}`).should("exist");
};

const assertPreviewOrder = (expectedOrder: string) => {
  cy.contains(`Preview order: ${expectedOrder}`).should("exist");
};

const assertDragState = (expectedState: boolean) => {
  const expectedValue = expectedState ? "True" : "False";
  cy.contains(`Dragging: ${expectedValue}`).should("exist");
};

const assertStatus = (expectedItem: string, expectedPosition: string) => {
  cy.contains(
    `Status: Moving ${expectedItem} to position ${expectedPosition}`,
  ).should("exist");
};

describe("Drag and Drop Component Test", () => {
  beforeEach(() => {
    cy.mount(<TestDragAndDrop />);
    cy.viewport(500, 600);
  });

  it("should drag and drop on mouse events", () => {
    assertItemOrder("ABCDE");
    assertPreviewOrder("ABCDE");
    assertDragState(false);

    triggerMouseEvent("draggable-item-A", "mousedown");
    assertDragState(true);
    assertStatus("Item A", "0");

    triggerMouseEvent("draggable-item-B", "mousemove");
    assertStatus("Item A", "1");
    assertItemOrder("ABCDE");
    assertPreviewOrder("BACDE");

    triggerMouseEvent("draggable-item-A", "mouseup");
    assertDragState(false);
    assertItemOrder("BACDE");
    assertPreviewOrder("BACDE");
  });

  it("should drag and drop on touch events", () => {
    assertItemOrder("ABCDE");
    assertPreviewOrder("ABCDE");
    assertDragState(false);

    triggerTouchEvent("draggable-item-A", "touchstart");
    assertDragState(true);
    assertStatus("Item A", "0");

    triggerTouchEvent("draggable-item-B", "touchmove");
    assertStatus("Item A", "1");
    assertItemOrder("ABCDE");
    assertPreviewOrder("BACDE");

    triggerTouchEvent("draggable-item-A", "touchend");
    assertDragState(false);
    assertItemOrder("BACDE");
    assertPreviewOrder("BACDE");
  });

  it("should disable dragging", () => {
    cy.dataCy("enable-button").click();
    triggerMouseEvent("draggable-item-A", "mousedown");
    assertDragState(false);
    triggerMouseEvent("draggable-item-A", "mouseup");
  });
});
