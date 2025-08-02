import type { ReactNode } from "react";

import clsx from "clsx";

import styles from "./SideMenu.module.css";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

interface BaseMenuProps extends SideMenuProps {
  position: "left" | "right";
}

function BaseMenu({ isOpen, onClose, children, position }: BaseMenuProps) {
  const isLeftMenu = position === "left";
  const menuId = `${position}-side-menu`;

  const handleUnderlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={clsx(styles.sideMenuUnderlay, { [styles.open]: isOpen })}
      onClick={handleUnderlayClick}
      aria-hidden={!isOpen}
    >
      <div
        id={menuId}
        role="dialog"
        aria-modal="true"
        aria-label={`${position} side menu`}
        data-cy={`${position}-menu`}
        className={clsx(
          styles.sideMenu,
          isLeftMenu ? styles.left : styles.right,
          { [styles.open]: isOpen },
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={clsx(
            styles.menuWrapper,
            isLeftMenu ? styles.left : styles.right,
          )}
        >
          <div className={styles.topNav}>
            <button
              aria-label="Close menu"
              data-cy="close-menu"
              className={styles.closeButton}
              onClick={onClose}
            >
              ×
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function newSideMenu(position: "left" | "right") {
  return function SideMenu({ isOpen, onClose, children }: SideMenuProps) {
    return (
      <BaseMenu isOpen={isOpen} onClose={onClose} position={position}>
        {children}
      </BaseMenu>
    );
  };
}

const LeftMenu = newSideMenu("left");
const RightMenu = newSideMenu("right");

export { LeftMenu, RightMenu };
