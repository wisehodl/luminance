import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, RefObject } from "react";

import clsx from "clsx";
import { Hex as HexColor } from "colorlib";
import {
  Check,
  CheckCheck,
  ChevronsLeft,
  ChevronsRight,
  CircleDashed,
  Copy,
  Crosshair,
  Dot,
  GripVertical,
  Pencil,
  Plus,
  Redo2,
  RefreshCw,
  RefreshCwOff,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { motion } from "motion/react";

import type { ContrastToken } from "@/hooks/contrast";
import { luminanceFromHex, useContrastToken } from "@/hooks/contrast";
import { useDragAndDrop } from "@/hooks/dragAndDrop";
import { extractHexValue, formatHexString } from "@/hooks/hex";
import {
  createPaletteCardActions,
  paletteCardReducer,
} from "@/hooks/paletteCard";
import type {
  PaletteCard,
  PaletteCardActions,
  PaletteCardState,
  PaletteColor,
  PaletteMode,
} from "@/hooks/paletteCard";
import {
  loadCards,
  saveActiveCardId,
  saveCards,
  serializeCard,
} from "@/hooks/storage";
import { randomId } from "@/util";

import styles from "./PaletteEditor.module.css";

type Timeout = ReturnType<typeof setTimeout>;

const SYNC_DELAY = 2000;
const DEFAULT_BG = HexColor.from_code("f6f6f6");

function defaultPaletteCard(): PaletteCardState {
  const defaultCard = {
    id: randomId(),
    name: "New Palette",
    colors: [],
    selectedColorIds: [],
  };

  return {
    present: defaultCard,
    history: [],
    future: [],
  };
}

function PaletteEditor({
  pickerColor,
  setPickerColor,
  initialCardState,
}: {
  pickerColor: HexColor;
  setPickerColor: (hex: HexColor) => void;
  initialCardState?: PaletteCardState;
}) {
  const [cardState, dispatch] = useReducer(
    paletteCardReducer,
    initialCardState || defaultPaletteCard(),
  );
  const actions = useMemo(() => createPaletteCardActions(dispatch), [dispatch]);
  const [historyCounter, setHistoryCounter] = useState(0);
  const [mode, setMode] = useState<PaletteMode>("normal");
  const [isSynced, setIsSynced] = useState(false);
  const snapshotRef = useRef<PaletteCard | null>(null);
  const timerRef = useRef<Timeout | null>(null);

  const incrementHistoryCounter = () => {
    setHistoryCounter((prev) => prev + 1);
  };

  useEffect(() => {
    saveActiveCardId(cardState.present.id);
  }, []);

  useEffect(() => {
    const cards = loadCards();
    cards[cardState.present.id] = serializeCard(cardState.present);
    saveCards(cards);
  }, [cardState.present]);

  return (
    <div className={styles.paletteEditor} data-cy="palette-editor">
      <ActionBar
        mode={mode}
        setMode={setMode}
        actions={actions}
        hasSelection={cardState.present.selectedColorIds.length > 0}
        canUndo={cardState.history.length > 0}
        canRedo={cardState.future.length > 0}
        isSynced={isSynced}
        incrementHistoryCounter={incrementHistoryCounter}
        snapshotRef={snapshotRef}
        syncTimerRef={timerRef}
      />
      <PaletteCard
        pickerColor={pickerColor}
        setPickerColor={setPickerColor}
        cardState={cardState.present}
        actions={actions}
        mode={mode}
        isSynced={isSynced}
        setIsSynced={setIsSynced}
        snapshotRef={snapshotRef}
        syncTimerRef={timerRef}
        historyCounter={historyCounter}
      />
    </div>
  );
}

function ActionBar({
  mode,
  setMode,
  actions,
  hasSelection,
  canUndo,
  canRedo,
  isSynced,
  incrementHistoryCounter,
  snapshotRef,
  syncTimerRef,
}: {
  mode: PaletteMode;
  setMode: (mode: PaletteMode) => void;
  actions: PaletteCardActions;
  hasSelection: boolean;
  canUndo: boolean;
  canRedo: boolean;
  isSynced: boolean;
  incrementHistoryCounter: () => void;
  snapshotRef: RefObject<PaletteCard | null>;
  syncTimerRef: RefObject<Timeout | null>;
}) {
  const clearSyncTimeout = () => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    snapshotRef.current = null;
  };

  const handleUndo = () => {
    if (isSynced) clearSyncTimeout();
    incrementHistoryCounter();
    actions.undo();
  };

  const handleRedo = () => {
    if (isSynced) clearSyncTimeout();
    incrementHistoryCounter();
    actions.redo();
  };

  const handleModeChange = (next: PaletteMode) => {
    if (mode === "normal") {
      if (isSynced && syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
        if (snapshotRef.current) {
          actions.commitToHistory(snapshotRef.current);
          snapshotRef.current = null;
        }
      }
    }
    actions.clearSelection();
    setMode(next);
  };

  return (
    <div className={styles.actionBar} data-cy="action-bar">
      <button
        className={clsx(styles.actionButton, styles.iconButton, {
          [styles.enabled]: canUndo,
          [styles.disabled]: !canUndo,
        })}
        data-cy="undo"
        disabled={!canUndo}
        onClick={handleUndo}
        title="Undo"
      >
        <Undo2 size={16} />
      </button>
      <button
        className={clsx(styles.actionButton, styles.iconButton, {
          [styles.enabled]: canRedo,
          [styles.disabled]: !canRedo,
        })}
        data-cy="redo"
        disabled={!canRedo}
        onClick={handleRedo}
        title="Redo"
      >
        <Redo2 size={16} />
      </button>
      <button
        className={clsx(styles.actionButton, styles.iconButton, styles.enabled)}
        data-cy="add"
        onClick={actions.addColor}
        title="Add Color"
      >
        <Plus size={16} />
      </button>
      <button
        className={clsx(styles.actionButton, styles.iconButton, {
          [styles.enabled]: hasSelection,
          [styles.disabled]: !hasSelection,
        })}
        data-cy="delete"
        disabled={!hasSelection}
        onClick={actions.deleteSelectedColors}
        title="Delete Selected"
      >
        <Trash2 size={16} />
      </button>
      <button
        className={clsx(styles.actionButton, styles.iconButton, {
          [styles.enabled]: hasSelection,
          [styles.disabled]: !hasSelection,
        })}
        data-cy="duplicate"
        disabled={!hasSelection}
        onClick={actions.duplicateSelectedColors}
        title="Duplicate Selected"
      >
        <Copy size={16} />
      </button>
      <button
        className={clsx(
          styles.actionButton,
          styles.wordButton,
          styles.enabled,
          {
            [styles.activeButton]: mode === "reorder",
          },
        )}
        data-cy="reorder"
        aria-pressed={mode === "reorder"}
        onClick={() =>
          handleModeChange(mode === "reorder" ? "normal" : "reorder")
        }
        title="Reorder Colors"
      >
        Reorder
      </button>
      <button
        className={clsx(
          styles.actionButton,
          styles.wordButton,
          styles.enabled,
          {
            [styles.activeButton]: mode === "select",
          },
        )}
        data-cy="select"
        aria-pressed={mode === "select"}
        onClick={() =>
          handleModeChange(mode === "select" ? "normal" : "select")
        }
        title="Select Multiple"
      >
        Select
      </button>
      {mode === "select" && (
        <>
          <button
            className={clsx(
              styles.actionButton,
              styles.enabled,
              styles.iconButton,
            )}
            data-cy="select-all"
            onClick={actions.selectAll}
            title="Select All"
          >
            <CheckCheck size={16} />
          </button>
          <button
            className={clsx(
              styles.actionButton,
              styles.enabled,
              styles.iconButton,
            )}
            data-cy="clear"
            onClick={actions.clearSelection}
            title="Clear Selections"
          >
            <X size={16} />
          </button>
        </>
      )}
    </div>
  );
}

