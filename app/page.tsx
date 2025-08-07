"use client";
import Chatbot from './components/Chatbot';
import Dashboard from './components/dashboard';
import Sidebar from './components/sideBar';
import { useState } from 'react';
import HorizontalBarChart from "./components/charts/ProgressBar"
import PieChart from "./components/charts/piechart";
import { CrossIcon } from 'lucide-react';
import { AiFillCloseCircle } from 'react-icons/ai';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}
export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [popupIsOpen, setpopIsOpen] = useState(true);
  return (
    <main className="flex min-h-screen bg-zinc-800">
      <div className={`fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50 ${!popupIsOpen ? 'w-0 h-0' :' w-[95%] h-[95%]  backdrop-blur-[0.8px]' }`}>
        {popupIsOpen ? (
          <>
          <div className={`relative flex gap-2 bg-zinc-700 p-6 rounded-lg shadow-xl ' w-[95%] h-[95%]`}>
            <button className='absolute right-8' onClick={() => setpopIsOpen(false)}><AiFillCloseCircle></AiFillCloseCircle></button>
            <div className='w-[50%]'>
              <HorizontalBarChart/>
            </div>
            
            <div className=''>
              <PieChart/>
            </div>
            </div>
            </>
            ):null
          
        }
          </div>
        <Sidebar/>
      <div className="flex-1 flex  justify-center items-start p-4 md:p-5">
    <div className="w-full max-w-full ">
      <Chatbot />
    </div>
  </div>
 
  
    </main>
  );
}