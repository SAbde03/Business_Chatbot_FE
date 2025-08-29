"use client";
import Chatbot from './chatbot/page';
import LandingPage from './landingpage/page';
import Dashboard from './components/charts/piechart';
import Sidebar from './components/sideBar';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from 'react';
import PieChart from "./components/charts/piechart";
import { CrossIcon } from 'lucide-react';
import { AiFillCloseCircle } from 'react-icons/ai';
import { RiFileCloseFill, RiFileCloseLine } from 'react-icons/ri';
import FranceChoropleth from "./components/charts/FranceChoropleth"
import Link from 'next/link';
interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}
export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [popupIsOpen, setpopIsOpen] = useState(true);
  const router = useRouter();

const goToChatbot = () => {
    router.push('./chatbot');
  };

  return (
    <main className="flex min-h-screen bg-zinc-800">
      <div className="w-full max-w-full">
        <Chatbot/>
      </div>
    </main>
  );
}