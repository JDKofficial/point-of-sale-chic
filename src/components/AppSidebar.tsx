import { Home, Package, Users, Receipt, ShoppingCart, LogOut, Building2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import ProfileModal from "./ProfileModal";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Produk", url: "/produk", icon: Package },
  { title: "Pelanggan", url: "/pelanggan", icon: Users },
  { title: "Transaksi", url: "/transaksi", icon: Receipt },
  { title: "Transaksi Jualan", url: "/transaksi-jualan", icon: ShoppingCart },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const collapsed = state === "collapsed";
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  return (
    <Sidebar collapsible="icon"  className={collapsed ? "w-14" : "w-64"}>
      <SidebarContent>
        <div className={`p-4 ${collapsed ? "text-center" : ""}`}>
          <h1 className={`font-bold text-sidebar-primary-foreground ${collapsed ? "text-sm" : "text-xl"}`}>
            {collapsed ? "POS" : "POS System"}
          </h1>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Pengaturan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setProfileModalOpen(true)}>
                  <Building2 className="h-4 w-4" />
                  {!collapsed && <span>Profil Toko</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          <SidebarMenuButton onClick={signOut} className="w-full hover:bg-destructive hover:text-destructive-foreground">
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Logout</span>}
          </SidebarMenuButton>
        </div>
      </SidebarContent>

      <ProfileModal 
        open={profileModalOpen} 
        onOpenChange={setProfileModalOpen} 
      />
    </Sidebar>
  );
}
