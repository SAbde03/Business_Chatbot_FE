export default function Badge() {
  return (
    <div className="fixed top-4 right-5 bg-transparent text-white p-4 rounded-bl-lg">
        
    <div className="center relative inline-block select-none whitespace-nowrap rounded-full focus:bg-blue border px-5 py-2 align-baseline font-sans text-xs font-bold uppercase leading-none text-white">
      <div className="absolute top-2/4 left-2 h-5 w-5 -translate-y-2/4">
        <img
          alt="tania andrew"
          src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=1480&amp;q=80"
          className="relative inline-block h-5 w-5 p translate-x-px translate-y-px rounded-full object-cover object-center"
        />
      </div>
      <div className="ml-4 mt-px">
        <p className="block font-sans text-sm font-medium capitalize leading-none text-white antialiased">
          Rmili Yahya
        </p>
      </div>
    </div>
    
    <link
      rel="stylesheet"
      href="https://unpkg.com/@material-tailwind/html@latest/styles/material-tailwind.css"
    />
      </div>

  );
}