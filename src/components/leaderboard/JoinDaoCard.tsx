
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const JoinDaoCard: React.FC = () => {
  return (
    <Card className="bg-[#6298FF] text-white border-0 mb-8 shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Join the BlockHeight.xyz DAO!</h2>
            <p className="text-white/80">Contribute to nextgen testing methodology</p>
          </div>
          <Button 
            variant="outline" 
            className="border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent"
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
