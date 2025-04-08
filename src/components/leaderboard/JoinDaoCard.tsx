
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const JoinDaoCard: React.FC = () => {
  return (
    <Card className="glass-card bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/20 border border-purple-100 dark:border-purple-900/50 mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Join the BlockHeight.xyz DAO!</h2>
            <p className="text-muted-foreground">Contribute to nextgen testing methodology</p>
          </div>
          <Button 
            variant="outline" 
            className="border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50"
            onClick={() => window.open('https://blockheight.xyz/dao', '_blank')}
          >
            <ExternalLink size={16} className="mr-2" />
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JoinDaoCard;
