import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  BookOpen, 
  Map, 
  LogOut, 
  LogIn, 
  Heart,
  Camera,
  Calendar
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated, isFamilyMember, currentUser, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Journal', href: '/journal', icon: BookOpen },
    { name: 'Map', href: '/map', icon: Map },
    { name: 'Calendar', href: '/calendar', icon: Calendar }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen family-gradient">
      <header className="sticky top-0 z-50 family-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <div className="relative">
                  <Heart className="h-8 w-8 text-pink-500 fill-pink-500 bouncy" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ✨ Dorman Family Adventures ✨
                </span>
              </Link>
              
              <nav className="hidden md:flex space-x-6">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:scale-105'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated && isFamilyMember ? (
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-green-200 to-blue-200 px-3 py-1 rounded-full flex items-center space-x-1 shadow-md">
                    <Camera className="h-3 w-3 text-green-700" />
                    <span className="text-green-800 font-medium text-sm">👨‍👩‍👧‍👦 {currentUser}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="bg-gradient-to-r from-orange-300 to-red-300 hover:from-orange-400 hover:to-red-400 text-orange-800 font-medium py-1 px-3 rounded-full text-sm transform hover:scale-105 transition-all duration-200 shadow-md flex items-center space-x-1"
                  >
                    <LogOut className="h-3 w-3" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link to="/login">
                  <button className="bg-gradient-to-r from-purple-300 to-pink-300 hover:from-purple-400 hover:to-pink-400 text-purple-800 font-medium py-2 px-4 rounded-full text-sm transform hover:scale-105 transition-all duration-200 shadow-md flex items-center space-x-1">
                    <LogIn className="h-4 w-4" />
                    <span>🔐 Family Login</span>
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t bg-card/50">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex justify-around">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="family-card border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">
              Made with ❤️ for the Dorman Family Adventures
            </p>
            <p className="text-xs mt-2">
              Private family journal - For family eyes only 👨‍👩‍👧‍👦
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
