"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { saveNoteAction } from "@/lib/actions";

type NoteEditorProps = {
  initialContent: string;
};

export function NoteEditor({ initialContent }: NoteEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(async (text: string) => {
    setStatus("saving");
    const formData = new FormData();
    formData.set("content", text);
    const result = await saveNoteAction(null, formData);
    if (result?.success) {
      setStatus("saved");
    }
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      setContent(text);
      setStatus("unsaved");

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => save(text), 1000);
    },
    [save],
  );

  // Save on Ctrl+S
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        save(content);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [content, save]);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50/50">
        <span className="text-xs text-gray-400">
          {status === "saving" && "Saving..."}
          {status === "saved" && "Saved"}
          {status === "unsaved" && "Unsaved changes"}
        </span>
        <span className="text-xs text-gray-400">Auto-saves after 1s</span>
      </div>
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Paste or type anything here..."
        className="w-full min-h-[calc(100vh-240px)] px-6 py-4 text-sm text-gray-700 leading-relaxed resize-none focus:outline-none"
      />
    </div>
  );
}
