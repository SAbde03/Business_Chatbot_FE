import { Inter, Roboto, Open_Sans } from 'next/font/google';
import { AiFillBuild } from 'react-icons/ai';
import { BiBuildings } from 'react-icons/bi';
import { BsFillBagFill } from 'react-icons/bs';
import { FcBusiness } from 'react-icons/fc';
import { FiHome, FiUser } from 'react-icons/fi';
const inter = Inter({ subsets: ['latin'] });

interface CardProps {
  userName: string;
  imageUrl?: string;
  gender?: string;
  data?: any;
  city?: string;
  country?: string;
  isClickedB2B?: boolean;
  isClickedB2C?: boolean;
  analysis?: string;
  firstDataValues?: string[];
  rows?: string[];
  datatype?: string; // Added sender prop
}

export default function Card({
  userName,
  imageUrl= "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=1480&amp;q=80",
  gender,
  data,
  city,
  country,
  isClickedB2B,
  isClickedB2C,
  analysis,
  datatype,
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
    
    
   <div className="text-gray-300 rounded-lg text-sm min-w-[170px] bg-zinc-800 border border-[#3f3f46] break-words ">
    
	<div className=" flex flex-col space-x-3 p-4 max-w-100 break-words">
    {datatype=='b2c' ? (<FiUser className="text-2xl text-white mb-2    rounded-lg" />) : (<BiBuildings className="text-2xl text-white mb-2    rounded-lg" />)}
		
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
		
	</div>
	
</div>
  )
}