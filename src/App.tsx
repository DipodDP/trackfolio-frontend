import { createSignal } from 'solid-js';
import type { Component } from 'solid-js';
import { Routes, Route } from "@solidjs/router";

import Portfolio from "./pages/Portfolio"
import Account from "./pages/Account"

import logo from './logo.svg';
import styles from './App.module.css';
import { Navigation } from './components/Navigation';

// function App () {
//   const [darkTheme, setDarkTheme] = createSignal(false)
//   function toggleTheme() {
//     setDarkTheme(!darkTheme())
//   }
// }

const App: Component = () => {
  return (
    <>
      <Navigation />
      <div class={styles.App}>
        <header class={styles.header}>
          <h1 className="font-extralight">Hello from Tailwind</h1>
          {/* <img src={logo} class={styles.logo} alt="logo" /> */}
          {/* <p> */}
          {/*   Edit <code>src/App.tsx</code> and save to reload. */}
          {/* </p> */}
          {/* <a */}
          {/*   class={styles.link} */}
          {/*   href="https://github.com/solidjs/solid" */}
          {/*   target="_blank" */}
          {/*   rel="noopener noreferrer" */}
          {/* > */}
          {/*   Learn Solid */}
          {/* </a> */}
          <Routes>
            <Route path="/portfolio" component={ Portfolio } />
            <Route path="/account" component={ Account } />
          </Routes>
        </header>
      </div>
    </>
  );
};

export default App;
