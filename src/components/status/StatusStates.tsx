
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const StatusLoading: React.FC = () => {
  return (
    <Card className="min-h-[200px] flex items-center justify-center">
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading status information...</p>
        </div>
      </CardContent>
    </Card>
  );
};

export const StatusError: React.FC<{ error: string }> = ({ error }) => {
  return (
    <Card className="min-h-[200px] flex items-center justify-center bg-red-50 dark:bg-red-950/20">
      <CardContent>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
            <span className="text-red-600 dark:text-red-400 text-xl">!</span>
          </div>
          <div>
            <p className="font-semibold text-red-600 dark:text-red-400">Error loading status data</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
          <p className="text-sm">Please try again later</p>
        </div>
      </CardContent>
    </Card>
  );
};
