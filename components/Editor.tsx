'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';

import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';

import { $getRoot, EditorState } from 'lexical';
import { useRef, useEffect } from 'react';
import { LexicalEditor } from 'lexical';
import { io, Socket } from 'socket.io-client';

type EditorProps = {
  documentId: string;
};

export default function Editor({ documentId }: EditorProps) {
  const editorRef = useRef<LexicalEditor | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Setup socket connection
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  // Listen for incoming updates
  useEffect(() => {
    if (!socketRef.current || !editorRef.current) return;

    const socket = socketRef.current;
    const editor = editorRef.current;

    socket.on('document-update', (data: { documentId: string; state: string }) => {
      if (data.documentId === documentId) {
        editor.update(() => {
          const editorState = editor.parseEditorState(data.state);
          editor.setEditorState(editorState);
        });
      }
    });

    return () => {
      socket.off('document-update');
    };
  }, [documentId]);

  // Send local updates
  const handleChange = (editorState: EditorState) => {
    const socket = socketRef.current;
    const editor = editorRef.current;
    if (!socket || !editor) return;

    const serialized = JSON.stringify(editorState);

    socket.emit('document-update', {
      documentId,
      state: serialized,
    });
  };

  const initialConfig = {
    namespace: 'CollabEditor',
    editorState: '',
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="border border-gray-300 p-4 rounded-md min-h-[400px]">
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="min-h-[300px] outline-none focus:ring-0" />
          }
          placeholder={<div className="text-gray-400">Start typing...</div>}
          ErrorBoundary={({ error }) => <p className="text-red-500">{error.message}</p>}
        />
        <HistoryPlugin />
        <MarkdownShortcutPlugin />
        <OnChangePlugin onChange={handleChange} />
        <EditorRefPlugin editorRef={editorRef} />
      </div>
    </LexicalComposer>
  );
}
