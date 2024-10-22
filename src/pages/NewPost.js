// File: src/pages/NewPost.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import RichTextEditor from '../components/RichTextEditor';

const NewPost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user) throw new Error('Please log in to create a post');

      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            title,
            content,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;
      navigate(`/post/${data.id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 font-mono">
        <p className="text-[#FF5722]">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 font-mono">
      <div className="flex justify-between items-center mb-12">
        {/* Orange dot */}
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FF5722" }} />
        
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="text-[#FF5722] hover:border-b hover:border-[#FF5722] transition-colors"
        >
          Cancel
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            required
            className="w-full border-none text-xl font-mono focus:outline-none focus:ring-0 p-0 bg-transparent placeholder-gray-400"
          />
        </div>

        <div>
          <RichTextEditor 
            content={content} 
            onChange={setContent}
            className="font-mono prose-headings:font-normal prose-p:font-mono"
          />
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-[#FF5722] text-[#FF5722] hover:bg-[#FF5722] hover:text-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewPost;