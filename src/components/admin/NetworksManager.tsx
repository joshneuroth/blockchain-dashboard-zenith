
import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Edit, Plus, Trash } from 'lucide-react';

type Network = {
  id: string;
  network_id: string;
  name: string;
  color: string;
};

export const NetworksManager = () => {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState<Network | null>(null);
  const [formData, setFormData] = useState({
    network_id: '',
    name: '',
    color: ''
  });
  const { toast } = useToast();

  const fetchNetworks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('network_configurations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setNetworks(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching networks',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworks();
  }, []);

  const handleOpenDialog = (network?: Network) => {
    if (network) {
      setEditingNetwork(network);
      setFormData({
        network_id: network.network_id,
        name: network.name,
        color: network.color
      });
    } else {
      setEditingNetwork(null);
      setFormData({
        network_id: '',
        name: '',
        color: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingNetwork(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingNetwork) {
        // Update existing network
        const { error } = await supabase
          .from('network_configurations')
          .update({
            name: formData.name,
            color: formData.color
          })
          .eq('id', editingNetwork.id);
        
        if (error) throw error;
        
        toast({
          title: 'Network updated',
          description: `${formData.name} has been updated successfully.`
        });
      } else {
        // Create new network
        const { error } = await supabase
          .from('network_configurations')
          .insert({
            network_id: formData.network_id,
            name: formData.name,
            color: formData.color
          });
        
        if (error) throw error;
        
        toast({
          title: 'Network created',
          description: `${formData.name} has been added successfully.`
        });
      }
      
      handleCloseDialog();
      fetchNetworks();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (network: Network) => {
    if (!confirm(`Are you sure you want to delete ${network.name}? This will also delete all associated RPC endpoints.`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('network_configurations')
        .delete()
        .eq('id', network.id);
      
      if (error) throw error;
      
      toast({
        title: 'Network deleted',
        description: `${network.name} has been deleted successfully.`
      });
      
      fetchNetworks();
    } catch (error: any) {
      toast({
        title: 'Error deleting network',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Blockchain Networks</h3>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Network
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-4">Loading networks...</div>
      ) : networks.length === 0 ? (
        <div className="text-center p-4 border rounded-md">
          No networks found. Add a network to get started.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Network ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Color</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {networks.map((network) => (
              <TableRow key={network.id}>
                <TableCell className="font-medium">{network.network_id}</TableCell>
                <TableCell>{network.name}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: `var(--${network.color})` }}
                    ></div>
                    {network.color}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleOpenDialog(network)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(network)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingNetwork ? 'Edit Network' : 'Add New Network'}
            </DialogTitle>
            <DialogDescription>
              {editingNetwork 
                ? 'Update the network details below.' 
                : 'Enter the details for the new blockchain network.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="network_id">Network ID</Label>
                <Input 
                  id="network_id" 
                  name="network_id" 
                  value={formData.network_id}
                  onChange={handleInputChange}
                  disabled={!!editingNetwork}
                  required
                />
                <p className="text-xs text-gray-500">
                  Unique identifier for the network (e.g., ethereum, polygon)
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="name">Display Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="color">Color</Label>
                <Input 
                  id="color" 
                  name="color" 
                  value={formData.color}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-gray-500">
                  CSS color variable name (e.g., ethereum, polygon, primary)
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingNetwork ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
