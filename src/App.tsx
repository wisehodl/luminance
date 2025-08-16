import { useState } from "react";

import clsx from "clsx";
import { Color } from "colorlib";

import ColorHistory from "@/components/ColorHistory/ColorHistory";
import ColorPicker from "@/components/ColorPicker/ColorPicker";
import ColorValues from "@/components/ColorValues/ColorValues";
import { LeftMenu, RightMenu } from "@/components/SideMenu";
import { useMediaQuery } from "@/providers/hooks";
import { useSelectedColor } from "@/providers/hooks";

import styles from "./App.module.css";
import { formatCssRgb } from "./util";

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
  const { selectedColor, selectedColorActions } = useSelectedColor();

  return (
    <section className={styles.mobileFirstZone} aria-label="Color tools">
      <div
        className={styles.tabWrapper}
        role="region"
        aria-roledescription="carousel"
        aria-label="Swipe left or right to view different tools"
      >
        <div
          className={clsx(styles.tab, styles.colorPickerWrapper)}
          role="group"
          aria-roledescription="slide"
          aria-label="Color Picker"
        >
          <ColorPicker color={selectedColor} actions={selectedColorActions} />
        </div>
        <div
          className={clsx(styles.tab, styles.colorValuesWrapper)}
          role="group"
          aria-roledescription="slide"
          aria-label="Color values"
        >
          <ColorValues color={selectedColor} actions={selectedColorActions} />
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
  const { isMobilePortrait, isMobileLandscape } = useMediaQuery();

  return (
    <main className={styles.mobileContent}>
      {isMobilePortrait && (
        <MobileTopNav
          onLeftMenuClick={toggleLeftMenu}
          onRightMenuClick={toggleRightMenu}
          isLeftMenuOpen={isLeftMenuOpen}
          isRightMenuOpen={isRightMenuOpen}
        />
      )}

      {isMobileLandscape && (
        <MobileLeftNav onClick={toggleLeftMenu} isOpen={isLeftMenuOpen} />
      )}

      <MobileFirstZone />
      <MobileSecondZone />

      {isMobileLandscape && (
        <MobileRightNav onClick={toggleRightMenu} isOpen={isRightMenuOpen} />
      )}

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
  const { selectedColor, selectedColorActions } = useSelectedColor();

  return (
    <section className={styles.firstZone} aria-label="Color tools">
      <div className={styles.colorPickerWrapper} aria-label="Color picker">
        <ColorPicker color={selectedColor} actions={selectedColorActions} />
      </div>
      <div className={styles.colorValuesWrapper} aria-label="Color values">
        <ColorValues color={selectedColor} actions={selectedColorActions} />
      </div>
    </section>
  );
}

function SecondZone() {
  const { selectedColor, selectedColorActions } = useSelectedColor();

  return (
    <section className={styles.secondZone} aria-label="Palette tools">
      <div className={styles.colorHistoryWrapper} aria-label="Color History">
        <ColorHistory
          color={selectedColor}
          setColor={selectedColorActions.common.setColor}
          disabled={false}
        />
      </div>
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
    <div className={styles.mainLayout}>
      <header className={styles.appHeader}>
        <span className={styles.title}>LUMINANCE</span>
        <span className={styles.subtitle}>A color picker for humans.</span>
      </header>
      <FirstZone />
      <SecondZone />
    </div>
  );
}

// Main App Component

function App() {
  const [isRightMenuOpen, setIsRightMenuOpen] = useState(false);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  // const { isDesktop } = useMediaQuery();
  const isDesktop = true;

  const lum = 0.75;
  const chr = 0.8;
  const steps = 8;

  const colors = Array.from({ length: steps }, (_, index) => {
    const hue = (index * 360) / (steps - 1);
    return Color.from_hcl(hue, chr, lum);
  });

  const colorGradient = colors
    .map((color, index) => {
      const colorString = formatCssRgb(color.hex);
      const percentage = (index / (colors.length - 1)) * 100;
      return `${colorString} ${percentage}%`;
    })
    .join(", ");

  return (
    <div
      className={styles.background}
      style={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(180deg, ${colorGradient})`,
      }}
    >
      <div className={styles.appWrapper} role="application">
        {!isDesktop && (
          <MobileContent
            isLeftMenuOpen={isLeftMenuOpen}
            setIsLeftMenuOpen={setIsLeftMenuOpen}
            isRightMenuOpen={isRightMenuOpen}
            setIsRightMenuOpen={setIsRightMenuOpen}
          />
        )}

        {isDesktop && <DesktopContent />}
      </div>
    </div>
  );
}

export default App;
