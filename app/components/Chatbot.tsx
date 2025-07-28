'use client'

import { useState, useRef, useEffect } from 'react'
import { FiSend, FiUser, FiMessageSquare } from 'react-icons/fi'
import Message from './message'
import ProfileCard from './card'
import Badge from './badge'
import { Inter, Roboto, Open_Sans } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
const roboto = Roboto({ subsets: ['latin'] });
const openSans = Open_Sans({ subsets: ['latin'] });
type MessageType = {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  cardData?: string[]
  isClicked?: boolean
  data?: string
  analysis?: string
  isCard?: boolean
  isClickedB2B?: boolean
  isClickedB2C?: boolean
}



export default function Chatbot() {
  const [isClickedB2B, setIsClickedB2B] = useState(false);
  const [isClickedB2C, setIsClickedB2C] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: MessageType = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      isCard:false,
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
  
    
    
    try {
      
      const response = await fetch('http://localhost:3002/api/crew', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ choice: isClickedB2B ? 'b2b' : isClickedB2C ? 'b2c' : 'default', input: inputValue }),
      })

      
      
      if (isClickedB2B || isClickedB2C) {

      const res = await response.json();
      const csv=res.csv;
      const analysis = res.response;
      const data = csv.text(); 
      
     
      const rows = data.split('\n');

      
      const firstDataRow = rows[1]; // Second line (first data row)
      const firstDataValues = firstDataRow.split(',');
          
      const botMessage: MessageType = {
        id: Date.now().toString(),
        text:analysis,
        sender: 'bot',
        cardData: firstDataValues,
        data:data,
        isCard: true,
        timestamp: new Date(),
        isClickedB2B: isClickedB2B,
        isClickedB2C: isClickedB2C,
      }
      setMessages((prev) => [...prev, botMessage])
    } else {
      const data = await response.json();
      const botMessage: MessageType = {
        id: Date.now().toString(),
        text: data.response,
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: MessageType = {
        id: Date.now().toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        
      }

      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handleB2BClick = () => {
  // Create the profile card data
  setIsClickedB2B(!isClickedB2B);
  setIsClickedB2C(false);

  // Create a new message with the card
  const newMessage = {
    id: Date.now().toString(), // Unique ID
    text: "", // Optional accompanying text
    sender: "bot" as const,
    timestamp: new Date(),
    isCard: true,
  };
};
const handleB2CClick = () => {
  // Create the profile card data
  setIsClickedB2C(!isClickedB2C);
  setIsClickedB2B(false); // Reset B2B state if B2C is clicked
  // Create a new message with the card
  const newMessage = {
    id: Date.now().toString(), // Unique ID
    text: "", // Optional accompanying text
    sender: "bot" as const,
    timestamp: new Date(),
    isCard: true,
  

  /* Add to messages
  setMessages(prevMessages => [...prevMessages, newMessage]); */
};
}
 
const getText = (event: React.MouseEvent<HTMLDivElement>) => {
  const text = event.currentTarget.textContent || ''; // Fallback to empty string if null
  setInputValue(text);
};




 return (
  <div className="flex flex-col items-center col-reverse justify-center min-h  ">
     <Badge/>
     <div className={'${roboto.className} flex items-center justify-center p-4 bg-transparent rounded-t-lg text-s'}>
    Marketing Expert
    </div>
 <div 
  className={`flex flex-col h-[600px] ${isClickedB2B || isClickedB2C ? 'w-fit  rounded-lg bg-transparent' : 'w-[80%]'}`}>
   <div className="flex-1 overflow-y-auto min-w-10 max-w-300 bg-transparent">
  <pre className="h-full flex flex-col-reverse relative
  p-[10px]
  h-[410px]
  w-full
  overflow-y-auto  
  overflow-x-hidden  
  whitespace-nowrap  
  rounded-[8px]
  break-words
  [scrollbar-width:none]
  "> {/* Changed to flex-col-reverse */}
    <div className="p-4">
      {/* Render messages in normal order (flex-col-reverse handles the positioning) */}
      {messages.map((message) => (
        
      message.isCard  ? (
       
          
            
              
      <div key={message.id} className="mb-4">
        
        <Message key={message.id} message={message}/>
        <ProfileCard
        
        userName={`${message.cardData?.[3] ?? ' '} ${message.cardData?.[4] ?? ''}` || 'Unknown'}
        gender={message.cardData?.[5] || 'Unknown'}
        city={message.cardData?.[6] || 'Unknown'}
        country={message.cardData?.[7] || 'Unknown'}
        data={message.data}
        isClickedB2B={message.isClickedB2B}
        isClickedB2C={message.isClickedB2C}
        analysis={message.analysis}
        
          />
      </div>
    ) : (
      <Message key={message.id} message={message} />
      
    )
  ))}
      <div ref={messagesEndRef} />
    </div>
  </pre>
</div>
  <div className="flex gap-5 p-2 h-max w- mb-3 pl-3 bg-transparent overflow-x-auto">

    {isClickedB2C ? (
  <>
    <div className="p-2 h-max text-sm text-zinc-600 rounded-full transition-colors border clickable cursor-pointer hover:bg-white/20 hover:text-white active:bg-gray-200 border-zinc-600" onClick={getText}>Lister les hommes de paris</div>
    <div className="p-2 h-max text-sm text-zinc-600 rounded-full transition-colors border clickable cursor-pointer hover:bg-white/20 hover:text-white active:bg-gray-200 border-zinc-600"onClick={getText}>Les femmes d'origine francaise</div>
    <div className="p-2 h-max text-sm text-zinc-600 rounded-full transition-colors border clickable cursor-pointer hover:bg-white/20 hover:text-white active:bg-gray-200 border-zinc-600"onClick={getText}>les personnes qui travaillent à gucci</div>
  </>
    ) : isClickedB2B ? (
  <>
    <div className="p-2 h-max text-sm text-zinc-600 rounded-full transition-colors border clickable cursor-pointer hover:bg-white/20 hover:text-white active:bg-gray-200 border-zinc-600"onClick={getText}>Les restaurants sur Marseille</div>
    <div className="p-2 h-max text-sm text-zinc-600 rounded-full transition-colors border clickable cursor-pointer hover:bg-white/20 hover:text-white active:bg-gray-200 border-zinc-600"onClick={getText}>cafés qui ferment leur portes à dimanche</div>
    <div className="p-2 h-max text-sm text-zinc-600 rounded-full transition-colors border clickable cursor-pointer hover:bg-white/20 hover:text-white active:bg-gray-200 border-zinc-600"onClick={getText}>les numeros de tel qui commencent par +33 4</div>
  </>
   ) : null}
  </div>
    {/* Input form */}
    <form onSubmit={handleSubmit} className=" max-w-full p-4  rounded-lg bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300">
  {/* Button container - bottom left */}
  <div className="flex gap-3 mb-3 pl-3">
    <button
      type="button"
      onClick={handleB2BClick}
      className={`w-20 h-7 p-1 text-sm rounded-full transition-colors border ${
        isClickedB2B 
          ? 'bg-blue-300/10 text-blue-500 border-blue-500' 
          : 'bg-zinc-700 text-zinc-300 border-zinc-300 hover:bg-zinc-600' // Normal state
      }`}
      aria-label="Attach file"
    >
      B2B
    </button>
    <button
      type="button"
      onClick={handleB2CClick}
      className={`w-20 h-7 p-1 text-sm rounded-full transition-colors border ${
        isClickedB2C 
          ? 'bg-blue-300/10 text-blue-500 border-blue-500' 
          : 'bg-zinc-700 text-zinc-300 border-zinc-300 hover:bg-zinc-600' // Normal state
      }`}
    >
      B2C
    </button>
  </div>

  {/* Input group */}
  <div className="flex">
    <input
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder="Type your message..."
      className="flex-1 w-0 min-w-[100px] px-4 py-2 rounded-l-lg focus:outline-none bg-transparent text-white placeholder-zinc-400 "
    />
    <button
      type="submit"
      className="p-3 px-3 py-3 bg-white text-white rounded-full hover:bg-white-700 transition-colors focus:outline-none"
    >
      <FiSend className="text-lg text-black" />
    </button>
  </div>
</form>
  </div>
  </div>
)

}
