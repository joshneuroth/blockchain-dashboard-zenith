
import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const NewsletterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSuccess(true);
    setEmail('');
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setIsSuccess(false);
    }, 3000);
  };

  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold mb-2">JOIN THE NEWSLETTER</h3>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter Your Email"
          className="flex-grow rounded-l-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-gray-600 transition-all"
          disabled={isSubmitting || isSuccess}
        />
        <button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className="bg-black dark:bg-white text-white dark:text-black rounded-r-md px-4 flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowRight size={18} />
          )}
        </button>
      </form>
      
      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
      
      {isSuccess && (
        <p className="mt-2 text-xs text-green-500">
          Thank you for subscribing to our newsletter!
        </p>
      )}
      
      <p className="mt-2 text-xs text-gray-500">
        By signing up for our newsletter you agree to our privacy policy
      </p>
    </div>
  );
};

export default NewsletterForm;
