import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-8 max-w-2xl">
        <h1 className="text-display-lg md:text-display-xl font-display text-primary tracking-wider text-shadow">
          TRACKFOLIO
        </h1>
        <p className="text-xl text-secondary">
          Investment Portfolio Tracking & Sandbox Trading Analysis
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="btn-primary">
            Log In
          </Link>
          <Link href="/register" className="btn-secondary">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
