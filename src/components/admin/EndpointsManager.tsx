
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
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Edit, Plus, Trash } from 'lucide-react';

type Network = {
  id: string;
  network_id: string;
  name: string;
};

type Endpoint = {
  id: string;
  network_id: string;
  url: string;
  name: string;
  is_active: boolean;
};

export const EndpointsManager = () => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<Endpoint | null>(null);
  const [formData, setFormData] = useState({
    network_id: '',
    url: '',
    name: '',
    is_active: true
  });
  const { toast } = useToast();

  const fetchNetworks = async () => {
    try {
      const { data, error } = await supabase
        .from('network_configurations')
        .select('id, network_id, name')
        .order('name');
      
      if (error) throw error;
      setNetworks(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching networks',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const fetchEndpoints = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('rpc_endpoints')
        .select('*')
        .order('network_id, name');
      
      if (error) throw error;
      setEndpoints(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching endpoints',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchNetworks(), fetchEndpoints()]);
  }, []);

  const handleOpenDialog = (endpoint?: Endpoint) => {
    if (endpoint) {
      setEditingEndpoint(endpoint);
      setFormData({
        network_id: endpoint.network_id,
        url: endpoint.url,
        name: endpoint.name,
        is_active: endpoint.is_active
      });
    } else {
      setEditingEndpoint(null);
      setFormData({
        network_id: networks.length > 0 ? networks[0].network_id : '',
        url: '',
        name: '',
        is_active: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEndpoint(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, network_id: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingEndpoint) {
        // Update existing endpoint
        const { error } = await supabase
          .from('rpc_endpoints')
          .update({
            network_id: formData.network_id,
            url: formData.url,
            name: formData.name,
            is_active: formData.is_active
          })
          .eq('id', editingEndpoint.id);
        
        if (error) throw error;
        
        toast({
          title: 'Endpoint updated',
          description: `${formData.name} has been updated successfully.`
        });
      } else {
        // Create new endpoint
        const { error } = await supabase
          .from('rpc_endpoints')
          .insert({
            network_id: formData.network_id,
            url: formData.url,
            name: formData.name,
            is_active: formData.is_active
          });
        
        if (error) throw error;
        
        toast({
          title: 'Endpoint created',
          description: `${formData.name} has been added successfully.`
        });
      }
      
      handleCloseDialog();
      fetchEndpoints();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (endpoint: Endpoint) => {
    if (!confirm(`Are you sure you want to delete the endpoint ${endpoint.name}?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('rpc_endpoints')
        .delete()
        .eq('id', endpoint.id);
      
      if (error) throw error;
      
      toast({
        title: 'Endpoint deleted',
        description: `${endpoint.name} has been deleted successfully.`
      });
      
      fetchEndpoints();
    } catch (error: any) {
      toast({
        title: 'Error deleting endpoint',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getNetworkName = (networkId: string) => {
    const network = networks.find(n => n.network_id === networkId);
    return network ? network.name : networkId;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">RPC Endpoints</h3>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Endpoint
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-4">Loading endpoints...</div>
      ) : endpoints.length === 0 ? (
        <div className="text-center p-4 border rounded-md">
          No endpoints found. Add an endpoint to get started.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Network</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {endpoints.map((endpoint) => (
              <TableRow key={endpoint.id}>
                <TableCell>{getNetworkName(endpoint.network_id)}</TableCell>
                <TableCell className="font-medium">{endpoint.name}</TableCell>
                <TableCell className="max-w-xs truncate">{endpoint.url}</TableCell>
                <TableCell>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    endpoint.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {endpoint.is_active ? 'Active' : 'Inactive'}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleOpenDialog(endpoint)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(endpoint)}
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
              {editingEndpoint ? 'Edit Endpoint' : 'Add New Endpoint'}
            </DialogTitle>
            <DialogDescription>
              {editingEndpoint 
                ? 'Update the endpoint details below.' 
                : 'Enter the details for the new RPC endpoint.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="network_id">Network</Label>
                <Select 
                  value={formData.network_id} 
                  onValueChange={handleSelectChange}
                  required
                >
                  <SelectTrigger id="network_id">
                    <SelectValue placeholder="Select a network" />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map((network) => (
                      <SelectItem key={network.network_id} value={network.network_id}>
                        {network.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="name">Provider Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-gray-500">
                  Display name for the RPC provider (e.g., LlamaRPC, Alchemy)
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="url">RPC URL</Label>
                <Input 
                  id="url" 
                  name="url" 
                  value={formData.url}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-gray-500">
                  Full URL including https:// (e.g., https://eth.llamarpc.com)
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch 
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingEndpoint ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
