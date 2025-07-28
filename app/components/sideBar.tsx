"use client";

import {FiMessageSquare, FiMoreHorizontal, FiSidebar, FiX } from "react-icons/fi";
import { PiFileLockLight } from "react-icons/pi";
import { FiSearch } from "react-icons/fi";
import { useState } from 'react';



export default function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chats, setChats] = useState([
    { id: 1, name: "Marketing Expert"},
    
  ]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

 /* const createNewChat = () => {
    const newChat = {
      id: chats.length + 1,
      name: "New Chat",
      lastMessage: "",
      time: "Now",
      unread: 0
    };
    setChats([newChat, ...chats]);
  }; */
 
  return (
    <div className={`flex flex-col min-h-screen  bg-zinc-900 transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-20'}`}>
      
      
      <div className="flex justify-between items-center p-4 ">
        {isSidebarOpen ? (
          <span className="text-zinc-300 text-lg font-semibold whitespace-nowrap">
            ChatBot
          </span>
        ) : (
          null
        )}
        
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-700 text-zinc-300 hover:text-white transition-colors"
        >
          {isSidebarOpen ? <FiSidebar size={20} /> : <FiSidebar size={20} />}
        </button>
      </div>

      
      <div className="p-4 ">
        <button 
          //onClick={createNewChat}
          className={`flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors ${isSidebarOpen ? 'w-full py-2 px-4' : 'w-10 h-10 p-0'}`}
        >
          {isSidebarOpen ? (
            <>
              <FiMessageSquare className="mr-2" />
              New Chat
            </>
          ) : (
            <FiMessageSquare size={20} />
          )}
        </button>
      </div>

      
      <div className="flex-1 gap-1 p-5 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className="p-3 rounded-lg bg-zinc-800/20  cursor-pointer flex items-center text-xs"
          >
            
            
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-white font-medium truncate">{chat.name}</h3>
                  <button className="text-gray-400 hover:text-white">
                    <FiMoreHorizontal />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
