
import React from 'react';

interface BlockTimeInfoProps {
  blocksPerMinute: number;
}

const BlockTimeInfo: React.FC<BlockTimeInfoProps> = ({ blocksPerMinute }) => {
  const formatBlocksPerMinute = (bpm: number): string => {
    if (bpm === 0 || isNaN(bpm)) return "Calculating...";
    return `${bpm.toFixed(1)} blocks/min`;
  };

  const formatBlocksPerSecond = (bpm: number): string => {
    if (bpm === 0 || isNaN(bpm)) return "Calculating...";
    const bps = bpm / 60;
    return `${bps.toFixed(2)} blocks/sec`;
  };

  return (
    <div className="font-medium mt-1 flex flex-wrap items-center gap-x-3">
      <span>BLOCK TIME:</span>
      <span>{formatBlocksPerMinute(blocksPerMinute)}</span>
      <span className="text-xs opacity-80">({formatBlocksPerSecond(blocksPerMinute)})</span>
    </div>
  );
};

export default BlockTimeInfo;
