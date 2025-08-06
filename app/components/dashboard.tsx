'use client'
import PieChart from "./charts/piechart";

export default function Dashboard() {

return(
    <div className="flex flex-col min-h-screen bg-zinc-900/50 transition-all duration-300 border-l border-zinc-600">
<PieChart/>
</div>
);

}