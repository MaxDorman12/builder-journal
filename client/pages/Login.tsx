import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Lock, User } from 'lucide-react';
import { FAMILY_MEMBERS } from '@shared/api';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setError('Please enter the family password');
      return;
    }

    setIsLoading(true);
    setError('');

    const success = login(password);

    if (success) {
      navigate('/');
    } else {
      setError('Incorrect password. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen family-gradient flex items-center justify-center p-4">
      <Card className="family-card w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center shadow-lg">
            <Heart className="h-8 w-8 text-pink-600 fill-pink-600 bouncy" />
          </div>
          <div>
            <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🏠 Family Login 🔑
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Enter the magical family password to unlock editing powers! ✨
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Family Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter family password"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <button
              type="submit"
              className="w-full fun-button disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? '✨ Logging in...' : '🎆 Enter Family Portal!'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl shadow-inner">
            <h4 className="font-medium text-sm mb-2 text-purple-800">🌈 For Family Members:</h4>
            <p className="text-xs text-purple-700 mb-2">
              Once logged in, you'll unlock magical powers to create journal entries,
              upload photos and videos, add pins to the map, and manage all
              our wonderful family memories! 💫
            </p>
            <div className="bg-gradient-to-r from-yellow-200 to-orange-200 p-3 rounded-xl shadow-md">
              <p className="text-xs text-orange-800 font-mono font-bold">
                🗝️ Secret Family Password: Summer07max
              </p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-purple-600 hover:text-purple-800 font-medium text-sm hover:underline transition-colors"
            >
              👀 Continue as Visitor (view-only)
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
