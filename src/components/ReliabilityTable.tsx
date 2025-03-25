
import React from 'react';
import { ProviderReliability, TimePeriod } from '@/hooks/blockchain/useReliabilityData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ReliabilityTableProps {
  data: ProviderReliability[];
  timePeriod: TimePeriod;
  onTimePeriodChange: (value: TimePeriod) => void;
}

const ReliabilityTable: React.FC<ReliabilityTableProps> = ({
  data,
  timePeriod,
  onTimePeriodChange
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ToggleGroup 
          type="single" 
          value={timePeriod}
          onValueChange={(value) => {
            if (value) onTimePeriodChange(value as TimePeriod);
          }}
          className="justify-end"
          size="sm"
        >
          <ToggleGroupItem value="all-time" aria-label="Show all time data">
            All Time
          </ToggleGroupItem>
          <ToggleGroupItem value="last-100" aria-label="Show last 100 readings">
            Last 100 Readings
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider</TableHead>
            <TableHead className="text-right">Total Readings</TableHead>
            <TableHead className="text-right">In Sync</TableHead>
            <TableHead className="text-right">At Height Reliability</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                No reliability data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((provider) => (
              <TableRow key={provider.name}>
                <TableCell className="font-medium">{provider.name}</TableCell>
                <TableCell className="text-right">{provider.total}</TableCell>
                <TableCell className="text-right">{provider.inSync}</TableCell>
                <TableCell className="text-right">
                  <span 
                    className={`font-medium ${
                      provider.syncPercentage >= 90 ? 'text-green-500' :
                      provider.syncPercentage >= 70 ? 'text-yellow-500' :
                      'text-red-500'
                    }`}
                  >
                    {provider.syncPercentage.toFixed(1)}%
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReliabilityTable;
