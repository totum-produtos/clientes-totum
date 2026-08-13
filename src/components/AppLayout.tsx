"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Home,
    CalendarDays,
    FolderOpen,
    Cloud,
    FileText,
    BarChart3,
    Building2,
    List,
    Menu,
    X,
    ChevronDown,
    LogOut,
    User,
    ClipboardList,
    Bell,
    LayoutGrid,
    Target,
    Link2
} from 'lucide-react';
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import Image from "next/image";
import NotificationBell from "./NotificationBell";
import SpoofingSelector from "./SpoofingSelector";

type NavItem = {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    clientOnly: boolean;
};

type NavGroup = {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    adminOnly?: boolean;
    items: NavItem[];
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const { user, profile, client } = useGlobal();
    const isMaster = user?.role === 'master';

    const navigationGroups: NavGroup[] = [
        {
            title: "Meu Negócio",
            icon: Building2,
            items: [
                { name: 'Início', href: '/app', icon: Home, clientOnly: true },
                { name: 'Minha Empresa', href: '/app/meu-cadastro', icon: ClipboardList, clientOnly: true },
                { name: 'Central de Planejamentos', href: '/app/planejamentos', icon: Target, clientOnly: true },
                { name: 'Central de Conteúdos', href: '/app/central-conteudo', icon: LayoutGrid, clientOnly: false },
                { name: 'Notificações', href: '/app/notificacoes', icon: Bell, clientOnly: false },
            ]
        },
        {
            title: "Operação & Marketing",
            icon: BarChart3,
            items: [
                { name: 'Calendário', href: '/app/calendario', icon: CalendarDays, clientOnly: true },
                { name: 'Feed de Postagens', href: '/app/feed-postagens', icon: List, clientOnly: true },
                { name: 'Campanhas', href: '/app/campanhas', icon: BarChart3, clientOnly: false },
                { name: 'Link na Bio', href: '/app/bio', icon: Link2, clientOnly: true },
            ]
        },
        {
            title: "Documentos & Arquivos",
            icon: FolderOpen,
            items: [
                { name: 'Arquivos do Cliente', href: '/app/arquivos', icon: FolderOpen, clientOnly: true },
                { name: 'Totum Drive', href: '/app/drive', icon: Cloud, clientOnly: true },
                { name: 'Contratos', href: '/app/contrato', icon: FileText, clientOnly: false },
            ]
        },
        {
            title: "Gestão Totum",
            icon: User,
            adminOnly: true,
            items: [
                { name: 'Central de Clientes', href: '/app/gestao-clientes', icon: Building2, clientOnly: false },
                { name: 'Admin', href: '/app/admin', icon: User, clientOnly: false },
                { name: 'Pendências', href: '/app/admin/pendencias', icon: List, clientOnly: false },
                { name: 'Planejamentos (Gestão)', href: '/app/admin/planejamentos', icon: Target, clientOnly: false },
                { name: 'Link na Bio (Gestão)', href: '/app/admin/bio', icon: Link2, clientOnly: false },
            ]
        }
    ];

    const handleLogout = async () => {
        try {
            const client = await createSPASassClient();
            await client.logout();
        } catch (error) {
            console.error('Erro ao sair:', error);
        }
    };
    const handleGoToProfile = async () => {
        router.push('/app/perfil')
    };

    const getInitials = (email: string) => {
        const parts = email.split('@')[0].split(/[._-]/);
        return parts.length > 1
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : parts[0].slice(0, 2).toUpperCase();
    };



    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-canvas text-white-soft transition-colors">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-scrim/50 z-20 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 w-64 bg-navy-card border-r border-border-strong shadow-airbnb transform transition-transform duration-200 ease-in-out z-30
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

                <div className="h-16 flex items-center justify-between px-4 border-b border-border-strong">
                    <Link href="/app" className="flex items-center gap-2">
                        <Image src="/logo.png" alt="Totum" width={140} height={64} className="h-10 w-auto brightness-0 invert" />
                    </Link>
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden text-muted-soft hover:text-white"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-4 px-2" aria-label="Navegação principal">
                    <div className="space-y-4">
                        {navigationGroups.map((group) => (
                            <SidebarGroup 
                                key={group.title} 
                                group={group} 
                                pathname={pathname} 
                                isMaster={isMaster} 
                                closeSidebar={() => setSidebarOpen(false)}
                            />
                        ))}
                    </div>
                </nav>

            </div>

            <div className="lg:pl-64">
                <div className="sticky top-0 z-10 flex items-center justify-between h-16 bg-navy-card border-b border-border-strong shadow-airbnb px-4">
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden text-muted-soft hover:text-white"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="flex items-center gap-3 ml-auto">
                        <SpoofingSelector />
                        <NotificationBell />
                        <div className="relative">
                        <button
                            onClick={() => setUserDropdownOpen(!isUserDropdownOpen)}
                            aria-expanded={isUserDropdownOpen}
                            aria-haspopup="menu"
                            aria-label="Menu do usuário"
                            className="flex items-center space-x-2 text-sm text-white-soft hover:text-white"
                        >
                            <div className="w-8 h-8 rounded-full bg-rausch/10 flex items-center justify-center overflow-hidden" aria-hidden="true">
                                {profile?.avatar_url ? (
                                    <Image src={profile.avatar_url} alt="" width={32} height={32} unoptimized className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-rausch-active font-medium">
                                        {user ? getInitials(user.email) : '??'}
                                    </span>
                                )}
                            </div>
                            <span>{user?.email || 'Carregando...'}</span>
                            <ChevronDown className="h-4 w-4" />
                        </button>

                        {isUserDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-navy-card rounded-md shadow-airbnb border border-border-strong z-50">
                                <div className="p-2 border-b border-border-strong">
                                    <div className="flex items-center gap-2">
                                        <div className="w-9 h-9 rounded-full bg-rausch/10 flex items-center justify-center overflow-hidden shrink-0">
                                            {profile?.avatar_url ? (
                                                <Image src={profile.avatar_url} alt="Avatar" width={36} height={36} unoptimized className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-rausch-active font-medium text-sm">
                                                    {user ? getInitials(user.email) : '??'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-white truncate">
                                                {profile?.display_name || user?.email?.split('@')[0] || 'Usuário'}
                                            </p>
                                            <p className="text-xs text-muted truncate">{user?.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setUserDropdownOpen(false);
                                            handleGoToProfile()
                                        }}
                                        className="w-full flex items-center px-4 py-2 text-sm text-white-soft hover:bg-navy-elevated hover:text-white"
                                    >
                                        <User className="mr-3 h-4 w-4 text-muted-soft" />
                                        Meu Perfil
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setUserDropdownOpen(false);
                                        }}
                                        className="w-full flex items-center px-4 py-2 text-sm text-danger-text hover:bg-danger-bg"
                                    >
                                        <LogOut className="mr-3 h-4 w-4 text-danger-text" />
                                        Sair
                                    </button>
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                </div>

                <main className="p-4 relative">
                    {!isMaster && client && !client.profile_data?.briefing_completed && pathname !== '/app/meu-cadastro' && (
                        <div className="absolute inset-0 bg-canvas/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center rounded-lg">
                            <div className="bg-navy-card border border-border-strong p-8 rounded-lg shadow-xl max-w-md w-full">
                                <ClipboardList className="w-12 h-12 text-rausch mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-white mb-2">Briefing Obrigatório Pendente</h2>
                                <p className="text-muted text-sm mb-6">
                                    Para liberar o acesso completo ao portal e continuarmos com a estratégia, precisamos que você preencha as informações do seu negócio.
                                </p>
                                <Link href="/app/meu-cadastro" className="block w-full py-3 bg-rausch text-white font-medium rounded-lg hover:bg-rausch-active transition-colors">
                                    Preencher Briefing Agora
                                </Link>
                            </div>
                        </div>
                    )}
                    <div className={!isMaster && client && !client.profile_data?.briefing_completed && pathname !== '/app/meu-cadastro' ? 'opacity-20 pointer-events-none blur-sm' : ''}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

function SidebarGroup({ group, pathname, isMaster, closeSidebar }: { group: NavGroup; pathname: string; isMaster: boolean; closeSidebar: () => void }) {
    const GroupIcon = group.icon;
    // Check if any item in this group is currently active
    const hasActiveItem = group.items.some((item) => pathname.startsWith(item.href) && (item.href !== '/app' || pathname === '/app'));
    
    // We open the group by default if it has an active item, or if it's the "Meu Negócio" group
    const [isOpen, setIsOpen] = useState(hasActiveItem || group.title === "Meu Negócio");

    // Filter items based on user role
    const visibleItems = group.items.filter((item) => isMaster || item.clientOnly);

    if (visibleItems.length === 0) return null;
    if (group.adminOnly && !isMaster) return null;

    return (
        <div className="mb-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-soft uppercase tracking-wider hover:text-white transition-colors group"
            >
                <div className="flex items-center gap-2">
                    <GroupIcon className="w-4 h-4 text-muted-soft group-hover:text-white-soft" />
                    {group.title}
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            
            <div 
                className={`mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                {visibleItems.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={closeSidebar}
                            className={`group flex items-center pl-9 pr-2 py-2 text-sm font-medium rounded-md transition-colors relative ${
                                isActive
                                    ? 'bg-rausch/10 text-rausch'
                                    : 'text-white-soft hover:bg-navy-elevated hover:text-white'
                            }`}
                        >
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-rausch rounded-r-full" />}
                            <ItemIcon
                                className={`mr-3 h-4 w-4 ${
                                    isActive ? 'text-rausch' : 'text-muted-soft group-hover:text-white-soft'
                                }`}
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
