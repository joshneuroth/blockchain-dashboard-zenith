
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ApiInfoSection: React.FC = () => {
  return (
    <section className="w-full py-12 px-6 md:px-10 relative overflow-hidden border-t border-gray-200 dark:border-gray-800">
      {/* SVG Block Pattern Background */}
      <div className="absolute inset-0 z-0">
        <svg className="w-full h-full opacity-10 dark:opacity-5" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="blocks-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="20" height="20" fill="#333333" />
              <rect x="20" y="0" width="20" height="20" fill="#555555" />
              <rect x="0" y="20" width="20" height="20" fill="#555555" />
              <rect x="20" y="20" width="20" height="20" fill="#333333" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#blocks-pattern)" />
        </svg>
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-500/10 to-gray-700/10 dark:from-gray-800/20 dark:to-gray-900/20 z-0"></div>
      
      {/* Content */}
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 backdrop-blur-sm py-4 px-6 md:px-8 rounded-xl bg-white/50 dark:bg-gray-800/50 shadow-lg">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">
              Access Service Events API
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Pull service events data directly into your applications with our RESTful API. 
              Get historical incidents, status updates, and provider reliability metrics.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 backdrop-blur-sm bg-white/80 dark:bg-gray-700/80 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all" 
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
