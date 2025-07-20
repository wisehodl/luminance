import { useState } from "react";
import styles from "./App.module.css";
import ColorPicker from "./components/ColorPicker/ColorPicker";
import ColorValues from "./components/ColorValues/ColorValues";
import { LeftMenu, RightMenu } from "./components/SideMenu";
import clsx from "clsx";

// Menu Button Components

interface MenuButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

function LeftMenuButton({ onClick, isOpen }: MenuButtonProps) {
  return (
    <button
      className={styles.leftMenuButton}
      onClick={onClick}
      aria-label="Open left menu"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
    >
      ☰
    </button>
  );
}

function RightMenuButton({ onClick, isOpen }: MenuButtonProps) {
  return (
    <button
      className={styles.rightMenuButton}
      onClick={onClick}
      aria-label="Open right menu"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
    >
      ☰
    </button>
  );
}

// Mobile Layout Components

interface MenuStateProps {
  isRightMenuOpen: boolean;
  isLeftMenuOpen: boolean;
  setIsRightMenuOpen: (state: boolean) => void;
  setIsLeftMenuOpen: (state: boolean) => void;
}

function MobileTopNav({
  onLeftMenuClick,
  onRightMenuClick,
  isRightMenuOpen,
  isLeftMenuOpen,
}: {
  onLeftMenuClick: () => void;
  onRightMenuClick: () => void;
  isRightMenuOpen: boolean;
  isLeftMenuOpen: boolean;
}) {
  return (
    <nav className={styles.mobileTopNav} aria-label="Mobile top navigation">
      <LeftMenuButton onClick={onLeftMenuClick} isOpen={isLeftMenuOpen} />
      <RightMenuButton onClick={onRightMenuClick} isOpen={isRightMenuOpen} />
    </nav>
  );
}

function MobileLeftNav({ onClick, isOpen }: MenuButtonProps) {
  return (
    <nav className={styles.mobileLeftNav} aria-label="Mobile left navigation">
      <LeftMenuButton onClick={onClick} isOpen={isOpen} />
    </nav>
  );
}

function MobileRightNav({ onClick, isOpen }: MenuButtonProps) {
  return (
    <nav className={styles.mobileRightNav} aria-label="Mobile right navigation">
      <RightMenuButton onClick={onClick} isOpen={isOpen} />
    </nav>
  );
}

function MobileFirstZone() {
  return (
    <section className={styles.mobileFirstZone} aria-label="Color tools">
      <div className={styles.tabWrapper} role="tablist">
        <div
          className={clsx(styles.tab, styles.colorPickerWrapper)}
          role="tabpanel"
          aria-label="Color Picker"
        >
          <ColorPicker />
        </div>
        <div
          className={clsx(styles.tab, styles.colorValuesWrapper)}
          role="tabpanel"
          aria-label="Color values"
        >
          <ColorValues />
        </div>
      </div>
    </section>
  );
}

function MobileSecondZone() {
  return (
    <section className={styles.mobileSecondZone} aria-label="Palette tools">
      <div
        className={styles.paletteEditorWrapper}
        aria-label="Palette editor"
      ></div>
    </section>
  );
}

function MobileContent({
  isLeftMenuOpen,
  setIsLeftMenuOpen,
  isRightMenuOpen,
  setIsRightMenuOpen,
}: MenuStateProps) {
  const toggleRightMenu = () => setIsRightMenuOpen(!isRightMenuOpen);
  const toggleLeftMenu = () => setIsLeftMenuOpen(!isLeftMenuOpen);

  return (
    <main className={styles.mobileContent}>
      <MobileTopNav
        onLeftMenuClick={toggleLeftMenu}
        onRightMenuClick={toggleRightMenu}
        isLeftMenuOpen={isLeftMenuOpen}
        isRightMenuOpen={isRightMenuOpen}
      />

      <MobileLeftNav onClick={toggleLeftMenu} isOpen={isLeftMenuOpen} />

      <MobileFirstZone />
      <MobileSecondZone />

      <MobileRightNav onClick={toggleRightMenu} isOpen={isRightMenuOpen} />

      <LeftMenu
        isOpen={isLeftMenuOpen}
        onClose={() => setIsLeftMenuOpen(false)}
      >
        <div id="user-info" aria-label="User information">
          User Info
        </div>
      </LeftMenu>

      <RightMenu
        isOpen={isRightMenuOpen}
        onClose={() => setIsRightMenuOpen(false)}
      >
        <div
          id="palette-library"
          className={styles.paletteLibraryWrapper}
          aria-label="Palette library"
        >
          Palette Library
        </div>
      </RightMenu>
    </main>
  );
}

// Desktop Layout Components

function FirstZone() {
  return (
    <section className={styles.firstZone} aria-label="Color tools">
      <div className={styles.colorPickerWrapper} aria-label="Color picker">
        <ColorPicker />
      </div>

      <div className={styles.colorValuesWrapper} aria-label="Color values">
        <ColorValues />
      </div>
    </section>
  );
}

function SecondZone() {
  return (
    <section className={styles.secondZone} aria-label="Palette tools">
      <div
        className={styles.paletteEditorWrapper}
        aria-label="Palette editor"
      ></div>
      <div
        className={styles.paletteLibraryWrapper}
        aria-label="Palette library"
      ></div>
    </section>
  );
}

function DesktopContent() {
  return (
    <main className={styles.mainContent}>
      <FirstZone />
      <SecondZone />
    </main>
  );
}

// Main App Component

function App() {
  const [isRightMenuOpen, setIsRightMenuOpen] = useState(false);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);

  return (
    <div className={styles.appWrapper} role="application">
      <MobileContent
        isLeftMenuOpen={isLeftMenuOpen}
        setIsLeftMenuOpen={setIsLeftMenuOpen}
        isRightMenuOpen={isRightMenuOpen}
        setIsRightMenuOpen={setIsRightMenuOpen}
      />
      <DesktopContent />
    </div>
  );
}

export default App;