function PaletteCard({
  pickerColor,
  setPickerColor,
  cardState,
  actions,
  mode,
  isSynced,
  setIsSynced,
  snapshotRef,
  syncTimerRef,
  historyCounter,
}: {
  pickerColor: HexColor;
  setPickerColor: (hex: HexColor) => void;
  cardState: PaletteCard;
  actions: PaletteCardActions;
  mode: PaletteMode;
  isSynced: boolean;
  setIsSynced: (v: boolean) => void;
  snapshotRef: RefObject<PaletteCard | null>;
  syncTimerRef: RefObject<Timeout | null>;
  historyCounter: number;
}) {
  const selectedColor =
    mode === "select"
      ? null
      : cardState.selectedColorIds.length === 1
        ? cardState.colors.find((c) => c.id === cardState.selectedColorIds[0])
        : null;
  const wasSyncedRef = useRef(false);
  const pickerColorValue = pickerColor.to_code();

  // when sync toggles on, set picker <- palette
  useEffect(() => {
    if (!isSynced) {
      wasSyncedRef.current = false;
      return;
    }

    // handle toggle on
    if (!wasSyncedRef.current) {
      wasSyncedRef.current = true;

      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
        if (snapshotRef.current) {
          actions.commitToHistory(snapshotRef.current);
          snapshotRef.current = null;
        }
      }

      if (selectedColor) setPickerColor(selectedColor.hex);
    }
  }, [selectedColor?.id, isSynced]);

  // during sync, set picker -> palette
  useEffect(() => {
    if (!isSynced || !selectedColor || !wasSyncedRef.current) return;

    if (!snapshotRef.current) {
      snapshotRef.current = cardState; // capture pre-change state once
    }

    actions.setColorValueSilent(selectedColor.id, pickerColor);

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      actions.commitToHistory(snapshotRef.current!);
      snapshotRef.current = null;
    }, SYNC_DELAY);
  }, [pickerColorValue]);

  // when selection changes, set picker <- palette
  useEffect(() => {
    if (!isSynced || !selectedColor) return;

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
      if (snapshotRef.current) {
        snapshotRef.current = null;
      }
    }

    setPickerColor(selectedColor.hex);
  }, [selectedColor?.id]);

  // undo/redo, set picker <- palette
  useEffect(() => {
    if (!isSynced || !selectedColor || !wasSyncedRef.current) return;

    setPickerColor(selectedColor.hex);
  }, [historyCounter]);

  return (
    <div className={styles.cardWrapper} data-cy="palette-card">
      <SyncButton isSynced={isSynced} setIsSynced={setIsSynced} />
      <CardHeader name={cardState.name} onNameChange={actions.setCardName} />
      <PickerColor
        pickerColor={pickerColor}
        setPickerColor={setPickerColor}
        selectedColor={selectedColor?.hex || null}
        isSynced={isSynced}
      />
      <PaletteColor
        selectedColor={selectedColor?.hex || null}
        pickerColor={pickerColor}
        paletteColorId={selectedColor?.id || null}
        setPaletteColor={actions.setColorValue}
        isSynced={isSynced}
      />
      <Palette cardState={cardState} actions={actions} mode={mode} />
    </div>
  );
}

