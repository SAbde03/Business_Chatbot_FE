import { FiUser } from 'react-icons/fi'
import { FiMessageSquare } from 'react-icons/fi'
import { Inter, Roboto, Open_Sans } from 'next/font/google';
import { AiFillRobot } from 'react-icons/ai';
const inter = Inter({ subsets: ['latin'] });
type MessageProps = {
  message: {
    id: string
    text: string
    sender: 'user' | 'bot'
    timestamp: Date
    isCard?: boolean
    isClicked?: boolean
  }
}

export default function Message({ message }: MessageProps) {
  return (
    <div
      className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`flex max-w-xs md:max-w-md lg:max-w-lg ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
      >
        <div
          className={`rounded-full flex items-center justify-center flex-shrink-0 ${
            message.sender === 'user' ? 'h-0 w-0' : 'w-10 h-10 bg-gray-800 mr-3'
          }`}
        >
          {message.sender === 'user' ? (null) : (
            <AiFillRobot className="text-gray-500 text-xl" />
          )}
        </div>
        <div
          className={`px-4 py-2  rounded-lg ${
            message.sender === 'user'
              ? 'bg-zinc-600 text-white rounded-tr-none '
              : 'bg-gray-1000 text-white-800 rounded-tl-none  '
          }`}
        >
          <p className={`${inter.className} break-words whitespace-normal whitespace-pre-line max-w-full overflow-hidden text-[15px]`}>{message.text}</p>
          {/* Input form <p
            className={`text-xs mt-1  ${
              message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p> */}
          { message.isClicked ? (
             <button
                   type="submit"
                   className={`${inter.className}"p-1 px-3 py-3 bg-white text-black  rounded-full hover:bg-white-700 transition-colors focus:outline-none`}
                 >
                  Download .csv
                 </button>
          ) : null }
        </div>
      </div>
    </div>
  )
}