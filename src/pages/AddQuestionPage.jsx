import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { questionsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const TAGS = [
  'Placement', 'Sports', 'Event', 'Person', '#other'
];

const AddQuestionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState([
    { label: '', odds: 1 }
  ]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTag, setCustomTag] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [message, setMessage] = useState('');

  if (!user || user.role !== 'admin') {
    return <div className="text-center text-red-500 font-bold mt-10">Access denied. Admins only.</div>;
  }

  const handleOptionChange = (idx, field, value) => {
    setOptions((opts) => opts.map((opt, i) => i === idx ? { ...opt, [field]: value } : opt));
  };

  const addOption = () => setOptions((opts) => [...opts, { label: '', odds: 1 }]);
  const removeOption = (idx) => setOptions((opts) => opts.filter((_, i) => i !== idx));

  const handleTagToggle = (tag) => {
    setSelectedTags(tags => 
      tags.includes(tag) 
        ? tags.filter(t => t !== tag) 
        : [...tags, tag]
    );
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(tags => [...tags, customTag.trim()]);
      setCustomTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags(tags => tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || options.length < 2 || options.some(opt => !opt.label)) {
      setError('Title and at least 2 options with labels are required.');
      return;
    }
    try {
      setLoadingAction(true);
      setMessage('Adding question...');
      await questionsAPI.create({ 
        title, 
        description, 
        options,
        tags: selectedTags
      });
      setSuccess('Question added!');
      setTitle('');
      setDescription('');
      setOptions([{ label: '', odds: 1 }]);
      setSelectedTags([]);
      setError('');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add question');
    } finally {
      setLoadingAction(false);
      setMessage('');
    }
  };

  return (
    <div className="relative z-50 max-w-xl mx-auto mt-10 bg-black/80 p-8 rounded-lg border-2 border-gold shadow-lg">
      <h2 className="text-3xl font-extrabold text-gold mb-6">Add Betting Question</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gold font-semibold mb-2">Title</label>
          <input type="text" className="w-full p-2 rounded bg-gray-900 border border-gold text-gold" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block text-gold font-semibold mb-2">Description</label>
          <textarea className="w-full p-2 rounded bg-gray-900 border border-gold text-gold" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="block text-gold font-semibold mb-2">Options</label>
          <div className="space-y-2">
            {options.map((opt, idx) => (
              <div key={idx} className="flex gap-2 items-center bg-gray-800/80 p-2 rounded-lg border border-gold/40">
                <input type="text" placeholder={`Option ${idx + 1} name`} className="flex-1 p-2 rounded bg-gray-900 border border-gold text-gold" value={opt.label} onChange={e => handleOptionChange(idx, 'label', e.target.value)} required />
                <input type="number" min="1" step="0.01" placeholder="Odds" className="w-24 p-2 rounded bg-gray-900 border border-gold text-gold" value={opt.odds} onChange={e => handleOptionChange(idx, 'odds', e.target.value)} required />
                {options.length > 2 && (
                  <button type="button" onClick={() => removeOption(idx)} className="text-red-400 font-bold px-2 text-xl hover:text-red-600" title="Remove option">✕</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addOption} className="flex items-center gap-2 mt-2 px-4 py-2 bg-gold text-black rounded font-bold hover:bg-yellow-400 transition shadow-gold/50 border-2 border-gold">
              <span className="text-xl font-bold">+</span> <span>Add Option</span>
            </button>
          </div>
        </div>

        {/* Tags Section */}
        <div className="mb-4">
          <label className="block text-gold font-semibold mb-2">
            Tags <span className="text-xs text-gray-400">(Select all that apply)</span>
          </label>
          
          {/* Predefined Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {TAGS.map(tag => (
              <button
                type="button"
                key={tag}
                className={`px-3 py-1 rounded-full font-bold border-2 transition-all text-xs ${selectedTags.includes(tag) ? 'bg-[#00eaff] border-[#00eaff] text-black shadow' : 'bg-cardbg border-[#00eaff] text-[#00eaff] hover:bg-[#00eaff22]'}`}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Custom Tag Input */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Add custom tag (e.g., CSE2024, Branch2025)"
              className="flex-1 p-2 rounded bg-gray-900 border border-gold text-gold text-sm"
              value={customTag}
              onChange={e => setCustomTag(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
            />
            <button
              type="button"
              onClick={addCustomTag}
              className="px-4 py-2 bg-[#00eaff] text-black font-bold rounded hover:bg-[#00eaffcc] transition text-sm"
            >
              Add
            </button>
          </div>

          {/* Selected Tags Display */}
          {selectedTags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {selectedTags.map(tag => (
                <span 
                  key={tag} 
                  className="px-2 py-1 rounded-full bg-[#00eaff] text-black font-bold text-xs shadow flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-black hover:text-red-600 font-bold text-sm"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {error && <div className="text-red-500 mb-2 font-bold">{error}</div>}
        {success && <div className="text-green-400 mb-2 font-bold">{success}</div>}
        {loadingAction && <LoadingSpinner message={message} />}
        <button type="submit" className="w-full py-2 bg-gold text-black font-extrabold rounded hover:bg-yellow-400 transition">Add Question</button>
      </form>
    </div>
  );
};

export default AddQuestionPage; 