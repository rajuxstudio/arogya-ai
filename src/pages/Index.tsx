import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { StatCards } from "@/components/dashboard/StatCards";
import { AnatomyView } from "@/components/dashboard/AnatomyView";
import { RightPanel } from "@/components/dashboard/RightPanel";

const Index = () => {
  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 max-w-[1600px] mx-auto">
        <TopBar
          title={<>Welcome back, <span className="text-gradient">Aarav</span></>}
          subtitle="Here's your AI-powered health overview for today."
        />

        <div className="mt-6 grid grid-cols-12 gap-5">
          <div className="col-span-12 xl:col-span-8 flex flex-col gap-5">
            <StatCards />
            <AnatomyView />
          </div>
          <div className="col-span-12 xl:col-span-4">
            <RightPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
