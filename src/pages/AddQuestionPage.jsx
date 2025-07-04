import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { questionsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AddQuestionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState([
    { label: '', odds: 1 }
  ]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  if (!user || user.role !== 'admin') {
    return <div className="text-center text-red-500 font-bold mt-10">Access denied. Admins only.</div>;
  }
  const handleOptionChange = (idx, field, value) => {
    setOptions((opts) => opts.map((opt, i) => i === idx ? { ...opt, [field]: value } : opt));
  };
  const addOption = () => setOptions((opts) => [...opts, { label: '', odds: 1 }]);
  const removeOption = (idx) => setOptions((opts) => opts.filter((_, i) => i !== idx));
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || options.length < 2 || options.some(opt => !opt.label)) {
      setError('Title and at least 2 options with labels are required.');
      return;
    }
    try {
      await questionsAPI.create({ title, description, options });
      setSuccess('Question added!');
      setTitle('');
      setDescription('');
      setOptions([{ label: '', odds: 1 }]);
      setError('');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add question');
    }
  };
  return (
    <div className="max-w-xl mx-auto mt-10 bg-black/80 p-8 rounded-lg border-2 border-gold shadow-lg">
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
          {options.map((opt, idx) => (
            <div key={idx} className="flex gap-2 mb-2 items-center">
              <input type="text" placeholder={`Option ${idx + 1} label`} className="flex-1 p-2 rounded bg-gray-900 border border-gold text-gold" value={opt.label} onChange={e => handleOptionChange(idx, 'label', e.target.value)} required />
              <input type="number" min="1" step="0.01" placeholder="Odds" className="w-24 p-2 rounded bg-gray-900 border border-gold text-gold" value={opt.odds} onChange={e => handleOptionChange(idx, 'odds', e.target.value)} required />
              {options.length > 2 && (
                <button type="button" onClick={() => removeOption(idx)} className="text-red-400 font-bold px-2">✕</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addOption} className="mt-2 px-4 py-1 bg-gold text-black rounded font-bold hover:bg-yellow-400">+ Add Option</button>
        </div>
        {error && <div className="text-red-500 mb-2 font-bold">{error}</div>}
        {success && <div className="text-green-400 mb-2 font-bold">{success}</div>}
        <button type="submit" className="w-full py-2 bg-gold text-black font-extrabold rounded hover:bg-yellow-400 transition">Add Question</button>
      </form>
    </div>
  );
};

export default AddQuestionPage; 