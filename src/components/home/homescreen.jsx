"use client";
import React from "react";
import { useEffect, useState } from "react";
import Footer from "../Ultimit/footer";
import Header from "../Ultimit/header";
import HomePage from "./homepage/HomePage";
import LoadingScreen from "../Ultimit/loading";

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
    
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000); // 2 ثانية
    return () => clearTimeout(timer);
  }, []);
  if (loading) return <LoadingScreen />;

  return (
    <>
      <Header />
      <HomePage />
      <Footer />
    </>
  );
}
