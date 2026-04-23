import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { LibraryProvider, useLibrary } from "./context/LibraryContext";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { SearchSection } from "./components/SearchSection";
import { Categories } from "./components/Categories";
import { FeaturedBooks } from "./components/FeaturedBooks";
import { CTABanner } from "./components/CTABanner";
import { Footer } from "./components/Footer";
import { LibraryModal } from "./components/LibraryModal";

const HomeInner = () => {
  const { openModal } = useLibrary();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="App relative">
      <Header onOpenLibrary={openModal} />
      <main>
        <Hero onOpenLibrary={openModal} />
        <SearchSection onSearch={setSearchQuery} />
        <Categories />
        <FeaturedBooks searchQuery={searchQuery} />
        <CTABanner onOpenLibrary={openModal} />
      </main>
      <Footer />
      <LibraryModal />
    </div>
  );
};

function App() {
  return (
    <LibraryProvider>
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "#051a09",
            color: "#f4f1e1",
            border: "1px solid rgba(201,162,39,0.3)",
            fontFamily: "'DM Sans', sans-serif",
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeInner />} />
        </Routes>
      </BrowserRouter>
    </LibraryProvider>
  );
}

export default App;
