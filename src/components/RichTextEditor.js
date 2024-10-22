// File: src/components/RichTextEditor.js

import React, { useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { 
  TextBolder,
  TextItalic,
  TextH,
  ListBullets,
  ListNumbers,
  Quotes,
  ImageSquare,
  Spinner,
} from '@phosphor-icons/react';
import { supabase } from '../supabaseClient';

// Helper Components
const DragOverlay = () => (
  <div className="absolute inset-0 bg-blue-500 bg-opacity-10 border-2 border-blue-500 border-dashed rounded-lg flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg px-4 py-2 text-blue-500 font-medium">
      Drop image here
    </div>
  </div>
);

const UploadProgress = ({ progress }) => (
  <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50">
    <div className="text-sm font-medium mb-2">Uploading image...</div>
    <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className="h-full bg-blue-500 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
    <div className="text-xs text-gray-500 mt-1 text-right">
      {progress}%
    </div>
  </div>
);

const MenuButton = ({ onClick, active, icon: Icon, title, disabled }) => (
  <button
    onMouseDown={(e) => {
      e.preventDefault();
      onClick(e);
    }}
    type="button"
    className={`p-1.5 rounded-md transition-all duration-100 ${
      active 
        ? 'bg-gray-900 text-white shadow-sm' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    title={title}
    disabled={disabled}
  >
    <Icon 
      size={18} 
      weight={active ? "fill" : "regular"}
    />
  </button>
);

const ImageUploader = ({ editor }) => {
  const inputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB');
      }

      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      
      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          onProgress: ({ loaded, total }) => {
            const progress = (loaded / total) * 100;
            setUploadProgress(Math.round(progress));
          },
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(fileName);

      editor
        .chain()
        .focus()
        .setImage({ 
          src: publicUrl,
          alt: file.name,
          title: file.name,
        })
        .run();

    } catch (error) {
      console.error('Upload error:', error);
      alert(error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
      e.target.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={isUploading}
      />
      <MenuButton
        onClick={() => inputRef.current?.click()}
        active={false}
        icon={isUploading ? Spinner : ImageSquare}
        title="Upload Image"
        disabled={isUploading}
      />
      {isUploading && uploadProgress > 0 && (
        <UploadProgress progress={uploadProgress} />
      )}
    </>
  );
};

const EditorToolbar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5 p-1 bg-white rounded-lg shadow-lg border border-gray-200">
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        icon={TextBolder}
        title="Bold (⌘+B)"
      />
      
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        icon={TextItalic}
        title="Italic (⌘+I)"
      />

      <div className="w-px h-4 bg-gray-200 mx-1" />

      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        icon={TextH}
        title="Heading 2"
      />

      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        icon={TextH}
        title="Heading 3"
      />

      <div className="w-px h-4 bg-gray-200 mx-1" />

      <MenuButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        icon={ListBullets}
        title="Bullet List"
      />

      <MenuButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        icon={ListNumbers}
        title="Numbered List"
      />

      <MenuButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        icon={Quotes}
        title="Quote"
      />

      <div className="w-px h-4 bg-gray-200 mx-1" />
      
      <ImageUploader editor={editor} />
    </div>
  );
};

const RichTextEditor = ({ content, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-gray max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
  });

  const handleUpload = useCallback(async (file) => {
    if (!editor) return;

    try {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, GIF, etc.)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      
      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(fileName);

      editor.chain().focus().setImage({ 
        src: publicUrl,
        alt: file.name,
        title: file.name,
      }).run();

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    }
  }, [editor]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (!editor) return;

    const files = Array.from(e.dataTransfer.files);
    files.forEach(handleUpload);
  }, [editor, handleUpload]);

  const handlePaste = useCallback((e) => {
    if (!editor) return;

    const items = Array.from(e.clipboardData?.items || []);
    items.forEach(item => {
      if (item.type.indexOf('image') > -1) {
        const file = item.getAsFile();
        if (file) handleUpload(file);
      }
    });
  }, [editor, handleUpload]);

  return (
    <div 
      className="relative bg-white rounded-lg border border-gray-200"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragging && <DragOverlay />}
      
      {editor && (
        <BubbleMenu 
          className="z-50" 
          tippyOptions={{ 
            duration: 100,
            placement: 'top',
            offset: [0, 10],
          }} 
          editor={editor}
          shouldShow={({ from, to }) => {
            const hasSelection = from !== to;
            return hasSelection && editor.isEditable && !isDragging;
          }}
        >
          <EditorToolbar editor={editor} />
        </BubbleMenu>
      )}
      
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;