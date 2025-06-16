import styles from "./ColorValues.module.css";

function ColorValues() {
  return (
    <div className={styles.container}>
      <div className={styles.valueItem}>RGB: 255, 0, 0</div>
      <div className={styles.valueItem}>HEX: #FF0000</div>
      <div className={styles.valueItem}>HSL: 0, 100%, 50%</div>
    </div>
  );
}

export default ColorValues;
