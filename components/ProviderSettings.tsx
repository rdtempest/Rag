import { useState, useEffect } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box,
  SelectChangeEvent 
} from '@mui/material';

export const providers = ['openai', 'anthropic', 'gemini'] as const;
export type Provider = typeof providers[number];

interface ProviderSettingsProps {
  onProviderChange?: (provider: Provider) => void;
}

export default function ProviderSettings({ onProviderChange }: ProviderSettingsProps) {
  const [currentProvider, setCurrentProvider] = useState<Provider>('openai');

  useEffect(() => {
    // Load initial setting
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setCurrentProvider(data.provider as Provider);
      })
      .catch(console.error);
  }, []);

  const handleChange = async (event: SelectChangeEvent) => {
    const newProvider = event.target.value as Provider;
    console.log('Selected provider:', newProvider);
    setCurrentProvider(newProvider);

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider: newProvider }),
      });

      onProviderChange?.(newProvider);
    } catch (error) {
      console.error('Failed to update provider:', error);
    }
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="chat-provider-label">Chat Provider</InputLabel>
        <Select
          labelId="chat-provider-label"
          id="chat-provider-select"
          value={currentProvider}
          label="Chat Provider"
          onChange={handleChange}
        >
          {providers.map((provider) => (
            <MenuItem key={provider} value={provider}>
              {provider.charAt(0).toUpperCase() + provider.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
