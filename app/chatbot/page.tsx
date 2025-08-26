'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
    FiMessageSquare,
    FiDownload,
    FiSidebar,
    FiMoreHorizontal,
    FiSettings,
    FiArrowUp,
    FiSearch
} from 'react-icons/fi'
import Message from '../components/message';
import { Inter} from 'next/font/google'
import { BsFillSquareFill } from 'react-icons/bs'

import { RxCross1 } from "react-icons/rx";
import { BsFillBuildingsFill } from "react-icons/bs";
import DataAnalysisDashboard from '../components/charts/piechart';
import { FaUser } from "react-icons/fa";
import { IoStatsChartSharp } from 'react-icons/io5'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import {FiTrash2} from 'react-icons/fi';

const inter = Inter({ subsets: ['latin'] })

type Chat = {
    id: string
    name: string
    conversationId?: string
    messages: MessageType[]
}

type SourceItem = {
    title: string;
    url: string
}

type MessageType = {
    id: string
    text: string
    sender: 'user' | 'bot'
    timestamp: Date
    cardData?: string[]
    isClicked?: boolean
    data: string
    analysis?: string
    isCard?: boolean
    isClickedB2B?: boolean
    isClickedB2C?: boolean
    rows?: string[][]
    datatype?: string
    isStreaming?: boolean
    streamingComplete?: boolean
    status?:boolean
    header?:string[]
    isError?:boolean
    progress?: number
    sources?: SourceItem[]
}

function safeUUID(): string {
    try { return crypto.randomUUID(); } catch { return `${Date.now()}-${Math.random()}`; }
}
function getOrCreateUserId(): string {
    if (typeof window === 'undefined') return 'anon-ssr';
    const KEY = 'mem0_user_id';
    let uid = localStorage.getItem(KEY);
    if (!uid) {
        uid = `anon-${safeUUID()}`;
        localStorage.setItem(KEY, uid);
    }
    return uid;
}

