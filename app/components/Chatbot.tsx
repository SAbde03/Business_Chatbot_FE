'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { FiSend, FiUser, FiMessageSquare, FiDownload } from 'react-icons/fi'
import Message from './message'
import ProfileCard from './card'
import Badge from './badge'
import { Inter, Roboto, Open_Sans } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'] })
const openSans = Open_Sans({ subsets: ['latin'] })

type MessageType = {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  cardData?: string[]
  isClicked?: boolean
  data?: any
  analysis?: string
  isCard?: boolean
  isClickedB2B?: boolean
  isClickedB2C?: boolean
  rows?: string[]
  datatype?: string
  isStreaming?: boolean
  streamingComplete?: boolean
}

class StreamingClient {
  private eventSource: EventSource | null = null;
  private baseUrl: string;
  private isConnected: boolean = false;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  startStream(message: string, callbacks: {
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
      // Utiliser POST avec fetch puis EventSource n'est pas possible
      // On va faire un POST vers l'endpoint streaming
      fetch(`${this.baseUrl}/api/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: message })
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
            buffer = lines.pop() || ''; // Garder la dernière ligne incomplète

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
            if (callbacks.onError) callbacks.onError(error.toString());
          }
        };

        readStream();
      }).catch(error => {
        console.error('Stream connection error:', error);
        if (callbacks.onError) callbacks.onError(error.toString());
      });

    } catch (error) {
      console.error('Failed to start stream:', error);
      if (callbacks.onError) callbacks.onError(error.toString());
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
  const [isClickedB2B, setIsClickedB2B] = useState(false)
  const [isClickedB2C, setIsClickedB2C] = useState(false)
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: '1',
      text: 'Bonjour, comment puis-je vous aider?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
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

  const handleStreamingResponse = useCallback((userMessage: MessageType) => {
    if (!streamingClient.current) return

    // Créer un message bot initial pour le streaming
    const streamingMessageId = `streaming-${Date.now()}`
    const initialBotMessage: MessageType = {
      id: streamingMessageId,
      text: '',
      sender: 'bot',
      timestamp: new Date(),
      isStreaming: true,
      streamingComplete: false
    }

    setMessages(prev => [...prev, initialBotMessage])
    setCurrentStreamingMessageId(streamingMessageId)
    setIsStreaming(true)

    const callbacks = {
      onConnect: () => {
        console.log('Connected to streaming service')
      },

      onChunk: (chunk: string) => {
        setMessages(prev => prev.map(msg => {
          if (msg.id === streamingMessageId) {
            return {
              ...msg,
              text: msg.text + chunk,
              isStreaming: true
            }
          }
          return msg
        }))
      },

      onComplete: (fullResponse: string) => {
        setMessages(prev => prev.map(msg => {
          if (msg.id === streamingMessageId) {
            return {
              ...msg,
              text: fullResponse,
              isStreaming: false,
              streamingComplete: true
            }
          }
          return msg
        }))
        setIsStreaming(false)
        setCurrentStreamingMessageId(null)
      },

      onError: (error: string) => {
        setMessages(prev => prev.map(msg => {
          if (msg.id === streamingMessageId) {
            return {
              ...msg,
              text: `Erreur: ${error}`,
              isStreaming: false,
              streamingComplete: true
            }
          }
          return msg
        }))
        setIsStreaming(false)
        setCurrentStreamingMessageId(null)
      },

      onHeartbeat: () => {
        // Optionnellement afficher un indicateur de vie
        console.log('Heartbeat received')
      }
    }

    streamingClient.current.startStream(userMessage.text, callbacks)
  }, [])

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
    }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    try {
      // Si c'est une requête par défaut, utiliser le streaming
      if (!isClickedB2B && !isClickedB2C) {
        handleStreamingResponse(userMessage)
      } else {
        // Pour B2B et B2C, utiliser l'ancienne méthode
        const response = await fetch('http://localhost:3002/api/crew', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            choice: isClickedB2B ? 'b2b' : isClickedB2C ? 'b2c' : 'default',
            input: inputValue
          }),
        })

        if (isClickedB2B || isClickedB2C) {
          const res = await response.json()
          const analysis = res.response;
          const data = res.csv
          const rows = data.split('\n').map((row: string) => row.split(','))
          
          const botMessage: MessageType = {
            id: Date.now().toString(),
            text: analysis,
            sender: 'bot',
            data: data,
            rows: rows,
            isCard: true,
            timestamp: new Date(),
            isClickedB2B: isClickedB2B,
            isClickedB2C: isClickedB2C,
            datatype: isClickedB2B ? 'b2b' : 'b2c',
          }
          setMessages(prev => [...prev, botMessage])
        }
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: MessageType = {
        id: Date.now().toString(),
        text: 'Désolé, j\'ai rencontré un problème.',
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
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

  return (
      <div className="flex flex-col items-center col-reverse justify-center h-full">
        <Badge />
        <div className={`${roboto.className} flex items-center justify-center p-4 bg-transparent rounded-t-lg text-s`}>
          Marketing Expert
        </div>
        <div className={`flex flex-col h-[630px] ${isClickedB2B || isClickedB2C ? 'w-fit rounded-lg bg-transparent' : 'w-[50%]'}`}>
          <div className="flex-1 overflow-y-auto min-w-10 max-w-300 bg-transparent">
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
                              {message.rows?.slice(1, 5).map((dataRow, rowIndex) => (
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
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dataRow[380] || 'NaN'}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dataRow[12] || 'NaN'}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dataRow[16] || 'NaN'}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dataRow[25] || 'NaN'}</td>
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

          <div className="flex flex-col gap-2 lg:flex-row lg:gap-5 sm:w-fit p-2 h-max w- mb-3 pl-3 bg-transparent overflow-x-auto">
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
            ) : null}
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="min-w-[60%] p-4 rounded-lg bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300">
            {/* Button container */}
            <div className="flex gap-3 mb-3 pl-3">
              <button
                  type="button"
                  onClick={handleB2BClick}
                  disabled={isStreaming}
                  className={`w-20 h-7 p-1 text-sm rounded-full transition-colors border ${
                      isClickedB2B
                          ? 'bg-blue-300/10 text-blue-500 border-blue-500'
                          : 'bg-zinc-700 text-zinc-300 border-zinc-300 hover:bg-zinc-600'
                  } ${isStreaming ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                B2B
              </button>
              <button
                  type="button"
                  onClick={handleB2CClick}
                  disabled={isStreaming}
                  className={`w-20 h-7 p-1 text-sm rounded-full transition-colors border ${
                      isClickedB2C
                          ? 'bg-blue-300/10 text-blue-500 border-blue-500'
                          : 'bg-zinc-700 text-zinc-300 border-zinc-300 hover:bg-zinc-600'
                  } ${isStreaming ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  placeholder={isStreaming ? "IA en cours de réponse..." : "Ecrivez votre message..."}
                  disabled={isStreaming}
                  className={`flex-1 w-0 min-w-[100px] px-4 py-2 rounded-l-lg focus:outline-none bg-transparent text-white placeholder-zinc-400 break-words ${
                      isStreaming ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              />
              <button
                  type="submit"
                  disabled={isStreaming || !inputValue.trim()}
                  className={`p-3 px-3 py-3 bg-white text-white rounded-full hover:bg-white-700 transition-colors focus:outline-none ${
                      isStreaming || !inputValue.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                <FiSend className="text-lg text-black" />
              </button>
            </div>


          </form>
        </div>
      </div>
  )
}