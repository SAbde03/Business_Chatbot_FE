"use client";
import Chatbot from './components/Chatbot';
import Dashboard from './components/dashboard';
import Sidebar from './components/sideBar';
import { useState } from 'react';
import HorizontalBarChart from "./components/charts/ProgressBar"
import PieChart from "./components/charts/piechart";
import { CrossIcon } from 'lucide-react';
import { AiFillCloseCircle } from 'react-icons/ai';
import { RiFileCloseFill, RiFileCloseLine } from 'react-icons/ri';
import FranceChoropleth from "./components/charts/FranceChoropleth"
interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}
export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [popupIsOpen, setpopIsOpen] = useState(true);
  return (
    <main className="flex min-h-screen bg-zinc-800">
      
        <Sidebar/>
      <div className="flex-1 flex  justify-center items-start p-4 md:p-5">
    <div className="w-full max-w-full">
      <Chatbot />
    </div>
  </div>
 
  
    </main>
  );
}