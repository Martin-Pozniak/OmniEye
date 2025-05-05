import Link from "next/link";

export default function NavigationMenu() {
  return (
    <nav className="flex flex-row justify-around p-4 bg-gray-00 shadow-md w-full">

      <div className="flex items-center space-x-2">
        <img src="/logo.png" alt="Omni Eye Logo" className="h-8 w-8 rounded-full" />
        <Link href="/" className="text-2xl font-bold text-red-700">
          OmniEye
        </Link>
      </div>
      {/* Navigation Links */}
      <Link href="/" className="text-lg text-red-700 hover:underline">
        Home
      </Link>
      <Link href="/about" className="text-lg text-red-700 hover:underline">
        About
      </Link>
      <Link href="/contact" className="text-lg text-red-700 hover:underline">
        Contact
      </Link>
    </nav>
  );
}