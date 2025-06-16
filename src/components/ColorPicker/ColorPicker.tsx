import styles from "./ColorPicker.module.css";

function ColorPicker() {
  return (
    <div className={styles.container}>
      <div className={styles.pickerSquare}>Square</div>
      <div className={styles.pickerBar}>Bar</div>
    </div>
  );
}

export default ColorPicker;
