import React from 'react';
import { Layers } from "lucide-react";

const SidebarHeader = () => (
    <div className="flex items-center p-4 border-b border-emerald-700">
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-900 rounded flex items-center justify-center">
                <Layers className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-semibold text-lg">SumaqSeguros</span>
        </div>
    </div>
);

export default SidebarHeader;