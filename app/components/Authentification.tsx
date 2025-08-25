import Image from 'next/image';
import { useRouter } from "next/navigation";
import { useState } from 'react';
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default function Authentification() {
   const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLogin, setIsLogin] = useState(true);
    const [isSignin, setIsSignin] = useState(false);
      const router = useRouter();


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email,
        password: password,
      }),
     });

     if(response.ok) {
    const data = await response.json();
    console.log("Login response:", data);
    localStorage.setItem("token", data.access_token);
    router.push("/chatbot");
  } else {
    console.log(email, password);
    console.error('Login failed');
  };
    }
  catch (error) {
    console.error('Error:', error);
  }
}
  
    return (
    
      <div className="flex flex-col items-center justify-center w-full min-h-screen px-6 py-8 mx-auto lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-black dark:border-white/20">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            {
              isLogin ?(
                <>
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Se connecter
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-500  border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-zinc-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder=".......@mail.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Mot de passe
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-gray-500  border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-zinc-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="remember"
                      aria-describedby="remember"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                      required=""
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="remember" className="text-gray-500 dark:text-gray-300">
                      Se souvenir de moi
                    </label>
                  </div>
                </div>
                <a href="#" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">
                  Mot de passe oublié?
                </a>
              </div>
              <button
                type="submit"
                className="w-full text-black bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-white dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Se connecter
              </button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Pas encore inscris?{' '}
                <a href="#" className="font-medium text-primary-600 hover:underline dark:text-primary-500" onClick={() => {setIsLogin(false); setIsSignin(true)}}>
                  S'inscrire
                </a>
              </p>
            </form>
          
            </>
              ):(
                <>
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              S'inscrire
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="Nom" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Nom d'utilisateur
                </label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-500  border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-zinc-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Nom d'utilisateur"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-500  border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-zinc-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder=".......@mail.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Mot de passe
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-gray-500  border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-zinc-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="remember"
                      aria-describedby="remember"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                      required=""
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="remember" className="text-gray-500 dark:text-gray-300">
                      Se souvenir de moi
                    </label>
                  </div>
                </div>
                <a href="#" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">
                  Mot de passe oublié?
                </a>
              </div>
              <button
                type="submit"
                className="w-full text-black bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-white dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Se connecter
              </button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Pas encore inscris?{' '}
                <a href="#" className="font-medium text-primary-600 hover:underline dark:text-primary-500" onClick={() => {setIsLogin(true); setIsSignin(false)}}>
                  Se connecter
                </a>
              </p>
            </form>
          
            </>
              )
            }
            </div>
        </div>
      </div>
 
  );
}

