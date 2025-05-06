"use client";
 
import React, { useEffect } from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import MedicationIcon from '@mui/icons-material/Medication';
import EmailIcon from '@mui/icons-material/Email';
import SmartToyIcon from '@mui/icons-material/SmartToy';
 
type AgentType = 'dataCollector' | 'emailAgent' | 'avatar';
 
interface AgentIconIndicatorProps {
  currentAgent: AgentType;
}
 
const agentInfo = {
  dataCollector: { icon: <MedicationIcon />, label: 'Data Collection Agent' },
  emailAgent: { icon: <EmailIcon />, label: 'Email Agent' },
  avatar: { icon: <SmartToyIcon />, label: 'AI Avatar Assistant' },
};
 
const AgentIconIndicator: React.FC<AgentIconIndicatorProps> = ({ currentAgent }) => {
  useEffect(() => {
    console.log(`Current active agent: ${agentInfo[currentAgent].label}`);
  }, [currentAgent]);
 
  return (
<Box display="flex" alignItems="center" gap={2}>
<Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
        {agentInfo[currentAgent].icon}
</Avatar>
<Typography variant="h6" fontWeight="bold">
        {agentInfo[currentAgent].label}
</Typography>
</Box>
  );
};
 
export default AgentIconIndicator;