import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Code2, Brain, Folder, Puzzle } from "lucide-react";

type NavBarProps = {
  onChangeView: (view: "default" | "code" | "ai" | "files" | "plugins") => void;
};

function NavBar({ onChangeView }: NavBarProps) {
  return (
    <div className="h-16 bg-gray-900 flex items-center justify-between px-6 shadow-md z-20">
      <h1 className="text-xl font-bold">Command & Control</h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="text-white hover:text-cyan-400 px-2">
            💻 Coding
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-900 text-white border border-gray-700">
          <DropdownMenuItem onClick={() => onChangeView("code")}>
            <Code2 size={16} className="mr-2" /> Code Editor
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChangeView("ai")}>
            <Brain size={16} className="mr-2" /> AI Assist
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChangeView("files")}>
            <Folder size={16} className="mr-2" /> Files
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChangeView("plugins")}>
            <Puzzle size={16} className="mr-2" /> Plugins
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="space-x-4">
        <button className="bg-green-600 px-4 py-1 rounded hover:bg-green-500">Launch</button>
        <button className="bg-red-600 px-4 py-1 rounded hover:bg-red-500">Shutdown</button>
      </div>
    </div>
  );
}

export default NavBar;
