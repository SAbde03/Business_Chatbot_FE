import { FiCopy, FiUser } from 'react-icons/fi'
import { FiMessageSquare } from 'react-icons/fi'
import { Inter, Roboto, Open_Sans } from 'next/font/google';
import { AiFillRobot } from 'react-icons/ai';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
const inter = Inter({ subsets: ['latin'] });
type MessageProps = {
  message: {
    id: string
    text: string
    sender: 'user' | 'bot'
    timestamp: Date
    isCard?: boolean
    isClicked?: boolean
    status?:boolean
  }
  isStreaming?: boolean
}

export default function Message({ message, isStreaming }: MessageProps) {
  const components: Components = {
    // Bold text handling (**text**)
    strong: ({ node, ...props }) => (
      <strong className="text-l font-bold text-inherit" {...props} />
    ),

    h1: ({node, ...props }) => (
      <h1 className="text-2xl font-bold mt-6   pb-2" {...props} />
    ),
    // Heading level 2 handling (## text)
    h2: ({node, ...props }) => (
      <h2 className="text-xl font-bold mt-6 mb-4  pb-2" {...props} />
    ),

    // Add other heading levels if needed
    h3: ({node, ...props }) => (
      <h3 className="text-l font-light mt-5 mb-3" {...props} />
    ),
    p: ({node, ...props }) => (
      <p className="text-base text-l" {...props} />
    ),
    a: ({node, ...props }) => (
      <a  className="text-blue-500 hover:underline" {...props} />
    ),
  };
  return (
    <div
      className={`flex mb-10  ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`relative flex max-w-xs md:max-w-md lg:max-w-2xl ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
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
              : 'bg-gray-1000 text-white-800 rounded-tl-none w-full '
          }`}
        >{isStreaming ?(
            <div className="mt-1 mb-2 text-xs  flex items-center gap-2 ">
              <div className="w-3 h-3 bg-white rounded-full animate-ping {style}"></div>

            </div>
        ):null}

        

          <div className={`${inter.className}  break-words whitespace-normal  w-[100%] overflow-auto text-[15px] ${message.status == false ? 'animate-pulse text-white/30': ''}`}><ReactMarkdown
        remarkPlugins={[remarkGfm]}

        components={components}
      >
    {message.text}
  </ReactMarkdown></div>
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

        </div>

      </div>
      <div>

      </div>

    </div>
  )
}