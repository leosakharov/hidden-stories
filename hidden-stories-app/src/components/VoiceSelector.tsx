import React, { useState, useEffect } from 'react';
import { Voice } from '../api/elevenlabs';
import { getAllVoices, popularVoices } from '../shared/utils';

interface VoiceSelectorProps {
  onVoiceSelect: (voiceId: string) => void;
  selectedVoiceId?: string;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ 
  onVoiceSelect, 
  selectedVoiceId = popularVoices.rachel 
}) => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVoices = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const availableVoices = await getAllVoices();
        setVoices(availableVoices);
      } catch (err) {
        console.error('Error fetching voices:', err);
        setError('Failed to load voices. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVoices();
  }, []);

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onVoiceSelect(e.target.value);
  };

  return (
    <div className="mt-2">
      <label htmlFor="voice-selector" className="form-label text-muted">
        Voice:
      </label>
      <select
        id="voice-selector"
        className="form-select form-select-sm"
        value={selectedVoiceId}
        onChange={handleVoiceChange}
        disabled={isLoading || voices.length === 0}
      >
        {voices.length === 0 && !isLoading && !error && (
          <option value={selectedVoiceId}>Default Voice</option>
        )}
        
        {voices.map((voice) => (
          <option key={voice.voice_id} value={voice.voice_id}>
            {voice.name}
          </option>
        ))}
      </select>
      
      {isLoading && <div className="text-muted mt-1">Loading voices...</div>}
      {error && <div className="text-danger mt-1">{error}</div>}
    </div>
  );
};

export default VoiceSelector;
