import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Root layout — wraps all pages with Navbar + Footer.
 */
const RootLayout = () => {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden w-full max-w-full">
      <Navbar />
      <main className="flex-1 w-full overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
