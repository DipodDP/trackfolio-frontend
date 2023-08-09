import { Link } from "@solidjs/router";

export function Navigation() {
  return (
<nav className="flex justify-between items-center h-[50px] px-5 shadow-md bg-gray-50
      text-white">
      <h3>Trackfolio</h3>

      <span>
        <Link to="/">Home</Link>
        <Link to="/account">Account</Link>
      </span>
    </nav>
  )
}
