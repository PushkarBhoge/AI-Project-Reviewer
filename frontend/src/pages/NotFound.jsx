import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-lg text-gray-500">Page not found</p>
      <Link
        to="/"
        className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