function SyncButton({
  isSynced,
  setIsSynced,
}: {
  isSynced: boolean;
  setIsSynced: (v: boolean) => void;
}) {
  return (
    <div
      className={styles.sync}
      data-cy="sync"
      onClick={() => setIsSynced(!isSynced)}
      aria-pressed={isSynced}
      style={{
        color: isSynced ? "#292929" : "#7a7a7a",
      }}
      title={isSynced ? "Unsync Picker & Palette" : "Sync Picker and Palette"}
    >
      <span className={styles.leftSpan}>Picker</span>
      <span className={styles.middleSpan}>
        {isSynced ? <RefreshCw size={22} /> : <RefreshCwOff size={22} />}
      </span>
      <span className={styles.rightSpan}>Palette</span>
    </div>
  );
}

function CardHeader({
  name,
  onNameChange,
}: {
  name: string;
  onNameChange: (name: string) => void;
}) {
  return (
    <div className={styles.cardHeader} data-cy="card-header">
      <EditableField
        testID="card-name"
        value={name}
        setValue={onNameChange}
        buttonSize={12}
      />
    </div>
  );
}

function PickerColor({
  pickerColor,
  setPickerColor,
  selectedColor,
  isSynced,
}: {
  pickerColor: HexColor;
  setPickerColor: (hex: HexColor) => void;
  selectedColor: HexColor | null;
  isSynced: boolean;
}) {
  const arrowToken = useContrastToken(() => luminanceFromHex(pickerColor));

  const handleClick = () => {
    if (!isSynced && selectedColor) {
      setPickerColor(selectedColor);
    }
  };

  return (
    <div
      className={clsx(styles.previewPane, styles.pickerColor)}
      data-cy="picker-preview"
      style={{
        cursor: isSynced ? "unset" : "pointer",
        backgroundColor: formatHexString(pickerColor),
      }}
      onClick={handleClick}
      title={!isSynced ? "Set to Palette Color" : ""}
    >
      {!isSynced && (
        <div
          data-cy="picker-color-arrow"
          className={clsx(styles.arrowIndicator, {
            [styles.arrowIndicatorDark]: arrowToken === "dark",
            [styles.arrowIndicatorLight]: arrowToken === "light",
          })}
        >
          <ChevronsLeft size={32} />
        </div>
      )}
    </div>
  );
}

