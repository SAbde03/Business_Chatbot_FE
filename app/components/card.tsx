import { Inter, Roboto, Open_Sans } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
export default function Card() {
  return (
   <div className="text-gray-300 rounded-lg text-sm w-[350px] bg-[#161b22] border border-[#3f3f46] ">
	<div className="w-full flex flex-row space-x-3 p-4">
		<img
        className="rounded-2xl border-zinc-700 w-20 h-20"
        alt=""
        src="3da39-no-user-image-icon-27.png"
      />
		<div className="w-full text-gray-500">
			<p className="w-[200px] text-lgspace-x-1 inline-block overflow-hidden whitespace-nowrap ">
				<span className={`${inter.className} text-white`}></span><span className="font"></span>
			</p>
			<p></p>
		</div>
		<button
                   type="submit"
                   className={`${inter.className}"p-1 px-3 py-3 bg-white text-black  rounded-full hover:bg-white-700 transition-colors focus:outline-none`}
                 >
                  Download .csv
                 </button>
	</div>
	
</div>
  )
}