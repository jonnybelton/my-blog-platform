// File: src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { 
  PencilSimple, 
  Trash, 
  Eye,
  DotsThree,
} from '@phosphor-icons/react';

const PostCard = ({ post, onDelete, onEdit }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(post.id);
    setIsDeleting(false);
    setShowConfirmDelete(false);
  };

  return (
    <div className="border-b border-gray-200 py-8 first:pt-0">
      {/* Post Content */}
      <div className="mb-4">
        <Link 
          to={`/post/${post.id}`}
          className="group block"
        >
          <h2 className="text-xl font-normal mb-2 font-mono group-hover:text-[#FF5722] transition-colors">
            {post.title}
          </h2>
          <p className="text-gray-600 line-clamp-2 font-mono text-sm">
            {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
          </p>
        </Link>
      </div>

      {/* Meta Information */}
      <div className="flex justify-between items-center text-sm text-gray-500 font-mono">
        <span>{new Date(post.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</span>
        
        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:text-[#FF5722] transition-colors"
          >
            <DotsThree size={24} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div 
              className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 z-10 font-mono"
              onMouseLeave={() => setShowMenu(false)}
            >
              <Link
                to={`/post/${post.id}`}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#FF5722] transition-colors"
              >
                <Eye className="mr-2" size={16} />
                View Post
              </Link>
              <button
                onClick={() => onEdit(post)}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#FF5722] transition-colors"
              >
                <PencilSimple className="mr-2" size={16} />
                Edit Post
              </button>
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#FF5722] transition-colors"
              >
                <Trash className="mr-2" size={16} />
                Delete Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 max-w-md mx-4 font-mono">
            <h3 className="text-lg font-normal mb-4">Delete Post</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{post.title}"?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-[#FF5722] text-[#FF5722] hover:bg-[#FF5722] hover:text-white transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error.message);
      alert('Failed to delete post. Please try again.');
    }
  };

  const handleEdit = (post) => {
    navigate(`/edit-post/${post.id}`, { state: { post } });
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
          Error loading posts. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 font-mono">
      <div className="flex justify-between items-center mb-12">
        {/* Orange dot */}
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FF5722" }} />
        
        <Link
          to="/new-post"
          className="text-[#FF5722] hover:border-b hover:border-[#FF5722] transition-colors"
        >
          New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="py-12">
          <h3 className="text-lg font-normal mb-2">
            No posts yet
          </h3>
          <p className="text-gray-500 mb-6">
            Get started by creating your first blog post
          </p>
          <Link
            to="/new-post"
            className="text-[#FF5722] hover:border-b hover:border-[#FF5722] transition-colors"
          >
            Create Your First Post
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;