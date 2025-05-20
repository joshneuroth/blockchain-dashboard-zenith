
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ApiInfoSection: React.FC = () => {
  return (
    <section className="w-full py-12 px-6 md:px-10 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Access Service Events API
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Pull service events data directly into your applications with our RESTful API. 
              Get historical incidents, status updates, and provider reliability metrics.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            size="lg"
            onClick={() => window.open('https://docs.blockheight.xyz/api-reference/introduction#5-get-events', '_blank')}
          >
            <span>View API Docs</span>
            <ExternalLink size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ApiInfoSection;
