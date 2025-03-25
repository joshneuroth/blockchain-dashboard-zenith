
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, ChevronRight } from 'lucide-react';

interface MonitorPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  networkName: string;
}

const MonitorPaymentModal: React.FC<MonitorPaymentModalProps> = ({ 
  open, 
  onOpenChange,
  networkName
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Monitor Your {networkName} RPC</DialogTitle>
          <DialogDescription>
            Get real-time alerts and advanced monitoring for your RPC nodes.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-full">
                <ChevronRight className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium">24/7 Monitoring</h3>
                <p className="text-sm text-muted-foreground">
                  Continuous monitoring of your RPC endpoints with instant alerts
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-full">
                <ChevronRight className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium">Performance Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Detailed performance metrics and historical data
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-full">
                <ChevronRight className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium">Custom Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Set up custom alert thresholds and notification preferences
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">Monthly Subscription</div>
                <div className="text-lg font-bold">$5/month</div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Cancel anytime, billed monthly
              </p>
              <Button className="w-full" variant="default">
                <CreditCard className="mr-2 h-4 w-4" />
                Subscribe Now
              </Button>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">Lifetime Access</div>
                <div className="text-lg font-bold">$25 USDT</div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                One-time payment, permanent access
              </p>
              <Button className="w-full" variant="outline">
                Pay with Crypto
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <div className="text-xs text-center text-muted-foreground">
            By proceeding, you agree to our Terms of Service and Privacy Policy
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MonitorPaymentModal;
