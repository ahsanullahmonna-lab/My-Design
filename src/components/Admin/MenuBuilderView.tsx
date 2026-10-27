import React, { useState } from 'react';
import { 
  Navigation, 
  Plus, 
  GripVertical, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2, 
  FolderTree, 
  CornerDownRight, 
  Save, 
  Link as LinkIcon, 
  Check, 
  Layers,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { CategoryItem } from '../../types/news';

interface MenuBuilderViewProps {
  categories: CategoryItem[];
  darkMode: boolean;
  onAddCategory: (category: CategoryItem) => void;
  onUpdateCategory?: (category: CategoryItem) => void;
  onDeleteCategory: (id: string) => void;
  onReorderCategories?: (categories: CategoryItem[]) => void;
  showSuccessMessage: (msg: string) => void;
}

export const MenuBuilderView: React.FC<MenuBuilderViewProps> = ({
  categories,
  darkMode,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
  showSuccessMessage,
}) => {
  // Navigation filter tabs
  const [activeTab, setActiveTab] = useState<'all' | 'header' | 'footer' | 'submenus'>('header');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null);
  const [sourceMode, setSourceMode] = useState<'existing_category' | 'custom'>('existing_category');
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [slug, setSlug] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [showInHeader, setShowInHeader] = useState(true);
  const [showInFooter, setShowInFooter] = useState(true);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Filtered categories according to tab
  const filteredCategories = categories.filter((c) => {
    if (activeTab === 'header') return c.showInHeader !== false;
    if (activeTab === 'footer') return c.showInFooter !== false;
    if (activeTab === 'submenus') return !!c.parentId;
    return true;
  });

  // Top level categories for parent dropdowns
  const topLevelCategories = categories.filter((c) => !c.parentId);

  // Open Modal for New Menu or Sub-menu
  const handleOpenAddModal = (parentCategory?: CategoryItem) => {
    setEditingItem(null);
    setSourceMode('existing_category');
    setSelectedCatId('');
    setNameBn('');
    setNameEn('');
    setSlug('');
    setCustomUrl('');
    setParentId(parentCategory ? parentCategory.id : '');
    setShowInHeader(true);
    setShowInFooter(true);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (item: CategoryItem) => {
    setEditingItem(item);
    setSourceMode(item.customUrl ? 'custom' : 'existing_category');
    setSelectedCatId(item.id);
    setNameBn(item.nameBn);
    setNameEn(item.nameEn || '');
    setSlug(item.slug || '');
    setCustomUrl(item.customUrl || '');
    setParentId(item.parentId || '');
    setShowInHeader(item.showInHeader !== false);
    setShowInFooter(item.showInFooter !== false);
    setIsModalOpen(true);
  };

  // When admin selects an existing category from the dropdown
  const handleSelectExistingCategory = (catId: string) => {
    setSelectedCatId(catId);
    if (!catId) return;
    const found = categories.find((c) => c.id === catId);
    if (found) {
      setNameBn(found.nameBn);
      setNameEn(found.nameEn || '');
      setSlug(found.slug || '');
      if (found.parentId) {
        setParentId(found.parentId);
      }
      setShowInHeader(found.showInHeader !== false);
      setShowInFooter(found.showInFooter !== false);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetFilteredIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const draggedItem = filteredCategories[draggedIndex];
    const targetItem = filteredCategories[targetFilteredIndex];

    if (!draggedItem || !targetItem || draggedItem.id === targetItem.id) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Find actual indices in global categories list
    const actualFromIndex = categories.findIndex((c) => c.id === draggedItem.id);
    const actualToIndex = categories.findIndex((c) => c.id === targetItem.id);

    if (actualFromIndex !== -1 && actualToIndex !== -1 && onReorderCategories) {
      const reordered = [...categories];
      const [moved] = reordered.splice(actualFromIndex, 1);
      reordered.splice(actualToIndex, 0, moved);
      onReorderCategories(reordered);
      showSuccessMessage(`'${moved.nameBn}' মেনুর ক্রম ড্র্যাগ করে #${targetFilteredIndex + 1} অবস্থানে স্থানান্তর করা হয়েছে!`);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Serial reorder (Step up / down)
  const handleMoveStep = (item: CategoryItem, direction: 'up' | 'down') => {
    if (!onReorderCategories) return;
    const currentIndex = categories.findIndex((c) => c.id === item.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const reordered = [...categories];
    const temp = reordered[currentIndex];
    reordered[currentIndex] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    onReorderCategories(reordered);
    showSuccessMessage(`'${temp.nameBn}' মেনুটি ${direction === 'up' ? 'উপরে' : 'নিচে'} স্থানান্তর করা হয়েছে!`);
  };

  // Quick Parent Reassignment
  const handleAssignParent = (item: CategoryItem, newParentId: string | null) => {
    if (!onUpdateCategory) return;
    const updated = { ...item, parentId: newParentId };
    onUpdateCategory(updated);
    const parentName = newParentId ? categories.find((c) => c.id === newParentId)?.nameBn : 'মূল প্রধান মেনু';
    showSuccessMessage(`'${item.nameBn}' মেনুটি '${parentName}' এর অধীনে নির্ধারণ করা হয়েছে!`);
  };

  // Toggle Header visibility
  const handleToggleHeader = (item: CategoryItem) => {
    if (!onUpdateCategory) return;
    const updated = { ...item, showInHeader: item.showInHeader === false ? true : false };
    onUpdateCategory(updated);
    showSuccessMessage(`'${item.nameBn}' হেডার প্রদর্শন ${updated.showInHeader ? 'সক্রিয়' : 'বন্ধ'} করা হয়েছে!`);
  };

  // Toggle Footer visibility
  const handleToggleFooter = (item: CategoryItem) => {
    if (!onUpdateCategory) return;
    const updated = { ...item, showInFooter: item.showInFooter === false ? true : false };
    onUpdateCategory(updated);
    showSuccessMessage(`'${item.nameBn}' ফুটার প্রদর্শন ${updated.showInFooter ? 'সক্রিয়' : 'বন্ধ'} করা হয়েছে!`);
  };

  // Form Submit Save Handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn.trim()) {
      showSuccessMessage('সতর্কতা: মেনুর বাংলা নাম দিন');
      return;
    }

    const itemSlug = slug.trim() || nameEn.trim().toLowerCase().replace(/\s+/g, '-') || `menu-${Date.now()}`;
    const assignedParent = parentId.trim() ? parentId.trim() : null;

    if (editingItem) {
      const updated: CategoryItem = {
        ...editingItem,
        nameBn: nameBn.trim(),
        nameEn: nameEn.trim() || nameBn.trim(),
        slug: itemSlug,
        parentId: assignedParent,
        showInHeader,
        showInFooter,
        customUrl: sourceMode === 'custom' ? customUrl.trim() : undefined,
      };
      if (onUpdateCategory) {
        onUpdateCategory(updated);
      }
      showSuccessMessage(`'${updated.nameBn}' মেনু আইটেম সফলভাবে আপডেট হয়েছে!`);
    } else {
      // Check if attached to existing category
      const existing = selectedCatId ? categories.find((c) => c.id === selectedCatId) : null;
      if (existing) {
        const updated: CategoryItem = {
          ...existing,
          nameBn: nameBn.trim(),
          nameEn: nameEn.trim() || existing.nameEn,
          slug: itemSlug,
          parentId: assignedParent,
          showInHeader,
          showInFooter,
          customUrl: sourceMode === 'custom' ? customUrl.trim() : undefined,
        };
        if (onUpdateCategory) {
          onUpdateCategory(updated);
        }
        showSuccessMessage(`বিদ্যমান ক্যাটাগরি '${updated.nameBn}' মেনু কনফিগারেশনে আপডেট হয়েছে!`);
      } else {
        const newItem: CategoryItem = {
          id: `cat-${Date.now()}`,
          nameBn: nameBn.trim(),
          nameEn: nameEn.trim() || nameBn.trim(),
          slug: itemSlug,
          parentId: assignedParent,
          showOnHomepage: true,
          showInHeader,
          showInFooter,
          customUrl: sourceMode === 'custom' ? customUrl.trim() : undefined,
          count: 4,
          order: categories.length + 1,
        };
        onAddCategory(newItem);
        showSuccessMessage(`নতুন মেনু '${newItem.nameBn}' সফলভাবে যুক্ত হয়েছে!`);
      }
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 font-solaiman text-slate-900 dark:text-white">
      {/* Header section with Stats & CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emerald-600" />
            <span>ক্যাটাগরি-চালিত মেন্যু ও সাব-মেন্যু বিল্ডার (Category-Driven Menu Builder)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            সাইটের বিদ্যমান ক্যাটাগরি থেকে সহজে ড্রপডাউন সাব-মেনু তৈরি করুন, ড্র্যাগ-অ্যান্ড-ড্রপ ও সিরিয়াল কন্ট্রোলারের মাধ্যমে রিয়েল-টাইমে নেভিগেশন বার সাজান।
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন মেনু / সাব-মেনু তৈরি করুন</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'header', label: 'হেডার প্রধান মেনু', count: categories.filter((c) => c.showInHeader !== false).length },
          { id: 'submenus', label: 'ড্রপডাউন সাব-মেনুসমূহ', count: categories.filter((c) => !!c.parentId).length },
          { id: 'footer', label: 'ফুটার মেনু', count: categories.filter((c) => c.showInFooter !== false).length },
          { id: 'all', label: 'সকল মেনু আইটেম', count: categories.length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === tab.id
                ? 'border-emerald-600 text-emerald-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Live Navigation Mock Preview */}
      <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>হেডার নেভিগেশন লাইভ প্রিভিউ (লাইভ ড্রপডাউন সহ):</span>
          </span>
          <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            রিয়েল-টাইমে আপডেট হচ্ছে
          </span>
        </div>
        <div className="p-3 bg-white dark:bg-[#151c24] rounded-lg border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 overflow-x-auto">
          {categories
            .filter((c) => c.showInHeader !== false && !c.parentId)
            .map((item, idx) => {
              const subItems = categories.filter((sub) => sub.parentId === item.id && sub.showInHeader !== false);
              return (
                <div key={item.id} className="relative group">
                  <span className="px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 rounded text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs hover:border-emerald-500 transition-colors">
                    <span className="text-slate-400 font-mono text-[10px]">#{idx + 1}</span>
                    <span>{item.nameBn}</span>
                    {subItems.length > 0 && (
                      <span className="flex items-center gap-0.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1 py-0.2 rounded text-[10px]">
                        <ChevronDown className="w-3 h-3" />
                        <span>{subItems.length}</span>
                      </span>
                    )}
                  </span>

                  {/* Hover dropdown preview */}
                  {subItems.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 min-w-[140px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-lg p-1.5 z-40 hidden group-hover:block">
                      <div className="text-[10px] text-slate-400 font-bold border-b pb-1 mb-1">
                        উপ-বিভাগ ({subItems.length})
                      </div>
                      {subItems.map((s) => (
                        <div key={s.id} className="text-[11px] py-1 px-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1">
                          <span className="text-emerald-500 font-bold text-[9px]">↳</span>
                          <span>{s.nameBn}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Interactive Drag & Drop Reorderable Table */}
      <div className={`rounded-xl border overflow-hidden shadow-xs ${darkMode ? 'bg-[#1b222c] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-700 dark:text-slate-300">
              ড্র্যাগ-অ্যান্ড-ড্রপ নির্দেশিকা: যেকোনো সারির বাম পাশের আইকন ধরে উপরে বা নিচে টেনে এনে সহজে সিরিয়াল সাজান
            </span>
          </div>
          <span className="text-[11px] font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
            মোট {filteredCategories.length}টি আইটেম
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 uppercase text-[11px] font-bold border-b">
              <tr>
                <th className="p-3 w-28 text-center">ড্র্যাগ ও ক্রম (#)</th>
                <th className="p-3">মেনুর নাম ও সাব-মেনু স্তর</th>
                <th className="p-3">অভিভাবক / মূল মেন্যু সম্পর্ক</th>
                <th className="p-3">লিঙ্ক / স্লাগ</th>
                <th className="p-3 text-center">হেডারে প্রদর্শন</th>
                <th className="p-3 text-center">ফুটারে প্রদর্শন</th>
                <th className="p-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    কোনো মেনু আইটেম পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredCategories.map((item, idx) => {
                  const isSubMenu = !!item.parentId;
                  const parentCat = isSubMenu ? categories.find((c) => c.id === item.parentId) : null;
                  const isBeingDragged = draggedIndex === idx;
                  const isDropTarget = dragOverIndex === idx;

                  return (
                    <tr
                      key={item.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={() => {
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      className={`transition-all duration-150 ${
                        isBeingDragged ? 'opacity-30 bg-emerald-50 dark:bg-emerald-950/40' : ''
                      } ${
                        isDropTarget ? 'border-t-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30' : ''
                      } hover:bg-slate-50/80 dark:hover:bg-slate-800/40`}
                    >
                      {/* Drag Handle & Serial Controls */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div
                            className="p-1 rounded cursor-grab active:cursor-grabbing hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-emerald-600"
                            title="ড্র্যাগ করে ক্রমানুসারে সাজান"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <span className="font-mono font-bold text-slate-500 text-xs">
                            #{idx + 1}
                          </span>
                          <div className="flex flex-col ml-0.5">
                            <button
                              type="button"
                              onClick={() => handleMoveStep(item, 'up')}
                              disabled={idx === 0}
                              className="text-slate-400 hover:text-emerald-600 disabled:opacity-20 cursor-pointer"
                              title="এক ধাপ উপরে নিন"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveStep(item, 'down')}
                              disabled={idx === filteredCategories.length - 1}
                              className="text-slate-400 hover:text-emerald-600 disabled:opacity-20 cursor-pointer"
                              title="এক ধাপ নিচে নিন"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Menu Title & Hierarchy Info */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {isSubMenu ? (
                            <span className="text-blue-500 font-bold ml-2">↳</span>
                          ) : (
                            <FolderTree className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {item.nameBn}
                              </span>
                              {isSubMenu ? (
                                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                                  সাব-মেন্যু
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                                  প্রধান মেনু
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {item.nameEn || item.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Parent Assignment Dropdown */}
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <select
                            value={item.parentId || ''}
                            onChange={(e) => handleAssignParent(item, e.target.value ? e.target.value : null)}
                            className={`px-2 py-1 rounded text-xs border font-semibold cursor-pointer ${
                              isSubMenu
                                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <option value="">— প্রধান মেনু (Top-Level) —</option>
                            {topLevelCategories
                              .filter((c) => c.id !== item.id)
                              .map((topCat) => (
                                <option key={topCat.id} value={topCat.id}>
                                  ↳ অধীন: {topCat.nameBn}
                                </option>
                              ))}
                          </select>
                          {!isSubMenu && (
                            <button
                              type="button"
                              onClick={() => handleOpenAddModal(item)}
                              className="px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                              title="এই মেনুর অধীনে সরাসরি নতুন সাব-মেন্যু যোগ করুন"
                            >
                              <Plus className="w-3 h-3" />
                              <span>+ সাব-মেন্যু</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Slug / Link */}
                      <td className="p-3 font-mono text-slate-500 text-xs">
                        {item.customUrl ? item.customUrl : `/${item.slug}`}
                      </td>

                      {/* Show in Header */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleHeader(item)}
                          className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                            item.showInHeader !== false
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                          }`}
                        >
                          {item.showInHeader !== false ? 'সক্রিয় (On)' : 'বন্ধ (Off)'}
                        </button>
                      </td>

                      {/* Show in Footer */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFooter(item)}
                          className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                            item.showInFooter !== false
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                          }`}
                        >
                          {item.showInFooter !== false ? 'সক্রিয় (On)' : 'বন্ধ (Off)'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded cursor-pointer"
                            title="সম্পাদনা করুন"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`'${item.nameBn}' মেনুটি স্থায়ীভাবে মুছে ফেলতে চান?`)) {
                                onDeleteCategory(item.id);
                                showSuccessMessage('মেনু আইটেম মুছে ফেলা হয়েছে!');
                              }
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct Quick Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 font-solaiman text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-600" />
                <span>{editingItem ? 'মেনু / সাব-মেনু সম্পাদনা' : 'ক্যাটাগরি থেকে নতুন মেনু / সাব-মেনু তৈরি'}</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingItem(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Source Mode Toggle */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setSourceMode('existing_category')}
                className={`py-2 px-3 rounded-md font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  sourceMode === 'existing_category'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <FolderTree className="w-3.5 h-3.5" />
                <span>বিদ্যমান ক্যাটাগরি (Category-Driven)</span>
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('custom')}
                className={`py-2 px-3 rounded-md font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  sourceMode === 'custom'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>কাস্টম পেজ বা URL</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Category selector */}
              {sourceMode === 'existing_category' && (
                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg space-y-2">
                  <label className="block font-bold text-emerald-900 dark:text-emerald-200">
                    সাইটের বিদ্যমান ক্যাটাগরি নির্বাচন করুন *
                  </label>
                  <select
                    value={selectedCatId}
                    onChange={(e) => handleSelectExistingCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                  >
                    <option value="">-- ড্রপডাউন থেকে ক্যাটাগরি বেছে নিন --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameBn} ({c.nameEn || c.slug}) {c.parentId ? `[সাব-মেনু: ${categories.find(p => p.id === c.parentId)?.nameBn || c.parentId}]` : '[প্রধান ক্যাটাগরি]'}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    ক্যাটাগরি বাছাই করলে নাম ও লিংক স্বয়ংক্রিয়ভাবে পূরণ হবে।
                  </p>
                </div>
              )}

              {/* Title Bangla & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">মেনুর নাম (বাংলায়) *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: জাতীয়, রাজনীতি, খেলাধুলা"
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">English Name / Slug *</label>
                  <input
                    type="text"
                    placeholder="e.g. national, politics, sports"
                    value={nameEn}
                    onChange={(e) => {
                      setNameEn(e.target.value);
                      if (!editingItem && sourceMode === 'custom') {
                        setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                      }
                    }}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                  />
                </div>
              </div>

              {/* Parent-Child Hierarchy Selector */}
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2">
                <label className="block font-bold text-blue-950 dark:text-blue-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CornerDownRight className="w-4 h-4 text-blue-600" />
                    <span>অভিভাবক মেনু / সাব-মেনু সম্পর্ক (Dropdown Hierarchy)</span>
                  </span>
                  {parentId && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-600 text-white font-bold">
                      সাব-মেন্যু নির্ধারিত
                    </span>
                  )}
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                >
                  <option value="">— প্রধান মূল মেনু হিসেবে থাকবে (Top-Level Main Menu) —</option>
                  {topLevelCategories
                    .filter((c) => {
                      if (editingItem && c.id === editingItem.id) return false;
                      return true;
                    })
                    .map((topCat) => (
                      <option key={topCat.id} value={topCat.id}>
                        ↳ [সাব-মেন্যু তৈরি] অভিভাবক মেনু: {topCat.nameBn} ({topCat.nameEn || topCat.slug})
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-blue-700 dark:text-blue-300">
                  {parentId ? (
                    <span>
                      এই মেনুটি হেডারে <strong>{categories.find((c) => c.id === parentId)?.nameBn || 'নির্বাচিত মেনু'}</strong>-এর ড্রপডাউন তালিকায় প্রদর্শিত হবে।
                    </span>
                  ) : (
                    <span>
                      এটি হেডারের প্রধান সারিতে সরাসরি দৃশ্যমান প্রধান মেনু হিসেবে থাকবে।
                    </span>
                  )}
                </p>
              </div>

              {sourceMode === 'custom' && (
                <div>
                  <label className="block font-bold mb-1">কাস্টম লিঙ্ক / ইউআরএল (Custom URL)</label>
                  <input
                    type="text"
                    placeholder="যেমন: /epaper বা https://example.com"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                  />
                </div>
              )}

              {/* Display settings */}
              <div className="pt-2 border-t space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={showInHeader}
                    onChange={(e) => setShowInHeader(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>হেডার নেভিগেশন বারে প্রদর্শন করুন (Show in Header)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={showInFooter}
                    onChange={(e) => setShowInFooter(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span>ফুটার মেনু তালিকায় প্রদর্শন করুন (Show in Footer)</span>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 rounded border border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingItem ? 'আপডেট সংরক্ষণ করুন' : 'মেনু তৈরি করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