function PaletteColor({
  selectedColor,
  pickerColor,
  paletteColorId,
  setPaletteColor,
  isSynced,
}: {
  selectedColor: HexColor | null;
  pickerColor: HexColor;
  paletteColorId: string | null;
  setPaletteColor: (id: string, hex: HexColor) => void;
  isSynced: boolean;
}) {
  const bgColor = selectedColor || DEFAULT_BG;
  const arrowToken = useContrastToken(() => luminanceFromHex(bgColor));

  const handleClick = () => {
    if (!isSynced && paletteColorId) {
      setPaletteColor(paletteColorId, pickerColor);
    }
  };

  return (
    <div
      className={clsx(styles.previewPane, styles.paletteColor)}
      data-cy="selected-preview"
      style={{
        cursor: isSynced ? "unset" : "pointer",
        backgroundColor: formatHexString(bgColor),
      }}
      onClick={handleClick}
      title={!isSynced ? "Set to Picker Color" : ""}
    >
      {!isSynced && (
        <div
          data-cy="palette-color-arrow"
          className={clsx(styles.arrowIndicator, {
            [styles.arrowIndicatorDark]: arrowToken === "dark",
            [styles.arrowIndicatorLight]: arrowToken === "light",
          })}
        >
          <ChevronsRight size={32} />
        </div>
      )}
    </div>
  );
}

function Palette({
  cardState,
  actions,
  mode,
}: {
  cardState: PaletteCard;
  actions: PaletteCardActions;
  mode: PaletteMode;
}) {
  const {
    containerRef,
    setItemRef,
    isDragging,
    // sourceIndex,
    targetIndex,
    previewItems,
  } = useDragAndDrop({
    items: cardState.colors,
    handleReorder: actions.reorderColors,
    disabled: mode !== "reorder",
  });

  const handleNormalClick = (color: PaletteColor) => {
    const ids = cardState.selectedColorIds;
    const isSelected = ids.includes(color.id);
    console.log(color.id, isSelected);
    if (isSelected) {
      actions.setSelectedColors([]);
    } else {
      actions.setSelectedColors([color.id]);
    }
  };

  const handleSelectClick = (color: PaletteColor) => {
    const ids = cardState.selectedColorIds;
    const next = ids.includes(color.id)
      ? ids.filter((id) => id !== color.id)
      : [...ids, color.id];
    actions.setSelectedColors(next);
  };

  const onRowClick =
    mode === "normal"
      ? handleNormalClick
      : mode === "select"
        ? handleSelectClick
        : undefined;

  const displayColors = isDragging ? previewItems : cardState.colors;

  return (
    <div className={styles.palette} data-cy="palette" ref={containerRef}>
      {displayColors.length > 0 ? (
        displayColors.map((color, index) => (
          <PaletteRow
            key={color.id}
            color={color}
            index={index}
            isSelected={cardState.selectedColorIds.includes(color.id)}
            isEditable={
              mode === "normal" && cardState.selectedColorIds[0] === color.id
            }
            isDragging={isDragging}
            mode={mode}
            actions={actions}
            onRowClick={onRowClick}
            setItemRef={setItemRef}
            targetIndex={targetIndex}
          />
        ))
      ) : (
        <span style={{ margin: 8 }}>
          No colors in palette. Press{" "}
          <Plus size={16} style={{ transform: "translateY(2px)" }} /> in the
          toolbar above to add one.
        </span>
      )}
    </div>
  );
}

