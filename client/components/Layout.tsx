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
                <Heart className="h-8 w-8 text-primary fill-primary" />
                <span className="text-xl font-bold text-foreground">
                  Dorman Family Adventures
                </span>
              </Link>
              
              <nav className="hidden md:flex space-x-6">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
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
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Camera className="h-3 w-3" />
                    <span>Family Member: {currentUser}</span>
                  </Badge>
                  <Button variant="outline" size="sm" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    <LogIn className="h-4 w-4 mr-1" />
                    Family Login
                  </Button>
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
