import { Chat } from "@/components/chat/chat";
import { SessionSidebar } from "@/components/session/session-sidebar";

const App = () => {
  return (
    <div className="flex flex-col h-screen">
      <header className="border-b bg-background flex items-center justify-center h-14 w-full flex-none">
        <h1 className="text-lg font-semibold">
          LLM Chat{" "}
          <span className="text-sm text-muted-foreground">v1.0</span>
        </h1>
      </header>
      <main className="flex-1 min-h-0 flex">
        <SessionSidebar className="w-80 flex-none" />
        <div className="flex-1 min-w-0">
          <Chat />
        </div>
      </main>
    </div>
  );
};

export default App;
