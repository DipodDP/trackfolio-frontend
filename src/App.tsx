import { createSignal } from 'solid-js';
import type { Component } from 'solid-js';
import { Routes, Route, A } from "@solidjs/router";

import Home from "./pages/Home"

import logo from './logo.svg';
import styles from './App.module.css';

// function App () {
//   const [darkTheme, setDarkTheme] = createSignal(false)
//   function toggleTheme() {
//     setDarkTheme(!darkTheme())
//   }
// }

const App: Component = () => {
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <h1 className="font-extralight">Hello from Tailwind</h1>
        <img src={logo} class={styles.logo} alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          class={styles.link}
          href="https://github.com/solidjs/solid"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Solid
        </a>
        <A href="/">Home</A>
      </header>
      <Routes>
        <Route path="/" component={Home} />
      </Routes>
    </div>
  );
};

export default App;
