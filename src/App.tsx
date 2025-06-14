import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import * as colorlib from "colorlib";
import "./App.css";
import style from "./App.module.css";
import clsx from "clsx";

function App() {
  const [count, setCount] = useState(0);
  const color = colorlib.Color.from_hex("123123");

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className={clsx(style.card)}>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p className={clsx(style.test)}>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        <p>The color is: {color.hex.to_code()}</p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
