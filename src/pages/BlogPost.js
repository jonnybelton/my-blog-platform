// File: src/pages/BlogPost.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const BlogPost = () => {
  const [post, setPost] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error.message);
    }
  };

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 font-mono">
        Loading...
      </div>
    );
  }

  return (
    <article className="max-w-2xl mx-auto px-4 py-12 font-mono">
      {/* Category Indicator */}
      <div 
        className="w-3 h-3 rounded-full mb-8"
        style={{ backgroundColor: "#FF5722" }}
      />
      
      {/* Title */}
      <h1 className="text-2xl font-normal mb-6 tracking-tight">
        {post.title}
      </h1>
      
      {/* Date */}
      <div className="text-sm text-gray-500 mb-12">
        {new Date(post.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </div>
      
      {/* Content */}
      <div 
        dangerouslySetInnerHTML={{ __html: post.content }}
        className="space-y-6 leading-relaxed"
        style={{
          '& p': {
            marginBottom: '1.5rem',
            lineHeight: '1.8'
          },
          '& h2': {
            fontSize: '1.5rem',
            fontWeight: 'normal',
            marginTop: '2rem',
            marginBottom: '1rem'
          },
          '& a': {
            color: '#FF5722',
            textDecoration: 'none',
            borderBottom: '1px solid transparent',
            transition: 'border-color 0.2s ease'
          },
          '& a:hover': {
            borderBottomColor: '#FF5722'
          }
        }}
      />
    </article>
  );
};

export default BlogPost;