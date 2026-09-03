import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, Play, Plus, Trash2, BookOpen, Sparkles } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import useApp from '../hooks/useApp';
import { INITIAL_MANTRAS, CATEGORIES } from '../data/mantras';

export const Mantras = () => {
  const navigate = useNavigate();
  const {
    favorites,
    toggleFavorite,
    customMantras,
    addCustomMantra,
    deleteCustomMantra,
    setCurrentMantra,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Form State for Custom Mantra
  const [newTitle, setNewTitle] = useState('');
  const [newSanskrit, setNewSanskrit] = useState('');
  const [newTransliteration, setNewTransliteration] = useState('');
  const [newCategory, setNewCategory] = useState('Custom');
  const [newMeaning, setNewMeaning] = useState('');

  // Combine initial built-in mantras with user's custom mantras
  const allMantras = useMemo(() => {
    return [...INITIAL_MANTRAS, ...customMantras];
  }, [customMantras]);

  // Filtered dataset based on search & category filter
  const filteredMantras = useMemo(() => {
    return allMantras.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.sanskrit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.transliteration && m.transliteration.toLowerCase().includes(searchQuery.toLowerCase())) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'All') return true;
      if (selectedCategory === 'Favorites') return favorites.includes(m.id);
      return m.category.toLowerCase() === selectedCategory.toLowerCase();
    });
  }, [allMantras, searchQuery, selectedCategory, favorites]);

  const handleStartJaap = (mantra) => {
    setCurrentMantra(mantra);
    navigate('/jaap');
  };

  const handleCreateCustomMantra = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSanskrit.trim()) return;

    const created = addCustomMantra({
      title: newTitle,
      sanskrit: newSanskrit,
      transliteration: newTransliteration || newTitle,
      category: newCategory,
      meaning: newMeaning,
    });

    setIsAddModalOpen(false);
    setNewTitle('');
    setNewSanskrit('');
    setNewTransliteration('');
    setNewMeaning('');
    setSelectedCategory('Custom');
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteCustomMantra(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <PageHeader
        title="Mantra Library"
        subtitle="Explore sacred Vedic chants, meanings, and peace."
        action={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Create Custom Mantra
          </Button>
        }
      />

      {/* Search Input Box */}
      <div className="relative">
        <label htmlFor="mantra-search" className="sr-only">
          Search mantras
        </label>
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-light-muted dark:text-dark-muted">
          <Search className="w-5 h-5" />
        </div>
        <input
          id="mantra-search"
          type="text"
          placeholder="Search by Sanskrit, title, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-spiritual-500 shadow-soft-sm text-sm"
        />
      </div>

      {/* Horizontal Category Pill Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-spiritual-500 text-white shadow-soft-sm'
                  : 'bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
              }`}
            >
              {cat === 'Favorites' ? `❤️ ${cat}` : cat}
            </button>
          );
        })}
      </div>

      {/* Mantra Cards Grid */}
      {filteredMantras.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMantras.map((mantra) => {
            const isFav = favorites.includes(mantra.id);
            return (
              <Card
                key={mantra.id}
                className="p-5 flex flex-col justify-between space-y-4 border-light-border dark:border-dark-border hover:border-spiritual-400/40 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-spiritual-500/10 text-spiritual-600 dark:text-spiritual-400 uppercase tracking-wider">
                      {mantra.category}
                    </span>

                    <div className="flex items-center gap-1">
                      {mantra.isCustom && (
                        <button
                          onClick={() => setDeleteId(mantra.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                          aria-label="Delete custom mantra"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => toggleFavorite(mantra.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isFav
                            ? 'text-rose-500 bg-rose-500/10'
                            : 'text-light-muted dark:text-dark-muted hover:text-rose-500'
                        }`}
                        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg">{mantra.title}</h3>
                    <p className="mantra-text font-serif text-xl text-spiritual-500 font-semibold mt-1">
                      {mantra.sanskrit}
                    </p>
                    {mantra.transliteration && (
                      <p className="text-xs text-light-muted dark:text-dark-muted italic mt-0.5">
                        {mantra.transliteration}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-light-border dark:border-dark-border">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/mantras/${mantra.id}`)}
                    className="w-1/2 text-xs"
                  >
                    View Details
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Play}
                    onClick={() => handleStartJaap(mantra)}
                    className="w-1/2 text-xs"
                  >
                    Start Jaap
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No mantras found"
          description={
            selectedCategory === 'Favorites'
              ? 'You have not added any mantras to your favorites yet.'
              : 'No matching mantras found for your search query or filter.'
          }
        />
      )}

      {/* Create Custom Mantra Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Custom Mantra"
      >
        <form onSubmit={handleCreateCustomMantra} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-light-muted dark:text-dark-muted mb-1">
              Mantra Title / Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. My Sacred Mantra"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-spiritual-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-light-muted dark:text-dark-muted mb-1">
              Sanskrit / Mantra Text *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ॐ नमः शिवाय"
              value={newSanskrit}
              onChange={(e) => setNewSanskrit(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-spiritual-500 font-serif"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-light-muted dark:text-dark-muted mb-1">
              Transliteration
            </label>
            <input
              type="text"
              placeholder="e.g. Om Namah Shivaya"
              value={newTransliteration}
              onChange={(e) => setNewTransliteration(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-spiritual-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-light-muted dark:text-dark-muted mb-1">
              Meaning / Reflection
            </label>
            <textarea
              rows="2"
              placeholder="Enter brief spiritual meaning..."
              value={newMeaning}
              onChange={(e) => setNewMeaning(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-spiritual-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              fullWidth
              type="button"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" fullWidth type="submit">
              Create Mantra
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Custom Mantra Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Custom Mantra?"
      >
        <div className="space-y-4 pt-1">
          <p className="text-sm text-light-muted dark:text-dark-muted">
            Are you sure you want to delete this custom mantra? This action cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={handleConfirmDelete}>
              Delete Mantra
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Mantras;
