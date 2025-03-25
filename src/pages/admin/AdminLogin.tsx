
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { signIn, isAdmin, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check environment and Supabase URL
  useEffect(() => {
    console.log("AdminLogin component mounted");
    console.log("Environment check:", {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'Not set',
      supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set (not shown)' : 'Not set',
      nodeEnv: import.meta.env.NODE_ENV,
      isDev: import.meta.env.DEV,
      isProd: import.meta.env.PROD,
    });
    
    // Check if user is already logged in and is admin
    if (user) {
      console.log("User is logged in:", user.id);
      console.log("Is admin:", isAdmin);
    } else {
      console.log("No user is logged in");
    }
  }, [user, isAdmin]);

  // If user is already logged in and is admin, redirect to dashboard
  useEffect(() => {
    if (user && isAdmin && !authLoading) {
      console.log("User is admin, redirecting to dashboard");
      navigate('/admin/dashboard');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    if (!email || !password) {
      const errorMessage = "Please enter both email and password";
      setLoginError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Calling signIn from AdminLogin component");
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error("Login error details:", error);
        
        const errorMessage = error.message || 
          (error.toString().includes("fetch") ? 
            "Network error: Unable to connect to authentication service. Please check your internet connection and make sure Supabase is properly configured." : 
            "An unexpected error occurred");
        
        setLoginError(errorMessage);
        
        toast({
          title: "Authentication failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        console.log("Sign in completed without error");
      }
      
      // The auth state change will trigger a redirect if the user is an admin
    } catch (error: any) {
      console.error("Login exception:", error);
      const errorMessage = "An unexpected error occurred. Please try again.";
      setLoginError(errorMessage);
      toast({
        title: "Error",
        description: error.message || errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Loading</CardTitle>
            <CardDescription>
              Please wait while we check your authentication status...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render the login form if user is authenticated and admin
  if (user && isAdmin) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="text-sm">{loginError}</div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;
