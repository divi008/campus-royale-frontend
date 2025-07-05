import React, { useState } from 'react';
import { suggestionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TAGS = [
  'Placement', 'Sports', 'Event', 'Person', '#other'
];

const SuggestQuestionPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    questionText: '',
    options: ['', ''], // Start with 2 empty options
    multipliers: [1.5, 1.5] // Default multipliers
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTag, setCustomTag] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      options: newOptions
    });
  };

  const handleMultiplierChange = (index, value) => {
    const newMultipliers = [...formData.multipliers];
    newMultipliers[index] = parseFloat(value) || 1.5;
    setFormData({
      ...formData,
      multipliers: newMultipliers
    });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ''],
      multipliers: [...formData.multipliers, 1.5]
    });
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      setMessage({ type: 'error', text: 'Minimum 2 options required' });
      return;
    }
    
    const newOptions = formData.options.filter((_, i) => i !== index);
    const newMultipliers = formData.multipliers.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      options: newOptions,
      multipliers: newMultipliers
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (!formData.questionText.trim()) {
      setMessage({ type: 'error', text: 'Question text is required' });
      setLoading(false);
      return;
    }

    const validOptions = formData.options.filter(option => option.trim() !== '');
    if (validOptions.length < 2) {
      setMessage({ type: 'error', text: 'At least 2 options are required' });
      setLoading(false);
      return;
    }

    try {
      const response = await suggestionsAPI.submit({
        questionText: formData.questionText.trim(),
        options: validOptions,
        multipliers: formData.multipliers.slice(0, validOptions.length),
        tags: selectedTags
      });

      setMessage({ type: 'success', text: response.data.message });
      setFormData({
        questionText: '',
        options: ['', ''],
        multipliers: [1.5, 1.5]
      });
      setSelectedTags([]);
      setCustomTag('');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to submit suggestion';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h1 className="text-3xl font-bold text-gold mb-8 text-center">
            Suggest a Question
          </h1>
          
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-500/20 border border-green-500/50 text-green-200' 
                : 'bg-red-500/20 border border-red-500/50 text-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question Text */}
            <div>
              <label className="block text-gold font-semibold mb-2">
                Question Text *
              </label>
              <textarea
                name="questionText"
                value={formData.questionText}
                onChange={handleInputChange}
                className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="Enter your question here..."
                rows={3}
                required
              />
            </div>

            {/* Options */}
            <div>
              <label className="block text-gold font-semibold mb-2">
                Options * (Minimum 2)
              </label>
              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        placeholder={`Option ${index + 1}`}
                        required
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        value={formData.multipliers[index]}
                        onChange={(e) => handleMultiplierChange(index, e.target.value)}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        placeholder="1.5"
                        step="0.1"
                        min="1.0"
                        required
                      />
                    </div>
                                         {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="px-3 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={addOption}
                className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                + Add Option
              </button>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-gold font-semibold mb-2">
                Tags <span className="text-xs text-gray-400">(Select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {TAGS.map(tag => (
                  <button
                    type="button"
                    key={tag}
                    className={`px-3 py-1 rounded-full font-bold border-2 transition-all text-xs ${selectedTags.includes(tag) ? 'bg-[#00eaff] border-[#00eaff] text-black shadow' : 'bg-cardbg border-[#00eaff] text-[#00eaff] hover:bg-[#00eaff22]'}`}
                    onClick={() => setSelectedTags(tags => tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag])}
                  >
                    {tag}
                  </button>
                ))}
              </div>
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

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gold hover:bg-yellow-500 disabled:bg-gray-500 text-black font-bold rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Suggestion'}
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <h3 className="text-blue-200 font-semibold mb-2">How it works:</h3>
            <ul className="text-blue-100 text-sm space-y-1">
              <li>• You can suggest up to 2 questions per day</li>
              <li>• Each question must have at least 2 options</li>
              <li>• Multipliers determine the payout odds (default: 1.5x)</li>
              <li>• Admins will review and approve/reject suggestions</li>
              <li>• Approved suggestions become betting questions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestQuestionPage; 