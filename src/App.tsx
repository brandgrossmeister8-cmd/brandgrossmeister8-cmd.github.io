import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GameProvider } from "@/contexts/GameContext";
import LandingPage from "./pages/LandingPage";
import TitlePage from "./pages/TitlePage";
import RulesPage from "./pages/RulesPage";
import LobbyOneScreenPage from "./pages/LobbyOneScreenPage";
import PlayerGamePage from "./pages/PlayerGamePage";
import PlayerPanelDemoPage from "./pages/PlayerPanelDemoPage";
import AdminOneScreenPage from "./pages/AdminOneScreenPage";
import SpectatorViewPage from "./pages/SpectatorViewPage";
import AccessPage from "./pages/AccessPage";
import AdminCodesPage from "./pages/AdminCodesPage";
import InstructionsPage from "./pages/InstructionsPage";
import JournalPrintPage from "./pages/JournalPrintPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GameProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/access" element={<AccessPage />} />
            <Route path="/game" element={<TitlePage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/lobby" element={<LobbyOneScreenPage />} />
            <Route path="/play" element={<PlayerGamePage />} />
            <Route path="/player-demo" element={<PlayerPanelDemoPage />} />
            <Route path="/admin" element={<AdminOneScreenPage />} />
            <Route path="/spectator" element={<SpectatorViewPage />} />
            <Route path="/admin-codes" element={<AdminCodesPage />} />
            <Route path="/instructions" element={<InstructionsPage />} />
            <Route path="/journal" element={<JournalPrintPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </GameProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
