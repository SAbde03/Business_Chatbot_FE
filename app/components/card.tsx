import { Inter, Roboto, Open_Sans } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

interface CardProps {
  userName: string;
  imageUrl?: string;
  gender?: string;
  data?: string;
  city?: string;
  country?: string;
  isClickedB2B?: boolean;
  isClickedB2C?: boolean;
  analysis?: string;
}

export default function Card({
  userName,
  imageUrl= "chatbot/public/images/3da39-no-user-image-icon-27.png",
  gender,
  data,
  city,
  country,
  isClickedB2B,
  isClickedB2C,
  analysis,
}: CardProps) {

  const handleDownload = () => {
    if (!data) {
      console.warn("No data available to download");
      return;
    }
    
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    {isClickedB2B ? a.download = 'b2b_data.csv' : a.download = 'b2c_data.csv';}
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  
  return (
    
   <div className="text-gray-300 rounded-lg text-sm w-fit bg-[#161b22] border border-[#3f3f46] break-words ">
    {analysis}
	<div className=" flex flex-col space-x-3 p-4 max-w-100 break-words">
		<img
        className="rounded-2xl border-zinc-700 w-20 h-20"
        alt=""
        src={imageUrl}
      />
      <span className='h-5'></span>
		<div className="w-full text-gray-500 overflow-y-auto [scrollbar-width:none]">
      {isClickedB2B ? (
  // B2B version
  <>
    <p className="w-fit text-lg space-x-1 inline-block overflow-hidden whitespace-nowrap">
      <span className={`${inter.className} text-white`}>
        entreprise : {userName}
      </span>
    </p>
    <p>rating : {gender}</p>
    <p>pays : {country}</p>
    <p className='break-words '>localisation: {city}</p>
  </>
) : isClickedB2C ?(
  // B2C version
  <>
    <p className="w-[200px] text-lg space-x-1 inline-block overflow-hidden whitespace-nowrap">
      <span className={`${inter.className} text-white`}>
        {userName}
      </span>
    </p>
    <p>Genre : {gender}</p>
    <p>Pays : {country}</p>
    <p>Ville: {city}</p>
  </>
):null}
		</div>
    <span className='h-5'></span>
		<button
                   onClick={handleDownload}
                    disabled={!data}
                   className={`${inter.className}"p-1 max-w-fit px-3 py-3 bg-white text-black font-semibold rounded-full hover:bg-white-700 transition-colors focus:outline-none`}
                 >
                  Download .csv
                 </button>
	</div>
	
</div>
  )
}