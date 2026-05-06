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
    Key,
    User,
    LayoutGrid,
    Moon,
    Sun,
    ClipboardList,
    Bell,
} from 'lucide-react';
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import { useDarkMode } from "@/lib/hooks/useDarkMode";
import Image from "next/image";
import NotificationBell from "./NotificationBell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const { user, profile } = useGlobal();
    const { isDark, toggle } = useDarkMode();
    const isMaster = user?.role === 'master';

    const allNavigation = [
        { name: 'Início', href: '/app', icon: Home, clientOnly: true },
        { name: 'Calendário', href: '/app/calendario', icon: CalendarDays, clientOnly: true },
        { name: 'Feed de Postagens', href: '/app/feed-postagens', icon: List, clientOnly: true },
        { name: 'Arquivos do Cliente', href: '/app/arquivos', icon: FolderOpen, clientOnly: true },
        { name: 'Totum Drive', href: '/app/drive', icon: Cloud, clientOnly: true },
        { name: 'Minhas Empresa', href: '/app/meu-cadastro', icon: ClipboardList, clientOnly: true },
        { name: 'Notificações', href: '/app/notificacoes', icon: Bell, clientOnly: false },
        { name: 'Central de Conteúdo', href: '/app/central-conteudo', icon: LayoutGrid, clientOnly: false },
        { name: 'Contrato', href: '/app/contrato', icon: FileText, clientOnly: false },
        { name: 'Campanhas', href: '/app/campanhas', icon: BarChart3, clientOnly: false },
        { name: 'Central de Clientes', href: '/app/gestao-clientes', icon: Building2, clientOnly: false },
        { name: 'Admin', href: '/app/admin', icon: User, clientOnly: false },
    ];

    const navigation = allNavigation.filter(item => isMaster || item.clientOnly);

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
        <div className="min-h-screen bg-surface-strong dark:bg-ink transition-colors">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-scrim/50 z-20 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 w-64 bg-canvas dark:bg-ink dark:border-r dark:border-hairline shadow-airbnb transform transition-transform duration-200 ease-in-out z-30 
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

                <div className="h-16 flex items-center justify-between px-4 border-b">
                    <Link href="/app" className="flex items-center gap-2">
                        <Image src="/logo.png" alt="Totum" width={120} height={32} className="h-8 w-auto" />
                    </Link>
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden text-muted hover:text-ink"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-4 px-2" aria-label="Navegação principal">
                    <ul className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        aria-current={isActive ? "page" : undefined}
                                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                            isActive
                                                ? 'bg-rausch/5 text-rausch'
                                                : 'text-body hover:bg-surface-soft hover:text-ink'
                                        }`}
                                    >
                                        <item.icon
                                            aria-hidden="true"
                                            className={`mr-3 h-5 w-5 ${
                                                isActive ? 'text-rausch' : 'text-muted-soft group-hover:text-muted'
                                            }`}
                                        />
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

            </div>

            <div className="lg:pl-64">
                <div className="sticky top-0 z-10 flex items-center justify-between h-16 bg-canvas dark:bg-ink shadow-airbnb px-4">
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden text-muted hover:text-ink"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="flex items-center gap-3 ml-auto">
                        <NotificationBell />
                        <div className="relative">
                        <button
                            onClick={() => setUserDropdownOpen(!isUserDropdownOpen)}
                            aria-expanded={isUserDropdownOpen}
                            aria-haspopup="menu"
                            aria-label="Menu do usuário"
                            className="flex items-center space-x-2 text-sm text-ink hover:text-ink"
                        >
                            <div className="w-8 h-8 rounded-full bg-rausch/10 flex items-center justify-center overflow-hidden" aria-hidden="true">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
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
                            <div className="absolute right-0 mt-2 w-64 bg-canvas rounded-md shadow-airbnb border z-50">
                                <div className="p-2 border-b border-hairline-soft">
                                    <div className="flex items-center gap-2">
                                        <div className="w-9 h-9 rounded-full bg-rausch/10 flex items-center justify-center overflow-hidden shrink-0">
                                            {profile?.avatar_url ? (
                                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-rausch-active font-medium text-sm">
                                                    {user ? getInitials(user.email) : '??'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-ink truncate">
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
                                            toggle();
                                        }}
                                        className="w-full flex items-center px-4 py-2 text-sm text-ink hover:bg-surface-soft"
                                    >
                                        {isDark ? <Sun className="mr-3 h-4 w-4 text-muted-soft" /> : <Moon className="mr-3 h-4 w-4 text-muted-soft" />}
                                        {isDark ? 'Modo claro' : 'Modo escuro'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setUserDropdownOpen(false);
                                            handleGoToProfile()
                                        }}
                                        className="w-full flex items-center px-4 py-2 text-sm text-ink hover:bg-surface-soft"
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

                <main className="p-4">
                    {children}
                </main>
            </div>
        </div>
    );
}
