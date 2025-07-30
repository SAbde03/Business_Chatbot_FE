"use client";
import Chatbot from './components/Chatbot';
import Sidebar from './components/sideBar';
import { useState } from 'react';
interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}
export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <main className="flex min-h-screen bg-zinc-800">

        <Sidebar/>
      <div className="flex-1 flex  justify-center items-start p-4 md:p-5">
    <div className="w-full max-w-full ">
      <Chatbot />
    </div>
  </div>
    </main>
  );
}