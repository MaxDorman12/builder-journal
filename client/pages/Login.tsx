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
  const [selectedMember, setSelectedMember] = useState('');
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
    
    if (!selectedMember) {
      setError('Please select a family member');
      return;
    }
    
    if (!password) {
      setError('Please enter the family password');
      return;
    }

    setIsLoading(true);
    setError('');

    const success = login(password, selectedMember);
    
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
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Heart className="h-6 w-6 text-primary fill-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Family Login</CardTitle>
            <p className="text-muted-foreground mt-2">
              Enter the family password to access editing features
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="member">Select Family Member</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your name" />
                </SelectTrigger>
                <SelectContent>
                  {FAMILY_MEMBERS.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{member.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({member.role})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">For Family Members:</h4>
            <p className="text-xs text-muted-foreground">
              Once logged in, you'll be able to create new journal entries, 
              upload photos and videos, add pins to the map, and manage all 
              family content.
            </p>
          </div>

          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => navigate('/')}>
              Continue as Visitor
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
