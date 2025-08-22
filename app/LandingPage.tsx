"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BiConversation } from "react-icons/bi";
import { BsFillBuildingsFill } from "react-icons/bs";
import { FaGithub, FaLinkedin, FaTwitter, FaUser } from "react-icons/fa";
import { FiArrowLeft, FiArrowLeftCircle, FiArrowRight, FiDatabase, FiEye } from "react-icons/fi";
import { IoStatsChartSharp } from "react-icons/io5";
import { Inter, Roboto, Open_Sans } from 'next/font/google'
import Authentification from "./components/Authentification";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
const inter = Inter({ subsets: ['latin'] })
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'] })
const openSans = Open_Sans({ subsets: ['latin'] })
import React from "react";
import Slider from "react-slick";
import { useRef } from "react";
export default function LandingPage(){
    const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [popIsOpen, setPopIsOpen] = useState(false);

  const router = useRouter();

  const handleRedirect = () => {
    setPopIsOpen(!popIsOpen);
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
   
  const containerRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    "/images/Screenshot 2025-08-20 145650.png",
    "/images/Screenshot 2025-08-20 150612.png",
    "/images/Screenshot 2025-08-20 151617.png",
    "/images/Screenshot 2025-08-20 150903.png"
  ];
  const goToSlide = (index: number) => {
    const slide = slidesRef.current[index];
    if (slide) {
      slide.scrollIntoView({ behavior: "smooth", inline: "center" });
      setCurrentIndex(index);
    }
  };

  const nextSlide = () => {
    const nextIndex = Math.min(currentIndex + 1, slidesRef.current.length - 1);
    goToSlide(nextIndex);
  };

  const prevSlide = () => {
    const prevIndex = Math.max(currentIndex - 1, 0);
    goToSlide(prevIndex);
  };
    return (
        
    <div 
      className="flex justify-center  h-full bg-cover bg-center bg-repeat scroll-smooth"
      style={{
        backgroundImage: "url('/images/artistic-blurry-colorful-wallpaper-background (1).jpg')"
      }}
    >
      <style>{`
      @keyframes text-appear {
        from {opacity: 0; transform: translateY(100px);}
        to {opacity: 1;
        transform: translateY(0);}

      }
      @keyframes fade-in {
        from {
        filter:saturate(0) constrast(4) brightness(.1) blur(5px);
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
      <div className={`fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto ${!popIsOpen ? 'w-0 h-0' :' w-[100%] h-[100%]  backdrop-blur-[0.8px] bg-zinc-950/90 [scrollbar-width:] [scrollbar-color:#8c9096_transparent] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:#7e8085 [&::-webkit-scrollbar-thumb]:rounded-full' }`}>
        <div className=" flex justify-center items-center top-35 w-[50%] h-full z-50">
        <Authentification/>
      </div>
      </div>
      
      <div className="relative flex flex-col backdrop-blur-[1.1px]  h-full w-full  bg-black/60  pb-0 items-center justify-center">
      <div>
        
      </div>
      <h1 className="text-6xl mb-4 font-bold mt-80 ">Générez des leads B2B/B2C</h1>
      <h2 className="opacity-50">Désormais, toutes les données sont entre vos mains.</h2>
      <div>
        <button className="w-fit bg-white rounded-lg p-2 text-black mt-10 font-semibold" onClick={handleRedirect}>
            Commencer
        </button>
      </div>
      <span className="flex justify-center pb-20 bg-linear-to-t from-black to-transparent w-[100%]" style={{
       
        
      }}
    >
      <div className="flex h-80 w-[80%] justify-center items-center gap-50  mt-80 mb-0 " >
      <div className={`flex-col gap-4 text-4xl items-center justify-center text-white opacity-100 ${roboto.className} w-60 h-fit  font-semibold  rounded-lg`}style={{
        animation: 'fade-in both',
        animationTimeline: 'view(50% 30%)',
        animationDelay: '0.8s'
         
      }}><FiDatabase size={50} />Données<p className="text-xs font-light mt-2 text-white/60">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p></div>
      <div className={`flex-col gap-2 text-4xl items-center justify-center text-white opacity-100 ${roboto.className} w-60 h-fit  font-semibold rounded-lg`}style={{
        animation: 'fade-in both',
        animationTimeline: 'view(50% 30%)',
        animationDelay: '0.8s'
         
      }}><BiConversation size={50}/>Conversations<p className="text-xs font-light mt-2 text-white/30">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p></div>
      <div className={`flex-col gap-2 text-4xl items-center justify-center text-white opacity-100  ${roboto.className} w-60 h-fit font-semibold rounded-lg`}style={{
        animation: 'fade-in both',
        animationTimeline: 'view(50% 30%)',
        animationDelay: '0.8s'
         
      }}><FiEye size={50}/>Visualisation<p className="text-xs font-light mt-2 text-white/30">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p></div>
      </div>
      </span>
      
      <div className="flex justify-center items-center bg-black space-x-2">
      {/* Left Button */}
      <button
        className="flex w-10 h-10 bg-white rounded-full justify-center items-center"
        onClick={prevSlide}
      >
        <FiArrowLeft className="text-black" />
      </button>

      {/* Scrollable Snap Container */}
      <div
        ref={containerRef}
        className="
          flex w-[80%] overflow-x-auto snap-x snap-mandatory p-4 space-x-8
          [scrollbar-width:none] [scrollbar-color:transparent_transparent]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {images.map((img, i) => (
          <div
            key={i}
            ref={(el) => (slidesRef.current[i] = el)}
            className="snap-center flex-shrink-0 w-[90%] h-[90%]"
          >
            <img
              className="rounded-lg w-full h-auto"
              src={`${img}`}
              alt={`screenshot ${i + 1}`}
            />
          </div>
        ))}
      </div>

      {/* Right Button */}
      <button
        className="flex w-10 h-10 bg-white rounded-full justify-center items-center"
        onClick={nextSlide}
      >
        <FiArrowRight className="text-black" />
      </button>
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