class StreamingClient {
    private eventSource: EventSource | null = null;
    private baseUrl: string;
    private isConnected: boolean = false;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    startStream(
        userId: string,
        conversationId: string,
        searchEnabled: boolean,
        message: string,
        callbacks: {
        onConnect?: () => void;
        onChunk?: (chunk: string) => void;
        onComplete?: (fullResponse: string) => void;
        onError?: (error: string) => void;
        onHeartbeat?: () => void;
    }) {
        if (this.eventSource) {
            this.eventSource.close();
        }

        try {
            fetch(`${this.baseUrl}/api/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ input: message, userId, conversationId, searchEnabled})
            }).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Lire le stream
                const reader = response.body?.getReader();
                if (!reader) {
                    throw new Error('No response body reader available');
                }

                this.isConnected = true;
                if (callbacks.onConnect) callbacks.onConnect();

                const decoder = new TextDecoder();
                let buffer = '';

                const readStream = async (): Promise<void> => {
                    try {
                        const { done, value } = await reader.read();

                        if (done) {
                            console.log('Stream finished');
                            return;
                        }

                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n');
                        buffer = lines.pop() || '';

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                try {
                                    const data = JSON.parse(line.slice(6));
                                    this.handleStreamData(data, callbacks);
                                } catch (parseError) {
                                    console.error('Failed to parse stream data:', parseError);
                                }
                            }
                        }

                        // Continuer à lire
                        return readStream();
                    } catch (error) {
                        console.error('Stream reading error:', error);
                        this.isConnected = false;
                        //if (callbacks.onError) callbacks.onError(error.toString());
                    }
                };

                readStream();
            }).catch(error => {
                console.error('Stream connection error:', error);
                if (callbacks.onError) callbacks.onError(error.toString());
            });

        } catch (error) {
            console.error('Failed to start stream:', error);
            //if (callbacks.onError) callbacks.onError(error.toString());
        }
    }

    private handleStreamData(data: any, callbacks: {
        onConnect?: () => void;
        onChunk?: (chunk: string) => void;
        onComplete?: (fullResponse: string) => void;
        onError?: (error: string) => void;
        onHeartbeat?: () => void;
    }) {
        switch (data.type) {
            case 'start':
                console.log('Stream started:', data.message);
                break;
            case 'chunk':
                if (callbacks.onChunk) callbacks.onChunk(data.content);
                break;
            case 'complete':
                if (callbacks.onComplete) callbacks.onComplete(data.full_response);
                break;
            case 'final_result':
                if (callbacks.onComplete) callbacks.onComplete(data.content);
                break;
            case 'error':
            case 'stream_error':
            case 'generation_error':
                if (callbacks.onError) callbacks.onError(data.message);
                break;
            case 'heartbeat':
                if (callbacks.onHeartbeat) callbacks.onHeartbeat();
                break;
            case 'timeout':
                if (callbacks.onError) callbacks.onError('Délai d\'attente dépassé');
                break;
            case 'end':
                console.log('Stream ended');
                this.stopStream();
                break;
        }
    }

    stopStream() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        this.isConnected = false;
    }

    isStreamConnected(): boolean {
        return this.isConnected;
    }
}

export default function Chatbot() {

    const [status, setStatus] = useState(true)
    const [isClickedB2B, setIsClickedB2B] = useState(false)
    const [isClickedB2C, setIsClickedB2C] = useState(false)
    const [isSearchEnabled, setIsSearchEnabled] = useState(false)
    const [activeChatId, setActiveChatId] = useState('1');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [userId, setUserId] = useState<string>('')
    useEffect(() => { setUserId(getOrCreateUserId()); }, [])
    const makeConversationId = () => safeUUID()
    const [chats, setChats] = useState<Chat[]>([]);
    useEffect(() => {
        try {
            const raw = localStorage.getItem('mem0_chats');
            if (raw) {
                const revived = JSON.parse(raw, (k, v) => (k === 'timestamp' ? new Date(v) : v));
                if (Array.isArray(revived) && revived.length) setChats(revived);
            }
            const savedActive = localStorage.getItem('mem0_active_chat_id');
            if (savedActive) setActiveChatId(savedActive);
        } catch (e) {}
    }, []);
    useEffect(() => {
        try {
            localStorage.setItem('mem0_chats', JSON.stringify(chats));
            if (activeChatId) localStorage.setItem('mem0_active_chat_id', activeChatId);
        } catch (e) {}
    }, [chats, activeChatId]);
    const activeChat = chats.find(chat => chat.id === activeChatId);
    const messages = activeChat ? activeChat.messages : [];
    const [inputValue, setInputValue] = useState('')
    const [isStreaming, setIsStreaming] = useState(false)
    const [isClickedVisualize, setVisualize] = useState(false)
    const [currentStreamingMessageId, setCurrentStreamingMessageId] = useState<string | null>(null)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const streamingClient = useRef<StreamingClient | null>(null)

    useEffect(() => {
        streamingClient.current = new StreamingClient('http://localhost:3002')

        return () => {
            if (streamingClient.current) {
                streamingClient.current.stopStream()
            }
        }
    }, [])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])
    const appendMessage = (chatId: string, message: MessageType) => {
        setChats(prev =>
            prev.map(chat =>
                chat.id === chatId
                    ? { ...chat, messages: [...chat.messages, message] }
                    : chat
            )
        )
    }
    const updateMessage = (chatId: string, messageId: string, updater: (msg: MessageType) => MessageType) => {
        setChats(prev =>
            prev.map(chat =>
                chat.id === chatId
                    ? {
                        ...chat,
                        messages: chat.messages.map(msg =>
                            msg.id === messageId ? updater(msg) : msg
                        ),
                    }
                    : chat
            )
        )
    }
    const handleStreamingResponse = useCallback((chatId: string, userMessage: MessageType) => {
        if (!streamingClient.current) return
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;

        const streamingMessageId = `streaming-${Date.now()}`
        const initialBotMessage: MessageType = {
            id: streamingMessageId,
            text: '',
            sender: 'bot',
            timestamp: new Date(),
            isStreaming: true,
            streamingComplete: false,
            data: '',
        }

        appendMessage(chatId, initialBotMessage)
        setIsStreaming(true)

        const callbacks = {
            onChunk: (chunk: string) => {
                updateMessage(chatId, streamingMessageId, msg => ({
                    ...msg,
                    text: msg.text + chunk,
                    isStreaming: true,
                }))
            },
            onComplete: (fullResponse: string) => {
                updateMessage(chatId, streamingMessageId, msg => ({
                    ...msg,
                    text: fullResponse,
                    isStreaming: false,
                    streamingComplete: true,
                }))
                setIsStreaming(false)
            },
            onError: (error: string) => {
                updateMessage(chatId, streamingMessageId, msg => ({
                    ...msg,
                    text: error,
                    isStreaming: false,
                    streamingComplete: true,
                }))
                setIsStreaming(false)
            },
        }

        streamingClient.current.startStream(
            userId,
            chat?.conversationId ?? '',
            Boolean(isSearchEnabled),
            userMessage.text,
            callbacks)
    }, [chats, userId, isSearchEnabled])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim() || isStreaming) return

        // Ajouter le message utilisateur
        const userMessage: MessageType = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
            isCard: false,
            data:'',
        }
        setChats(prevChats =>
            prevChats.map(chat =>
                chat.id === activeChatId
                    ? { ...chat, messages: [...chat.messages, userMessage] }
                    : chat
            )
        );

        setInputValue('')

        try {
            // Requête par défaut, utiliser le streaming
            if (!isClickedB2B && !isClickedB2C) {
                handleStreamingResponse(activeChatId, userMessage)
            } else {
                // Pour B2B et B2C
                const chat = chats.find(c => c.id === activeChatId);
                const response = await fetch('http://localhost:3002/api/crew', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        choice: isClickedB2B ? 'b2b' : isClickedB2C ? 'b2c' : 'default',
                        input: inputValue,
                        userId,
                        conversationId: chat?.conversationId,
                        searchEnabled: false,
                    }),
                });


     setStatus(false)
      // Création d'un message temporaire pour le statut
      const tempMessage: MessageType = {
        id: `temp-${Date.now()}`,
        text: 'Traitement en cours...',
        sender: 'bot',
        isCard: false,
        timestamp: new Date(),
        status: false,
        data:'',
        isError:false
      };
      setChats(prevChats =>
      prevChats.map(chat =>
      chat.id === activeChatId
      ? { ...chat, messages: [...chat.messages, tempMessage] }
      : chat
        )
      );


                // Lecture du flux SSE
                const reader = response.body?.getReader();
                const decoder = new TextDecoder();
                let finalData = {
                    response: '',
                    csv: '',
                    headers: [] as string[]
            };

                while (reader) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n\n').filter(line => line.startsWith('data: '));

                    for (const line of lines) {
                        try {
                            const data = JSON.parse(line.replace('data: ', ''));

                            // Mise à jour du statut
                            if (data.status === 'processing') {
                                setChats(prevChats =>
                                    prevChats.map(chat =>
                                        chat.id === activeChatId
                                            ? {
                                                ...chat,
                                                messages: chat.messages.map(msg =>
                                                    msg.id === tempMessage.id
                                                        ? { ...msg, text: data.message, progress: data.progress }
                                                        : msg
                                                ),
                                            }
                                            : chat
                                    )
                                );
                            }
                            // Stockage des données finales
                            if (data.status === 'success') {
                                finalData = {
                                    response: data.response,
                                    csv: data.csv,
                                    headers: data.headers || []
                                };
                                setStatus(false);
                            }

                            // Gestion des erreurs
                            if (data.status === 'error') {
                                setChats(prevChats =>
                                    prevChats.map(chat =>
                                        chat.id === activeChatId
                                            ? {
                                                ...chat,
                                                messages: chat.messages.map(msg =>
                                                    msg.id === tempMessage.id
                                                        ? { ...msg, text: "Erreur", isError: true }
                                                        : msg
                                                ),
                                            }
                                            : chat
                                    )
                                );
                                setStatus(true)

                                return;
                            }

                        } catch (e) {
                            console.error('Error parsing SSE chunk:', e);
                        }
                    }
                }

                // Remplacement du message temporaire par le résultat final
                if (finalData.response) {
                    const rows = finalData.csv.split('\n').map((row: string) => row.split(','));

                    const botMessage: MessageType = {
                        id: Date.now().toString(),
                        text: finalData.response,
                        sender: 'bot',
                        data: finalData.csv,
                        rows: rows,
                        isCard: true,
                        timestamp: new Date(),
                        isClickedB2B: isClickedB2B,
                        isClickedB2C: isClickedB2C,
                        datatype: isClickedB2B ? 'b2b' : 'b2c',
                        status: true,
                    };

                    setChats(prevChats =>
                        prevChats.map(chat =>
                            chat.id === activeChatId
                                ? {
                                    ...chat,
                                    messages: [
                                        ...chat.messages.filter(msg => msg.id !== tempMessage.id),
                                        botMessage,
                                    ],
                                }
                                : chat
                        )
                    );

                }
            }
        } catch (error) {
            console.error(error)
            const errorMessage: MessageType = {
                id: Date.now().toString(),
                text: 'Désolé, j\'ai rencontré un problème.',
                sender: 'bot',
                isError:true,
                timestamp: new Date(),
                data:''
            }
            setChats(prevChats =>
                prevChats.map(chat =>
                    chat.id === activeChatId
                        ? { ...chat, messages: [...chat.messages, errorMessage] }
                        : chat
                )
            );

            setIsStreaming(false)
            setCurrentStreamingMessageId(null)
        }
    }

    const stopStreaming = () => {
        if (streamingClient.current) {
            streamingClient.current.stopStream()
        }

        setIsStreaming(false)
        setCurrentStreamingMessageId(null)
    }

    const handleDownload = (message: MessageType) => {
        if (!message.data) {
            console.error('No data available to download')
            return
        }

        const blob = new Blob([message.data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = message.isClickedB2B ? 'b2b_data.csv' : 'b2c_data.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
    }

    const handleB2BClick = () => {
        setIsClickedB2B(!isClickedB2B)
        setIsClickedB2C(false)
    }

    const handleB2CClick = () => {
        setIsClickedB2C(!isClickedB2C)
        setIsClickedB2B(false)
    }

    const getText = (event: React.MouseEvent<HTMLDivElement>) => {
        const text = event.currentTarget.textContent || ''
        setInputValue(text)
    }

    function handleVisualizeClick(): void {
        setpopIsOpen(!popupIsOpen)
    }
    const [popupIsOpen, setpopIsOpen] = useState(false);
    const handleNewChat = () => {
        const newId = Date.now().toString()
        const newChat: Chat = {
            id: newId,
            name: `Conversation ${chats.length + 1}`,
            messages: [
                {
                    id: '1',
                    text: 'Bonjour, comment puis-je vous aider?',
                    sender: 'bot',
                    timestamp: new Date(),
                    data: '',
                },
            ],
        }
        setChats(prev => [...prev, newChat])
        setActiveChatId(newId)
    }
    const handleEmptyChat = () => {
        const newId = Date.now().toString()
        const newChat: Chat = {
            id: newId,
            name: `Conversation ${chats.length + 1}`,
            messages: [
                {
                    id: '1',
                    text: 'Bonjour, comment puis-je vous aider?',
                    sender: 'bot',
                    timestamp: new Date(),
                    data: '',
                },
            ],
        }
        setChats(prev => [...prev, newChat])
        setActiveChatId(newId)
    }
    const handleDeleteChat = (chatId: string) => {
        setChats(prev => prev.filter(chat => chat.id !== chatId));
        if (activeChatId === chatId) {
            const remainingChats = chats.filter(chat => chat.id !== chatId);
            if (remainingChats.length > 0) {
                setActiveChatId(remainingChats[0].id); 
            } else {
                setActiveChatId(null); 
            }
        }
    };
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    return (

        <div className="flex items-center bg-zinc-850 w-full overflow-hidden ">

            <div className={`relative z-50 flex flex-col min-h-screen min-h-fit h-full bg-zinc-900  border-r border-white/30 transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-20'}`}>
                <div className='fixed flex  w-12 h-10 border-[1.5px] border-white bottom-3 left-2 rounded-full justify-center items-center hover:bg-gray-500/30 cursor-pointer transition-colors' >
                    <FiSettings className='m-2 text-white font-bold'/>
                </div>
                <div className={`flex  p-4 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>

                    <div className='opacity-80'>
                        {isSidebarOpen ? (
                            <img
                                src="/images/logo.png"
                                alt="Logo"
                                className="h-8 w-auto scale-80"
                            />
                        ) : (
                            null
                        )}
                    </div>
                    <div>
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-lg hover:bg-gray-500/10 text-zinc-300 hover:text-white transition-colors"
                        >
                            {isSidebarOpen ? <FiSidebar size={20} /> : <FiSidebar size={20} />}
                        </button>
                    </div>

                </div>


                <div className="p-4 ">
                    <button
                        onClick={handleEmptyChat}
                        className={`flex items-center justify-center rounded-lg  hover:bg-white/5 text-white hover:text-white text-[14px]  font-semibold transition-colors transition-all duration-600 ${isSidebarOpen ? 'w-full py-2 px-4 flex items-center justify-start' : 'w-10 h-10 p-0'}`}
                    >
                        {isSidebarOpen ? (
                            <>
                                <FiMessageSquare className="mr-2 font-semibold" size={20} />
                                Nouvelle conversation
                            </>
                        ) : (
                            <FiMessageSquare className="text-white" size={20} />
                        )}
                    </button>
                </div>


                <div className={`flex-col gap-3  overflow-y-auto overflow-x-hidden  h-[80%] ${isSidebarOpen ?'pr-5 pl-2 p-0 ml-5 border-white/30 border-l': 'p-5'}  [scrollbar-width:none] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:#7e8085 [&::-webkit-scrollbar-thumb]:rounded-full`}>
                    {chats.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => setActiveChatId(chat.id)}
                            className={`p-3 rounded-lg bg-transparent mb-2 cursor-pointer flex items-center text-xs ${activeChatId == chat.id ? 'bg-zinc-800/60': ''}`}
                        >


                            {isSidebarOpen && (
                                <div className="flex-1 min-w-0 ">
                                    <div className={`flex justify-between items-center ${activeChatId == chat.id ? '': ''}`}>
                                        <h3 className="text-white font-medium truncate">{chat.messages[chat.messages.length - 1].text || chat.name}</h3>

                                        <Menu as="div" className="relative inline-block text-left">
                                            <MenuButton
                                                onClick={(e) => e.stopPropagation()}
                                                className={`p-1 ml-2 rounded hover:bg-zinc-200/20 transition-colors text-transparent ${activeChatId == chat.id ? ' hover:bg-gray-200/20 hover:text-white' : 'hover:text-white'}`}
                                            >
                                                <FiMoreHorizontal size={16} />
                                            </MenuButton>

            <MenuItems
              anchor="bottom"
              className="w-fit origin-top-right rounded-md bg-zinc-800 border border-white/10 outline-none ml-9 mt-2  data-closed:scale-95 data-closed:opacity-0"
            >
              <div className="">
                <MenuItem>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(chat.id);
                    }}
                    className="group flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 focus:outline-none"
                  >
                    <FiTrash2 className="mr-3" size={14} />
                    Delete
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
                       </div>
                     </div>
                   )}
                 </div>
               ))}
             </div>
           </div>
           <div className="flex  justify-center w-full items-center p-4 md:p-5">
           <div className="flex flex-col items-center col-reverse justify-center h-full" >
        <div className={`fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto ${!popupIsOpen ? 'w-0 h-0' :' w-[100%] h-[100%]  backdrop-blur-[0.8px] bg-zinc-950/90 [scrollbar-width:] [scrollbar-color:#8c9096_transparent] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:#7e8085 [&::-webkit-scrollbar-thumb]:rounded-full' }`}>
        {popupIsOpen ? (
          <>
          <div className={`relative  gap-2 bg-transparent to-blue-950 p-6 rounded-lg shadow-xl ' w-[90%] h-[95%]`}>
            <button className='absolute right-8 p-1 rounded-full hover:bg-gray-500/60' onClick={() => setpopIsOpen(false)}><RxCross1/></button>
            <div className='h-fit'>
              {messages.slice(-1).map((message) => (<DataAnalysisDashboard isB2Bcliked={isClickedB2B} isB2Cclicked={isClickedB2C} csvFile={message.data}/>))}
              
            </div>
            </div>
            </>
            ):null
          
        }
          </div>
        {/*<Badge />*/}
        <div className='flex-col items-center justify-center w-full  '>
        <div className={` flex items-center justify-center p-4 bg-transparent rounded-t-lg text-s `}>
          Business Expert
        </div>
        <div className={`flex justify-center flex-col h-[630px] w-full transition-all duration-300 ${isClickedB2B || isClickedB2C ? 'w-fit rounded-lg bg-transparent' : 'w-[100]'}`}>
          <style>{`
      @keyframes text-appear {
        from {opacity: 0; transform: translateY(100px);}
        to {opacity: 1;
        transform: translateY(0);}

      }
      @keyframes fade-in {
        from {
        filter:saturate(0) constrast(4) brightness(.1) blur(50px);
        opacity: 0;
        scale: 0.95;
        translate: 0 4rem;
        }
        to {
        filter:none
        opacity: 1;
        scale: 1;
        translate: 0 0;
        }`
                            }
                            </style>


                            {chats.length === 0 ? (

                                <div className="flex flex-col items-center justify-center h-fit transition-all duration-800"style={{
                                    animation: 'fade-in both',
                                    animationDelay: '0s',
                                    animationDuration: '0.8s'

                                }}>
                                    <div className="text-white text-xl text-center ">
                                        <p className="mb-4 transition-all duration-800" >Comment puis-je vous aider ?</p>

                                    </div>
                                    {chats.length == 0 ? (
                                        <div className='w-full wh-full relative justify-center items-center flex z-0  ' >
                                            <div className=" absolute   rounded-full h-300 w-300 border-x border-6 border-white/5"></div>
                                            <div className=" absolute   rounded-full h-250 w-250 border-x border-4 border-white/10"></div>
                                            <div className=" absolute   rounded-full h-200 w-200 border-x border-2 border-white/15"></div>
                                            <div className=" absolute   rounded-full h-150 w-150 border-x border-0.5 border-white/20"></div>
                                        </div>
                                    ):null}
                                </div>

                            ) : (

                                <div className="flex-1 overflow-y-auto min-w-10 max-w-300 bg-transparent transition-all duration-800">

          <pre className="h-full flex flex-col-reverse relative p-[10px] h-[410px] w-full overflow-y-auto overflow-x-hidden whitespace-nowrap rounded-[8px] break-words [scrollbar-width:none]">
            <div className="p-4">
              {messages.map((message) => (
                  message.isCard ? (
                      <div key={message.id} className="mb-4">
                          <Message key={message.id} message={message} />
                          <div className={`mb-4 ml-15 w-[600px] flex flex-col gap-4 bg-zinc-700/20 p-4 rounded-lg cursor-pointer`}>
                              <div className='relative h-5 break-words'>
                                  <span className={`ml-5 mt-10 ${inter.className}`}>Aperçu</span>
                                  <button
                                      onClick={() => handleDownload(message)}
                                      disabled={!message.data}
                                      className={`${inter.className} p-1 flex flex-row justify-center gap-3 text-xs absolute top-0 right-5 hover:bg-zinc-400/20 p-1 rounded-lg`}
                                  >
                                      <FiDownload className="text-lg text-gray font-bold" />
                                  </button>
                              </div>

                              <div className="overflow-x-auto w-full [scrollbar-width:] [scrollbar-color:#8c9096_transparent] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:#7e8085 [&::-webkit-scrollbar-thumb]:rounded-full">
                                  <table className="w-full bg-transparent">
                                      <thead className="bg-zinc-700">
                                      <tr>
                                          {message.datatype === 'b2c' ? (
                                              <>
                                                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-300 uppercase tracking-wider">Nom</th>
                                                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-300 uppercase tracking-wider">Genre</th>
                                                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-300 uppercase tracking-wider">Ville</th>
                                                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-300 uppercase tracking-wider">Pays</th>
                                                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-300 uppercase tracking-wider">Email</th>
                                                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-300 uppercase tracking-wider">Departement</th>
                                                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-300 uppercase tracking-wider">Region</th>
                                              </>
                                          ) : (
                                              <>
                                                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-300 uppercase tracking-wider">Nom</th>
                                                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-300 uppercase tracking-wider">Avis</th>
                                                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-300 uppercase tracking-wider">Notation</th>
                                                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-300 uppercase tracking-wider">Telephone</th>
                                                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-300 uppercase tracking-wider">Gérant</th>
                                                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-300 uppercase tracking-wider">Ville</th>
                                                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-300 uppercase tracking-wider">Adresse</th>
                                              </>
                                          )}
                                      </tr>
                                      </thead>
                                      <tbody>
                                      {message.rows?.slice(1, 4).map((dataRow, rowIndex) => (
                                          <tr key={`${message.id}-${rowIndex}`} className={rowIndex % 2 === 0 ? 'bg-black/20' : 'bg-zinc-800'}>
                                              {message.datatype === 'b2c' ? (
                                                  <>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                                                          {`${dataRow[3] ?? ''} ${dataRow[4] ?? ''}`.trim() || 'NaN'}
                                                      </td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dataRow[5] || 'NaN'}</td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dataRow[6] || 'NaN'}</td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dataRow[7] || 'NaN'}</td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dataRow[12] || 'Unknown'}</td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dataRow[13] || 'NaN'}</td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dataRow[14] || 'NaN'}</td>
                                                  </>
                                              ) : (
                                                  <>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{dataRow[1] || 'NaN'}</td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dataRow[4] || 'NaN'}</td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dataRow[5] || 'NaN'}</td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dataRow[8] || 'NaN'}</td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dataRow[11] || 'NaN'}</td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dataRow[36]|| 'NaN'}</td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dataRow[20]||'NAN'}</td>
                                                  </>
                                              )}
                                          </tr>
                                      ))}
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div key={message.id} className="mb-4">
                          <Message message={message} isStreaming={message.isStreaming} />
                      </div>
                  )
              ))}
                <div ref={messagesEndRef} />
            </div>
          </pre>
                                </div>
                            )}


                            <div className="flex flex-col gap-2 lg:flex-row lg:gap-5 sm:w-fit  p-2 h-max w- mb-3 pl-3 bg-transparent overflow-x-auto">
                                {isClickedB2C ? (
                                    <>
                                        <div className="p-2 h-max w-fit text-sm text-zinc-600 rounded-full transition-colors border clickable cursor-pointer hover:bg-white/20 hover:text-white active:bg-gray-200 border-zinc-600" onClick={getText}>
                                            Lister les hommes de paris
                                        </div>
                                        <div className="p-2 h-max w-fit text-sm text-zinc-600 rounded-full transition-colors border clickable cursor-pointer hover:bg-white/20 hover:text-white active:bg-gray-200 border-zinc-600" onClick={getText}>
                                            Les femmes d'origine française
                                        </div>
                                        <div className="p-2 h-max w-fit text-sm text-zinc-600 rounded-full transition-colors border clickable cursor-pointer hover:bg-white/20 hover:text-white active:bg-gray-200 border-zinc-600" onClick={getText}>
                                            Les personnes qui travaillent à gucci
                                        </div>
                                    </>
                                ) : isClickedB2B ? (
                                    <>
                                        <div className="p-2 h-max w-fit text-sm text-zinc-600 rounded-full transition-colors border clickable cursor-pointer hover:bg-white/20 hover:text-white active:bg-gray-200 border-zinc-600" onClick={getText}>
                                            Les restaurants sur Marseille
                                        </div>
                                        <div className="p-2 h-max w-fit text-sm text-zinc-600 rounded-full transition-colors border clickable cursor-pointer hover:bg-white/20 hover:text-white active:bg-gray-200 border-zinc-600" onClick={getText}>
                                            Cafés qui ferment leur portes à dimanche
                                        </div>
                                        <div className="p-2 h-max w-fit text-sm text-zinc-600 rounded-full transition-colors border clickable cursor-pointer hover:bg-white/20 hover:text-white active:bg-gray-200 border-zinc-600" onClick={getText}>
                                            Les numeros de tel qui commencent par +33 4
                                        </div>
                                    </>
                                ) : <div></div>}
                            </div>

                            {/* Input form */}
                            <form onSubmit={handleSubmit} className="md:min-w-[700] z-100  p-4 pb-0.5 rounded-4xl bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 border border-white/20">
                                {/* Button container */}

                                {/* Input group */}
                                <div className="flex">
              <textarea
                  rows={3}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isStreaming ? "IA en cours de réponse..." : "Ecrivez votre message..."}
                  disabled={isStreaming}
                  className={`flex-1 w-0 min-w-[100px] px-4 py-2  mb-3 rounded-l-lg focus:outline-none resize-none bg-transparent break-words field-sizing-content text-white placeholder-gray-300/50 break-words overflow-y-auto  ${
                      isStreaming ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              />

                                </div>
                                <div >
                                    <div className="flex justify-between h-10">
                                        <div className="flex gap-3  pl-3 w-fit pt-1">
                                            <button
                                                type="button"
                                                onClick={() => setIsSearchEnabled(prev => !prev)}
                                                disabled={isStreaming || isClickedB2B || isClickedB2C}
                                                className={`flex justify-center items-center gap-2 w-fit pl-2 pr-2 h-7 p-1 pl-2 pr-2 text-sm rounded-xl transition-colors border ${isSearchEnabled ? 'bg-blue-500/10 text-blue-400 border-blue-400/60'
                                                    : 'bg-zinc-800 text-zinc-300 border-zinc-300 hover:bg-zinc-600'}  ${isStreaming ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title="Activer la recherche web (Serper) pour le mode par défaut"
                                            >
                                                <FiSearch /> Recherche
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleB2BClick}
                                                disabled={isStreaming}
                                                className={`flex justify-center items-center gap-2 w-20 h-7 p-1 text-sm rounded-xl transition-colors border ${
                                                    isClickedB2B
                                                        ? 'bg-[#10b981]/10 text-[#10b981]/80 border-[#10b981]/60' //text-blue-500 border-blue-500 //text-lime-200 border-lime-200
                                                        : 'bg-zinc-800 text-zinc-300 border-zinc-300 hover:bg-zinc-600'
                                                } ${isStreaming ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            ><BsFillBuildingsFill />
                                                B2B
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleB2CClick}
                                                disabled={isStreaming}
                                                className={`flex justify-center items-center gap-2 w-20 h-7 p-1 text-sm rounded-xl transition-colors border ${
                                                    isClickedB2C
                                                        ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]' //text-blue-500 border-blue-500 //text-lime-200 border-lime-200
                                                        : 'bg-zinc-800 text-zinc-300 border-zinc-300 hover:bg-zinc-600'
                                                } ${isStreaming ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            ><FaUser />
                                                B2C
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleVisualizeClick}
                                                className={`flex justify-center items-center gap-1 w-25 h-7 p-1 text-sm rounded-full transition-colors  ${
                                                    isClickedVisualize
                                                        ? 'bg-purple-300/10 text-purple-400 border-linear-to-bl from-violet-500 to-fuchsia-500'
                                                        : 'bg-zinc-800 text-zinc-300 border-zinc-300 hover:bg-zinc-600'
                                                } ${isStreaming ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            ><IoStatsChartSharp />
                                                Visualiser
                                            </button>

                                        </div>

                                        <div className='pb-3'>
                                            {!isStreaming ?(
                                                    <button
                                                        type="submit"
                                                        onClick= {chats.length == 0 ? handleNewChat : undefined}
                                                        className={`p-3 mr-0 px-2 py-2 bg-white text-white rounded-full hover:bg-white-700 transition-colors focus:outline-none `}
                                                    >
                                                        <FiArrowUp className="text-l text-black stroke-2" size={18} />
                                                    </button>
                                                ):
                                                (
                                                    <button
                                                        onClick={stopStreaming}

                                                        className={`p-3 mr-0 px-2 py-2 bg-white text-white rounded-full hover:bg-white-700 transition-colors focus:outline-none`}
                                                    >
                                                        <BsFillSquareFill className="text-l text-black rounded-[2px]" size={15}/>
                                                    </button>
                                                )

                                            }

                                        </div>
                                    </div>
                                </div>




                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
