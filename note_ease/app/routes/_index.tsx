import React, { useState, useRef } from "react";

// PUBLIC_INTERFACE
/**
 * Main container for the NoteEase app.
 * Features:
 *  - Create, edit, delete, search, and categorize notes.
 *  - Light UI with primary/accent colors.
 */
export default function NoteEase() {
  // State for all notes.
  const [notes, setNotes] = useState(() => {
    // Load from localStorage if available for persistence during session
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("noteease-notes");
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return [];
  });

  // State for search/filter
  const [search, setSearch] = useState("");
  // Categories the user can assign
  const defaultCategories = [
    { label: "Work", color: "#4A90E2" },
    { label: "Personal", color: "#F5A623" },
    { label: "Ideas", color: "#7ED957" },
    { label: "Urgent", color: "#E24A4A" },
  ];

  // Modal/dialog state for creating/editing a note
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null); // null means "new", else integer index
  const [modalNote, setModalNote] = useState({ title: "", content: "", categories: [] });

  // Floating add button click handler
  const openNewModal = () => {
    setEditIndex(null);
    setModalNote({ title: "", content: "", categories: [] });
    setModalOpen(true);
  };

  // Select a note to view/edit
  const openEditModal = (idx) => {
    setEditIndex(idx);
    setModalNote({ ...notes[idx] });
    setModalOpen(true);
  };

  // Delete note handler
  const handleDelete = (idx) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      const updated = notes.filter((_, i) => i !== idx);
      setNotes(updated);
      localStorage.setItem("noteease-notes", JSON.stringify(updated));
    }
  };

  // Handle search input
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // Filtered note list
  const lowerSearch = search.toLowerCase();
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(lowerSearch) ||
      note.content.toLowerCase().includes(lowerSearch) ||
      (note.categories &&
        note.categories.some((cat) => cat.label.toLowerCase().includes(lowerSearch)))
  );

  // Modal: Save note
  const saveModalNote = () => {
    if (!modalNote.title.trim()) {
      alert("Title is required");
      return;
    }
    const newNotes = [...notes];
    if (editIndex === null) {
      // New note
      newNotes.unshift({
        ...modalNote,
        createdAt: new Date().toISOString(),
        id: Date.now(),
      });
    } else {
      // Edit
      newNotes[editIndex] = {
        ...modalNote,
        modifiedAt: new Date().toISOString(),
        id: notes[editIndex].id,
      };
    }
    setNotes(newNotes);
    localStorage.setItem("noteease-notes", JSON.stringify(newNotes));
    setModalOpen(false);
    setModalNote({ title: "", content: "", categories: [] });
    setEditIndex(null);
  };

  // Modal: change title/content/category
  const handleModalChange = (field, value) => {
    setModalNote({ ...modalNote, [field]: value });
  };

  // Modal: category toggle
  const handleCategoryToggle = (cat) => {
    let cats = modalNote.categories || [];
    if (cats.some((c) => c.label === cat.label)) {
      cats = cats.filter((c) => c.label !== cat.label);
    } else {
      cats = [...cats, cat];
    }
    setModalNote({ ...modalNote, categories: cats });
  };

  // Helper: get snippet from note content
  function snippet(text) {
    if (!text) return "";
    return text.length > 60 ? text.slice(0, 60) + "…" : text;
  }

  // Persist notes changes to localStorage (for every state update)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("noteease-notes", JSON.stringify(notes));
    }
  }, [notes]);

  // Modal focus management
  const titleRef = useRef(null);
  React.useEffect(() => {
    if (modalOpen && titleRef.current) titleRef.current.focus();
  }, [modalOpen]);

  /** Render Main Layout **/
  return (
    <main className="relative min-h-screen bg-[#FFFFFF] pb-24">
      {/* Header & Search Bar */}
      <div className="sticky top-0 z-10 flex flex-col gap-2 bg-white shadow-md p-4">
        <h1 className="text-2xl font-bold text-[#4A90E2] mb-2" style={{ letterSpacing: 1 }}>
          NoteEase
        </h1>
        <input
          type="text"
          className="w-full rounded-lg border border-gray-200 px-4 py-2 text-base shadow-inner focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
          style={{ background: "#FAFAFA" }}
          placeholder="Search notes…"
          value={search}
          onChange={handleSearch}
          aria-label="Search notes"
        />
      </div>

      {/* Notes List */}
      <div className="mx-auto mt-6 w-full max-w-2xl px-3 grid gap-4">
        {filteredNotes.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">No notes found.</div>
        ) : (
          filteredNotes.map((note, i) => (
            <div
              key={note.id || i}
              className="group rounded-xl border border-gray-200 bg-white transition hover:shadow-lg cursor-pointer relative"
              onClick={() => openEditModal(notes.indexOf(note))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") openEditModal(notes.indexOf(note));
              }}
              aria-label={`Open note: ${note.title}`}
            >
              {/* Delete icon (appears only on hover) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(notes.indexOf(note));
                }}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition opacity-100 bg-white text-gray-400 hover:text-red-500 p-1 rounded-full border border-gray-100"
                aria-label="Delete"
                tabIndex={-1}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="18"
                  width="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E24A4A"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="font-semibold text-lg text-gray-700 truncate">{note.title}</h2>
                  {/* Category tags */}
                  <div className="flex gap-1 flex-wrap">
                    {(note.categories || []).map((cat) => (
                      <span
                        key={cat.label}
                        className="text-xs px-2 rounded-lg font-medium"
                        style={{
                          background: cat.color,
                          color: "#fff",
                          filter: "brightness(0.97)",
                        }}
                      >
                        {cat.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-gray-500 text-sm">{snippet(note.content)}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <button
        className="fixed z-20 bottom-12 right-8 md:bottom-12 md:right-16 bg-[#4A90E2] hover:bg-[#357ABD] text-white rounded-full p-4 shadow-lg shadow-blue-100 transition-all flex items-center justify-center"
        aria-label="Add new note"
        style={{
          boxShadow: "0 4px 28px #4A90E210",
          fontSize: 26,
        }}
        onClick={openNewModal}
      >
        +
      </button>

      {/* Modal for create/edit note */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-lg w-[95%] mx-2 shadow-2xl p-6 relative animate-fadeIn">
            {/* Close button */}
            <button
              className="absolute top-2 right-3 text-gray-300 hover:text-gray-500 text-3xl"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="font-semibold text-xl mb-4 text-[#4A90E2]">
              {editIndex === null ? "New Note" : "Edit Note"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveModalNote();
              }}
            >
              <input
                ref={titleRef}
                type="text"
                className="w-full mb-3 rounded-lg border border-gray-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
                placeholder="Title…"
                value={modalNote.title}
                onChange={(e) => handleModalChange("title", e.target.value)}
                autoFocus
                aria-label="Note title"
                required
                style={{ fontWeight: 500, background: "#FAFAFA" }}
              />
              <textarea
                className="w-full mb-3 rounded-lg border border-gray-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
                placeholder="Your note…"
                value={modalNote.content}
                rows={6}
                onChange={(e) => handleModalChange("content", e.target.value)}
                aria-label="Note content"
                style={{ background: "#FAFAFA", fontFamily: "inherit" }}
              />
              <div className="mb-5">
                <span className="block text-xs text-gray-400 mb-2">Categories</span>
                <div className="flex flex-wrap gap-2">
                  {defaultCategories.map((cat) => (
                    <button
                      type="button"
                      key={cat.label}
                      className={`text-xs font-medium px-3 py-1 rounded-lg border border-gray-100 cursor-pointer focus:outline-none ${
                        (modalNote.categories || []).some((c) => c.label === cat.label)
                          ? ""
                          : "opacity-60"
                      }`}
                      style={{
                        background: cat.color,
                        color: "#fff",
                        filter:
                          (modalNote.categories || []).some((c) => c.label === cat.label)
                            ? "brightness(1.1)"
                            : "brightness(0.93)",
                        borderColor:
                          (modalNote.categories || []).some((c) => c.label === cat.label)
                            ? "#2222"
                            : "#ddd8",
                      }}
                      tabIndex={0}
                      aria-pressed={
                        (modalNote.categories || []).some((c) => c.label === cat.label)
                          ? "true"
                          : "false"
                      }
                      onClick={() => handleCategoryToggle(cat)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end mt-2 gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#4A90E2] hover:bg-[#357ABD] text-white font-medium shadow transition"
                  style={{
                    boxShadow: "0 2px 8px #4A90E210",
                    background: "#4A90E2",
                  }}
                >
                  {editIndex === null ? "Create" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal animation styles */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: .2; transform: translateY(32px) scale(.98);}
            to   { opacity: 1; transform: none;}
          }
          .animate-fadeIn {
            animation: fadeIn .22s cubic-bezier(.11,.84,.56,1.1);
          }
        `}
      </style>
    </main>
  );
}
