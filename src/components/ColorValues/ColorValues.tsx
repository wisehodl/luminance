import * as colorlib from "colorlib";

import styles from "./ColorValues.module.css";
import SpaceEditor from "./SpaceEditor";

function ColorValues({ selectedColor }: { selectedColor: colorlib.Color }) {
  return <div className={styles.wrapper}></div>;
}

export default ColorValues;
