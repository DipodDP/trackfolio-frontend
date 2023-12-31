import { A, Link } from "@solidjs/router";

export function Navigation() {
  return (
<nav class="flex justify-between items-center h-[50px] px-5 shadow-md bg-gray-500 text-white">
      <A href="/">
        <h3 class="font-bold">Trackfolio</h3>
      </A>

      <span>
        <A href="/Portfolio" class="mr-2">Portfolio</A>
        <A href="/account">Account</A>
      </span>
    </nav>
  )
}
