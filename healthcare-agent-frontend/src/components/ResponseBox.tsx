"use client";

import React from 'react';
import { Paper, Typography, Box, Avatar } from '@mui/material';
import MedicationIcon from '@mui/icons-material/Medication';
import EmailIcon from '@mui/icons-material/Email';
import SmartToyIcon from '@mui/icons-material/SmartToy';

type AgentType = 'dataCollector' | 'emailAgent' | 'avatar';

interface ResponseBoxProps {
    message: string;
    agentType: AgentType;
}

const agentDetails = {
    dataCollector: {
        icon: <MedicationIcon />,
        name: "Data Collector Agent"
    },
    emailAgent: {
        icon: <EmailIcon />,
        name: "Email Agent"
    },
    avatar: {
        icon: <SmartToyIcon />,
        name: "AI Avatar Assistant"
    }
};

const ResponseBox: React.FC<ResponseBoxProps> = ({ message, agentType }) => {
    React.useEffect(() => {
        console.log(`ResponseBox loaded with message from ${agentDetails[agentType].name}`);
    }, [message, agentType]);

    return (
        <Paper elevation={2} sx={{ p: 2, my: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {agentDetails[agentType].icon}
                </Avatar>
                <Typography variant="subtitle1" fontWeight="bold">
                    {agentDetails[agentType].name}
                </Typography>
            </Box>
            <Typography variant="body1" sx={{ mt: 1 }}>
                {message}
            </Typography>
        </Paper>
    );
};

export default ResponseBox;