import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import TopBar from "./TopBar";

const AdminLayout = () => {
    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <AdminSidebar />
            <div className="flex-1 flex flex-col">
                <TopBar />
                <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;