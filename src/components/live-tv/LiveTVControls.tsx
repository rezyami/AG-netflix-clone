'use client';

import { Info, Settings, ArrowLeft, Gamepad2 } from "lucide-react";

export default function LiveTVControls() {
    return (
        <div className="h-16 bg-zinc-950/80 backdrop-blur-sm border-t border-zinc-900 flex items-center justify-between px-12 z-50">
            <div className="flex items-center gap-12">
                <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-widest">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">OK</div>
                    Sélectionner
                </div>

                <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-widest">
                    <div className="w-5 h-5 flex items-center justify-center">
                        <Gamepad2 size={16} />
                    </div>
                    Navigation
                </div>

                <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-widest">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">↩</div>
                    Retour
                </div>
            </div>

            <div className="flex items-center gap-6">
                <Settings className="text-zinc-500 hover:text-white cursor-pointer transition-colors" size={20} />
                <Info className="text-zinc-500 hover:text-white cursor-pointer transition-colors" size={20} />
            </div>
        </div>
    );
}