function PaletteRow({
  color,
  index,
  isSelected,
  isEditable,
  isDragging,
  mode,
  actions,
  onRowClick,
  setItemRef,
  targetIndex,
}: {
  color: PaletteColor;
  index: number;
  isSelected: boolean;
  isEditable: boolean;
  isDragging: boolean;
  mode: PaletteMode;
  actions: PaletteCardActions;
  onRowClick?: (color: PaletteColor, e: MouseEvent<HTMLDivElement>) => void;
  setItemRef: (el: HTMLElement | null, id: string) => void;
  targetIndex: number;
}) {
  const isNormalMode = mode === "normal";
  const isSelectMode = mode === "select";
  const isReorderMode = mode === "reorder";

  const Wrapper = isReorderMode ? motion.div : "div";
  const motionProps = isReorderMode
    ? { layout: true, transition: { duration: 0.25 } }
    : {};

  const token = useContrastToken(() => luminanceFromHex(color.hex));

  return (
    <Wrapper
      className={clsx(styles.paletteRowWrapper, {
        [styles.draggable]: isReorderMode,
        [styles.dragging]: isDragging && index === targetIndex,
        [styles.multiSelected]: isSelectMode && isSelected,
      })}
      ref={(el) => setItemRef(el, color.id)}
      data-cy={`palette-row-${index}-wrapper`}
      data-item-id={color.id}
      onClick={(e) => onRowClick?.(color, e)}
      {...motionProps}
    >
      <div
        className={styles.paletteRow}
        data-cy={`palette-row-${index}`}
        aria-selected={isSelected}
        style={{
          backgroundColor: formatHexString(color.hex),
        }}
      >
        {isSelectMode && (
          <span
            className={clsx(styles.modeDecorator, styles.checkDecorator, {
              [styles.checkDecoratorSelected]: isSelected,
              [styles.checkDecoratorDark]: token === "dark",
              [styles.checkDecoratorLight]: token === "light",
            })}
          >
            {isSelected && <Check size={18} strokeWidth={3} />}
          </span>
        )}
        {mode === "reorder" && (
          <span
            className={clsx(styles.modeDecorator, {
              [styles.gripDark]: token === "dark",
              [styles.gripLight]: token === "light",
            })}
          >
            <GripVertical size={24} />
          </span>
        )}
        {isNormalMode &&
          (isSelected ? (
            <Crosshair
              className={clsx(styles.selectedIndicator, {
                [styles.indicatorDark]: token === "dark",
                [styles.indicatorLight]: token === "light",
              })}
              size={27}
            >
              <Dot />
            </Crosshair>
          ) : (
            <CircleDashed
              className={clsx(styles.targettedIndicator, {
                [styles.indicatorDark]: token === "dark",
                [styles.indicatorLight]: token === "light",
              })}
              size={32}
            />
          ))}
        <div className={styles.paletteRowData}>
          <div className={styles.colorName}>
            {isEditable ? (
              <EditableField
                testID={`palette-row-name-${index}`}
                value={color.name}
                setValue={(newName: string) =>
                  actions.setColorName(color.id, newName)
                }
                buttonSize={12}
                contrastToken={token}
                reset={!isSelected}
              />
            ) : (
              <div>
                <span
                  data-cy={`palette-row-name-${index}`}
                  className={clsx(styles.field, {
                    [styles.fieldDark]: token === "dark",
                    [styles.fieldLight]: token === "light",
                  })}
                >
                  {color.name}
                </span>
              </div>
            )}
          </div>
          <div className={styles.colorHex}>
            {isEditable ? (
              <EditableField
                testID={`palette-row-hex-${index}`}
                value={color.hex.to_code()}
                setValue={(newHex: string) =>
                  actions.setColorValue(color.id, HexColor.from_code(newHex))
                }
                buttonSize={12}
                contrastToken={token}
                reset={!isSelected}
                validate={(raw: string) => extractHexValue(raw)}
                render={(raw: string) => `#${raw}`}
              />
            ) : (
              <div className={styles.fieldWrapper}>
                <span
                  data-cy={`palette-row-hex-${index}`}
                  className={clsx(styles.field, {
                    [styles.fieldDark]: token === "dark",
                    [styles.fieldLight]: token === "light",
                  })}
                >
                  {formatHexString(color.hex)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

function EditableField({
  testID,
  value,
  setValue,
  buttonSize,
  contrastToken,
  reset,
  validate,
  render,
}: {
  testID: string;
  value: string;
  setValue: (v: string) => void;
  buttonSize: number;
  contrastToken?: ContrastToken;
  reset?: boolean;
  validate?: (raw: string) => string | null;
  render?: (raw: string) => string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reset) setIsEditing(false);
  }, [reset]);

  useEffect(() => {
    // return if not editing or not rendered
    if (!isEditing || !spanRef.current) return;

    // set span content
    spanRef.current.textContent = render ? render(value) : value;

    // focus span
    spanRef.current.focus();

    // select contents
    const range = document.createRange();
    range.selectNodeContents(spanRef.current);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
  }, [isEditing, value, render]);

  const onConfirm = () => {
    const raw = spanRef.current?.textContent ?? "";
    const validated = validate ? validate(raw) : raw;
    if (validated) setValue(validated);
    setIsEditing(false);
  };

  const onCancel = () => {
    window.getSelection()?.removeAllRanges();
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    } else if (e.key === "Enter") {
      e.preventDefault();
      onConfirm();
    }
  };

  return (
    <div className={styles.editableFieldWrapper}>
      <div className={styles.valueWrapper}>
        <span
          ref={spanRef}
          data-cy={isEditing ? `${testID}-input` : testID}
          className={clsx(styles.editableField, {
            [styles.editingField]: isEditing,
            [styles.editableFieldDark]: contrastToken === "dark",
            [styles.editableFieldLight]: contrastToken === "light",
          })}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onClick={(e) => e.stopPropagation()}
          onKeyDown={isEditing ? handleKeyDown : undefined}
        >
          {!isEditing && (render ? render(value) : value)}
        </span>
      </div>
      {isEditing ? (
        <div>
          <button
            data-cy={`${testID}-cancel`}
            className={clsx(styles.editableFieldButton, {
              [styles.editableFieldButtonDark]: contrastToken === "dark",
              [styles.editableFieldButtonLight]: contrastToken === "light",
            })}
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            title="Cancel"
          >
            <X size={buttonSize} strokeWidth={3} />
          </button>
          <button
            data-cy={`${testID}-confirm`}
            className={clsx(styles.editableFieldButton, {
              [styles.editableFieldButtonDark]: contrastToken === "dark",
              [styles.editableFieldButtonLight]: contrastToken === "light",
            })}
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            title="Confirm"
          >
            <Check size={buttonSize} strokeWidth={3} />
          </button>
        </div>
      ) : (
        <div>
          <button
            data-cy={`${testID}-edit`}
            className={clsx(styles.editableFieldButton, {
              [styles.editableFieldButtonDark]: contrastToken === "dark",
              [styles.editableFieldButtonLight]: contrastToken === "light",
            })}
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            title="Edit"
          >
            <Pencil size={buttonSize} strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
}

export default PaletteEditor;
