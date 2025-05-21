
import React from 'react';
import NewsletterForm from '@/components/NewsletterForm';

const NetworkFooter: React.FC = () => {
  return (
    <footer className="w-full py-8 px-6 md:px-10 mt-12 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="col-span-1">
            <h2 className="text-lg font-bold mb-4">
              blockheight<span className="text-gray-500 font-mono">.xyz</span>
            </h2>
            <NewsletterForm />
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold mb-4">BLOCKHEIGHT.XYZ</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://docs.blockheight.xyz/#overview" target="_blank" rel="noopener noreferrer" className="hover:underline">Overview</a></li>
              <li><a href="https://docs.blockheight.xyz" target="_blank" rel="noopener noreferrer" className="hover:underline">Docs</a></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold mb-4">FOLLOW US</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://x.com/blockheightDAO" target="_blank" rel="noopener noreferrer" className="hover:underline">@BlockHeightDAO</a></li>
            </ul>
          </div>
          
          {/* Support section commented out
          <div className="col-span-1">
            <h3 className="text-sm font-semibold mb-4">SUPPORT</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:underline">Contact Us</a></li>
              <li><a href="#" className="hover:underline">FAQ</a></li>
            </ul>
          </div>
          */}
        </div>
        
        <div className="mt-12 pt-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} blockheight.xyz.</p>
        </div>
      </div>
    </footer>
  );
};

export default NetworkFooter;
