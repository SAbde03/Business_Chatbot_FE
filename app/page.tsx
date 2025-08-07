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
      <div className={`fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto ${!popupIsOpen ? 'w-0 h-0' :' w-[100%] h-[100%]  backdrop-blur-[0.8px] bg-zinc-950/90' }`}>
        {popupIsOpen ? (
          <>
          <div className={`relative  gap-2 bg-transparent to-blue-950 p-6 rounded-lg shadow-xl ' w-[90%] h-[95%]`}>
            <button className='absolute right-8 bg-zinc' onClick={() => setpopIsOpen(false)}><AiFillCloseCircle className='text-white '></AiFillCloseCircle></button>
            <div className='h-fit'>
              <PieChart/>
              <FranceChoropleth />
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