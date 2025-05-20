
import React from 'react';
import { ExternalLink, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ApiInfoSection: React.FC = () => {
  return (
    <section className="w-full py-12 px-6 md:px-10 relative overflow-hidden border-t border-gray-200 dark:border-gray-700">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-900/80 dark:to-gray-800/80 z-0"></div>
      
      {/* Content */}
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex gap-4">
            <div className="hidden md:flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 dark:bg-primary/20">
              <Database size={24} className="text-primary dark:text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-50">
                Access Service Events API
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Pull service events data directly into your applications with our RESTful API. 
                Get historical incidents, status updates, and provider reliability metrics.
              </p>
            </div>
          </div>
          <Button 
            variant="default" 
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md" 
            size="lg"
            onClick={() => window.open('https://blockheight-api.fly.dev/docs', '_blank')}
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
