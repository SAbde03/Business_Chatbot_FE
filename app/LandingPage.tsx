"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BiConversation } from "react-icons/bi";
import { BsFillBuildingsFill } from "react-icons/bs";
import { FaGithub, FaLinkedin, FaTwitter, FaUser } from "react-icons/fa";
import { FiArrowRight, FiDatabase, FiEye } from "react-icons/fi";
import { IoStatsChartSharp } from "react-icons/io5";
import { Inter, Roboto, Open_Sans } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'] })
const openSans = Open_Sans({ subsets: ['latin'] })

export default function LandingPage(){
    const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const router = useRouter();

  const handleRedirect = () => {
    router.push("/chatbot");
  };
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);
    return (
        
    <div 
      className="flex justify-center  h-full bg-cover bg-center bg-repeat scroll-smooth"
      style={{
        backgroundImage: "url('/images/artistic-blurry-colorful-wallpaper-background (1).jpg')"
      }}
    >
      <div className=" absolute  top-56  rounded-full h-125 w-105 border-x border-3 shadow-lg  shadow-white/50"></div>
      <div className=" absolute  top-36  rounded-full h-145 w-125 border-x border-2 shadow-lg shadow-white/50"></div>
      <div className=" absolute  top-16  rounded-full h-165 w-145 border-x border-1 shadow-lg  shadow-white/50"></div>
      <div className=" absolute  top-[-4]  rounded-full h-181 w-161 border-x border-0.5 shadow-lg  shadow-white/50"></div>
  

      <nav 
        className={`flex fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-transparent backdrop-blur-sm ${hidden ? "-translate-y-full" : "translate-y-0"}`}>
        <div className="flex justify-end w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end h-16">
            
            
            <div className="">
              <div className=" ">
                <button className="flex items-center " onClick={handleRedirect}>Commencer<FiArrowRight className="ml-2"></FiArrowRight></button>
              </div>
              
            </div>
            </div>
            </div>
      </nav>
      <div className="relative flex flex-col backdrop-blur-[1.1px]  h-full bg-black/60  pb-0 items-center justify-center">
      
      <div>
        
      </div>
      <h1 className="text-6xl mb-4 font-bold mt-80 ">Générez des leads B2B/B2C</h1>
      <h2 className="opacity-50">Désormais, toutes les données sont entre vos mains.</h2>
      <div>
        <button className="w-fit bg-white rounded-lg p-2 text-black mt-10 font-semibold" onClick={handleRedirect}>
            Commencer
        </button>
      </div>
      <span className="flex h-80 justify-center items-center gap-50 w-[100%] mt-80 mb-0  bg-linear-to-t from-black to-transparent " style={{
       
        
      }}
    >
      <div className={`flex-col gap-4 text-4xl items-center justify-center text-white opacity-100 ${roboto.className} w-60 h-fit  font-semibold  rounded-lg`}><FiDatabase size={50} />Données<p className="text-xs font-light mt-2 text-white/60">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p></div>
      <div className={`flex-col gap-2 text-4xl items-center justify-center text-white opacity-100 ${roboto.className} w-60 h-fit  font-semibold rounded-lg`}><BiConversation size={50}/>Conversations<p className="text-xs font-light mt-2 text-white/30">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p></div>
      <div className={`flex-col gap-2 text-4xl items-center justify-center text-white opacity-100  ${roboto.className} w-60 h-fit font-semibold rounded-lg`}><FiEye size={50}/>Visualisation<p className="text-xs font-light mt-2 text-white/30">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p></div>
      </span>
      <div className="flex-row w-[100%] bg-black p-30">
        <img className='sticky mb-2 top-5 rounded-lg scale-100' src="images/Screenshot 2025-08-20 145650.png" />
      <img className='sticky top-5 rounded-lg scale-100' src="images/Screenshot 2025-08-20 150612.png" />
      <img className='sticky top-5 rounded-lg scale-100' src="images/Screenshot 2025-08-20 151617.png" />
      <img className='sticky top-5 rounded-lg scale-100' src="images/Screenshot 2025-08-20 150903.png" />
      </div>
      <footer className="bg-black border-t border-zinc-700 text-zinc-300 py-10 w-full">
      <div className=" mt-10 pt-6 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} . All rights reserved.
      </div>
    </footer>
      </div>
      
    </div>
  );
}