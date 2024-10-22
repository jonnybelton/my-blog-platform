// File: src/pages/EditPost.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import RichTextEditor from '../components/RichTextEditor';

const EditPost = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      // If we have the post data from navigation state, use it
      if (location.state?.post) {
        const { title, content } = location.state.post;
        setTitle(title);
        setContent(content);
        setLoading(false);
        return;
      }

      // Otherwise fetch it
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('Post not found or access denied');
      }

      setTitle(data.title);
      setContent(data.content);
    } catch (error) {
      console.error('Error fetching post:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating post:', error.message);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 font-mono">
        Loading...
      </div>
    );
  }

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
            disabled={saving}
            className="px-4 py-2 border border-[#FF5722] text-[#FF5722] hover:bg-[#FF5722] hover:text-white transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;