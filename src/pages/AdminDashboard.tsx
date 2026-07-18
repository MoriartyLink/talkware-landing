import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Plus, Trash2, Edit2, LogOut, LayoutDashboard, Calendar, Trophy, Users as UsersIcon, Upload, Save, X, User, Image, Video, Sparkles, Zap, Gamepad2, Archive, ArchiveRestore, Palette } from "lucide-react";

type Tab = 'events' | 'highlights' | 'contributors';
type ContributorTag = string;

const CONTRIBUTOR_TAGS: { value: ContributorTag; label: string }[] = [
  { value: 'founding_team', label: 'Founding Team' },
  { value: 'co_creator', label: 'Co-Creator' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'website_contributor', label: 'Website Contributor' },
];

const DEFAULT_TAG_COLOR = '#34d399';

const DEFAULT_CONTRIBUTOR_TAGS = CONTRIBUTOR_TAGS.map(tag => ({
  ...tag,
  color: tag.value === 'founding_team'
    ? '#f59e0b'
    : tag.value === 'co_creator'
      ? '#8b5cf6'
      : tag.value === 'website_contributor'
        ? '#38bdf8'
        : DEFAULT_TAG_COLOR,
}));

const CONTRIBUTOR_TAG_LABELS = DEFAULT_CONTRIBUTOR_TAGS.reduce<Record<string, string>>((labels, tag) => {
  labels[tag.value] = tag.label;
  return labels;
}, {});

const slugifyTag = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

const formatContributorTag = (tag: string) =>
  CONTRIBUTOR_TAG_LABELS[tag] || tag.replace(/[_-]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

const cropImageToSquare = async (file: File, size = 900) => {
  const imageUrl = URL.createObjectURL(file);
  const image = new window.Image();
  image.src = imageUrl;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Unable to load image for cropping.'));
  });

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) {
    URL.revokeObjectURL(imageUrl);
    throw new Error('Unable to crop image in this browser.');
  }

  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = (image.naturalWidth - sourceSize) / 2;
  const sourceY = (image.naturalHeight - sourceSize) / 2;
  context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
  URL.revokeObjectURL(imageUrl);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(result => {
      if (result) resolve(result);
      else reject(new Error('Unable to export cropped image.'));
    }, 'image/jpeg', 0.9);
  });

  const fileName = file.name.replace(/\.[^.]+$/, '') || 'contributor';
  return new File([blob], `${fileName}.jpg`, { type: 'image/jpeg' });
};

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>('events');
  
  // Data state
  const [events, setEvents] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [contributors, setContributors] = useState<any[]>([]);
  const [contributorTagOptions, setContributorTagOptions] = useState<any[]>(DEFAULT_CONTRIBUTOR_TAGS);
  
  // Form state
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [uploading, setUploading] = useState(false);
  const [contributorFilter, setContributorFilter] = useState<'all' | ContributorTag>('all');
  const [tagForm, setTagForm] = useState({ value: '', label: '', color: DEFAULT_TAG_COLOR });
  const [editingTag, setEditingTag] = useState<string | null>(null);

  // Event detail management state
  const [eventMedia, setEventMedia] = useState<any[]>([]);
  const [eventSections, setEventSections] = useState<any[]>([]);
  const [newMediaItem, setNewMediaItem] = useState({ media_type: 'photo', url: '', title: '', caption: '' });
  const [newSectionItem, setNewSectionItem] = useState({ section_type: 'highlight', title: '', subtitle: '', description: '', icon: '' });
  const [loadingDetails, setLoadingDetails] = useState(false);
  // showArchived removed - 'archived' column doesn't exist in the database

  const contributorTags = Array.from(new Set([
    ...contributorTagOptions.map(tag => tag.value),
    ...contributors.map(contributor => contributor.tag).filter(Boolean),
  ]));
  const contributorTagMeta = contributorTags.map(tag => {
    const savedTag = contributorTagOptions.find(option => option.value === tag);
    return savedTag || { value: tag, label: formatContributorTag(tag), color: DEFAULT_TAG_COLOR };
  });
  const getContributorTag = (tag: string) =>
    contributorTagOptions.find(option => option.value === tag) || { value: tag, label: formatContributorTag(tag), color: DEFAULT_TAG_COLOR };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData();
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchData() {
    try {
      const [ev, hi, contributorsRes] = await Promise.all([
        supabase.from('events').select('*').order('created_at', { ascending: false }),
        supabase.from('highlights').select('*').order('num', { ascending: false }),
        supabase.from('contributors').select('*').order('points', { ascending: false }).order('created_at', { ascending: true })
      ]);
      const tagsRes = await supabase.from('contributor_tags').select('*').order('label', { ascending: true });

      setEvents(ev.data || []);
      setHighlights(hi.data || []);
      setContributors(contributorsRes.data || []);
      if (tagsRes.data && tagsRes.data.length > 0) {
        setContributorTagOptions(tagsRes.data);
      }

      // Log any individual query errors
      [ev, hi, contributorsRes, tagsRes].forEach((result, index) => {
        if (result.error) {
          console.error(`Error fetching data from query ${index}:`, result.error);
        }
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load data. Please check the browser console for details.');
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  const handleLogout = () => supabase.auth.signOut();

  const getTableName = (tab: Tab) => tab;

  const handleDelete = async (table: string, id: string) => {
    if (!confirm('Are you sure?')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) alert(error.message);
    else fetchData();
  };

  const handleArchive = async (eventId: string, archived: boolean) => {
    const { error } = await supabase.from('events').update({ archived: !archived }).eq('id', eventId);
    if (error) alert(error.message);
    else fetchData();
  };

  const handleToggleContributor = async (id: string, current: boolean) => {
    const { error } = await supabase.from('contributors').update({ active: !current }).eq('id', id);
    if (error) alert(error.message);
    else fetchData();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    let table = getTableName(activeTab);

    // Clean up formData before saving
    const dataToSave = { ...formData };
    delete dataToSave.id;
    delete dataToSave.created_at;

    if (activeTab === 'contributors') {
      dataToSave.active = dataToSave.active ?? true;
      dataToSave.tag = slugifyTag(dataToSave.tag || 'volunteer');
      dataToSave.joined_at = dataToSave.joined_at || new Date().toISOString().slice(0, 10);
      dataToSave.points = Number(dataToSave.points || 0);
    }

    const { error } = isEditing && isEditing !== 'new'
      ? await supabase.from(table).update(dataToSave).eq('id', isEditing)
      : await supabase.from(table).insert([dataToSave]);
    
    if (error) {
      console.error('Error saving:', error);
      alert(error.message);
    } else {
      setIsEditing(null);
      setFormData({});
      setEventMedia([]);
      setEventSections([]);
      fetchData();
    }
  };

  const resetTagForm = () => {
    setEditingTag(null);
    setTagForm({ value: '', label: '', color: DEFAULT_TAG_COLOR });
  };

  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = slugifyTag(tagForm.value);
    if (!value) {
      alert('Tag value is required.');
      return;
    }

    const payload = {
      value,
      label: tagForm.label.trim() || formatContributorTag(value),
      color: tagForm.color || DEFAULT_TAG_COLOR,
    };

    const { error } = editingTag
      ? await supabase.from('contributor_tags').update(payload).eq('value', editingTag)
      : await supabase.from('contributor_tags').insert([payload]);

    if (error) {
      alert(error.message);
    } else {
      resetTagForm();
      fetchData();
    }
  };

  const handleDeleteTag = async (value: string) => {
    if (!confirm('Delete this tag? Existing contributors with this tag will keep the tag text.')) return;
    const { error } = await supabase.from('contributor_tags').delete().eq('value', value);
    if (error) alert(error.message);
    else fetchData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, folder: string) => {
    let file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      if (folder === 'contributors') {
        file = await cropImageToSquare(file);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) {
        alert(uploadError.message);
      } else {
        const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
        setFormData({ ...formData, image_url: data.publicUrl });
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to prepare image for upload.');
    } finally {
      setUploading(false);
    }
  };

  // Event detail management functions
  async function fetchEventDetails(eventId: string) {
    setLoadingDetails(true);
    const [mediaRes, sectionsRes] = await Promise.all([
      supabase.from('event_media').select('*').eq('event_id', eventId).order('sort_order', { ascending: true }),
      supabase.from('event_sections').select('*').eq('event_id', eventId).order('sort_order', { ascending: true }),
    ]);
    if (mediaRes.data) setEventMedia(mediaRes.data);
    if (sectionsRes.data) setEventSections(sectionsRes.data);
    setLoadingDetails(false);
  }

  async function addMedia(eventId: string) {
    if (!newMediaItem.url.trim()) return;
    const { error } = await supabase.from('event_media').insert([{
      event_id: eventId,
      media_type: newMediaItem.media_type,
      url: newMediaItem.url,
      title: newMediaItem.title || null,
      caption: newMediaItem.caption || null,
      sort_order: eventMedia.length + 1,
    }]);
    if (error) { alert(error.message); } else {
      setNewMediaItem({ media_type: 'photo', url: '', title: '', caption: '' });
      fetchEventDetails(eventId);
    }
  }

  async function deleteMedia(mediaId: string, eventId: string) {
    if (!confirm('Delete this media item?')) return;
    const { error } = await supabase.from('event_media').delete().eq('id', mediaId);
    if (error) { alert(error.message); } else { fetchEventDetails(eventId); }
  }

  async function addSection(eventId: string) {
    if (!newSectionItem.title.trim()) return;
    const { error } = await supabase.from('event_sections').insert([{
      event_id: eventId,
      section_type: newSectionItem.section_type,
      title: newSectionItem.title,
      subtitle: newSectionItem.subtitle || null,
      description: newSectionItem.description || null,
      icon: newSectionItem.icon || null,
      sort_order: eventSections.length + 1,
    }]);
    if (error) { alert(error.message); } else {
      setNewSectionItem({ section_type: 'highlight', title: '', subtitle: '', description: '', icon: '' });
      fetchEventDetails(eventId);
    }
  }

  async function deleteSection(sectionId: string, eventId: string) {
    if (!confirm('Delete this section item?')) return;
    const { error } = await supabase.from('event_sections').delete().eq('id', sectionId);
    if (error) { alert(error.message); } else { fetchEventDetails(eventId); }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>;

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-6">
        <div className="w-full max-w-md glass p-8 rounded-3xl border border-white/10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-white mb-2">Admin Login</h1>
            <p className="text-white/40 text-sm">Manage Talkware Community Hub</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                placeholder="admin@talkware.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all">
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-2">
          <img src="/logo.png" className="w-8 h-8" alt="Logo" />
          <span className="font-display font-bold tracking-tighter uppercase">Admin Hub</span>
        </div>
        
        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => { setActiveTab('events'); setIsEditing(null); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'events' ? 'bg-white text-black' : 'hover:bg-white/5 text-white/60'}`}
          >
            <Calendar className="w-5 h-5" /> Events
          </button>
          <button 
            onClick={() => { setActiveTab('highlights'); setIsEditing(null); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'highlights' ? 'bg-white text-black' : 'hover:bg-white/5 text-white/60'}`}
          >
            <Trophy className="w-5 h-5" /> Past Events
          </button>
          <button 
            onClick={() => { setActiveTab('contributors'); setIsEditing(null); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'contributors' ? 'bg-white text-black' : 'hover:bg-white/5 text-white/60'}`}
          >
            <UsersIcon className="w-5 h-5" /> Contributors
          </button>
        </nav>

        <div className="mt-auto">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 w-full transition-all">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-display font-bold capitalize">{activeTab.replace('_', ' ')}</h2>
            <p className="text-white/40 text-sm">Manage your website content dynamically.</p>
          </div>
          {!isEditing && (
            <button 
              onClick={() => {
                setIsEditing('new');
                setFormData(activeTab === 'contributors' ? {
                  tag: 'volunteer',
                  active: true,
                  points: 0,
                  joined_at: new Date().toISOString().slice(0, 10),
                } : {});
                setEventMedia([]);
                setEventSections([]);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all"
            >
              <Plus className="w-5 h-5" /> Add New
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="max-w-2xl glass p-8 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">{isEditing === 'new' ? 'Create' : 'Edit'} {activeTab}</h3>
              <button onClick={() => { setIsEditing(null); setFormData({}); setEventMedia([]); setEventSections([]); }} className="p-2 hover:bg-white/10 rounded-full transition-all"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-6">
              {activeTab === 'events' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Title</label>
                    <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Date/Time</label>
                      <input type="text" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" placeholder="May 23, 2026 • 1:00 PM" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Type</label>
                      <select value={formData.type || 'Meetup'} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30">
                        <option value="Meetup">Meetup</option>
                        <option value="Training">Training</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Location</label>
                    <input type="text" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" placeholder="e.g., Shadow Cafe, 107 64" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Speaker (Optional)</label>
                    <input type="text" value={formData.speaker || ''} onChange={e => setFormData({...formData, speaker: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Registration Link</label>
                    <input type="url" value={formData.link || ''} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Description</label>
                    <textarea rows={4} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" />
                  </div>

                  {/* Event Media Management */}
                  {isEditing && isEditing !== 'new' && (
                    <div className="pt-6 border-t border-white/10 space-y-8">
                      <h4 className="text-lg font-bold flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5 text-white/60" /> Event Details
                      </h4>

                      <div>
                        <h5 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Image className="w-4 h-4" /> Media (Photos &amp; Videos)
                        </h5>
                        {loadingDetails ? (
                          <p className="text-white/40 text-sm">Loading...</p>
                        ) : eventMedia.length > 0 ? (
                          <div className="grid gap-2 mb-4">
                            {eventMedia.map((m) => (
                              <div key={m.id} className="flex items-center justify-between bg-white/[0.03] rounded-xl px-4 py-2 border border-white/5">
                                <div className="flex items-center gap-3 min-w-0">
                                  {m.media_type === 'photo' ? <Image className="w-4 h-4 text-blue-400 flex-shrink-0" /> : <Video className="w-4 h-4 text-purple-400 flex-shrink-0" />}
                                  <span className="text-xs text-white/60 truncate">{m.url}</span>
                                  {m.title && <span className="text-xs text-white/40 hidden sm:inline truncate">— {m.title}</span>}
                                </div>
                                <button onClick={() => deleteMedia(m.id, isEditing)} className="p-1 hover:bg-red-400/20 rounded-lg text-white/40 hover:text-red-400 flex-shrink-0 ml-2"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-white/30 text-sm mb-4">No media added yet.</p>
                        )}
                        <div className="flex flex-wrap items-end gap-3">
                          <div className="flex-1 min-w-[120px]">
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Type</label>
                            <select value={newMediaItem.media_type} onChange={e => setNewMediaItem({...newMediaItem, media_type: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-white/30">
                              <option value="photo">Photo</option>
                              <option value="video">Video</option>
                            </select>
                          </div>
                          <div className="flex-[2] min-w-[180px]">
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">URL</label>
                            <input type="url" value={newMediaItem.url} onChange={e => setNewMediaItem({...newMediaItem, url: e.target.value})}
                              placeholder="https://example.com/photo.jpg"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-white/30" />
                          </div>
                          <div className="flex-1 min-w-[100px]">
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Title</label>
                            <input type="text" value={newMediaItem.title} onChange={e => setNewMediaItem({...newMediaItem, title: e.target.value})}
                              placeholder="Optional"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-white/30" />
                          </div>
                          <button type="button" onClick={() => addMedia(isEditing)}
                            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Add
                          </button>
                        </div>
                      </div>

                      {/* Event Sections Management */}
                      <div>
                        <h5 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> Sections (Past Events, Activities, Games, Wins)
                        </h5>
                        {loadingDetails ? (
                          <p className="text-white/40 text-sm">Loading...</p>
                        ) : eventSections.length > 0 ? (
                          <div className="grid gap-2 mb-4">
                            {eventSections.map((s) => (
                              <div key={s.id} className="flex items-center justify-between bg-white/[0.03] rounded-xl px-4 py-2 border border-white/5">
                                <div className="flex items-center gap-3 min-w-0">
                                  {s.section_type === 'highlight' ? <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                                    : s.section_type === 'activity' ? <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                    : s.section_type === 'game' ? <Gamepad2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                    : <Trophy className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                                  <span className="text-xs text-white/60 truncate">{s.title}</span>
                                  {s.subtitle && <span className="text-xs text-white/40 hidden sm:inline truncate">— {s.subtitle}</span>}
                                </div>
                                <button onClick={() => deleteSection(s.id, isEditing)} className="p-1 hover:bg-red-400/20 rounded-lg text-white/40 hover:text-red-400 flex-shrink-0 ml-2"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-white/30 text-sm mb-4">No sections added yet.</p>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                          <div>
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Type</label>
                            <select value={newSectionItem.section_type} onChange={e => setNewSectionItem({...newSectionItem, section_type: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-white/30">
                              <option value="highlight">Highlight</option>
                              <option value="activity">Activity</option>
                              <option value="game">Game</option>
                              <option value="win">Win</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Title</label>
                            <input type="text" value={newSectionItem.title} onChange={e => setNewSectionItem({...newSectionItem, title: e.target.value})}
                              placeholder="Section title" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-white/30" />
                          </div>
                          <button type="button" onClick={() => addSection(isEditing)}
                            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all flex items-center gap-1 justify-center">
                            <Plus className="w-3 h-3" /> Add
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                          <div>
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Subtitle (Optional)</label>
                            <input type="text" value={newSectionItem.subtitle} onChange={e => setNewSectionItem({...newSectionItem, subtitle: e.target.value})}
                              placeholder="Subtitle" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-white/30" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Description (Optional)</label>
                            <input type="text" value={newSectionItem.description} onChange={e => setNewSectionItem({...newSectionItem, description: e.target.value})}
                              placeholder="Description" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-white/30" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Icon (Optional)</label>
                            <input type="text" value={newSectionItem.icon} onChange={e => setNewSectionItem({...newSectionItem, icon: e.target.value})}
                              placeholder="e.g., star, zap, trophy" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-white/30" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Linked Past Events in Event Editor */}
              {isEditing && isEditing !== 'new' && (
                <div className="pt-6 border-t border-white/10">
                  <h4 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <Trophy className="w-5 h-5 text-white/60" /> Linked Past Events
                  </h4>
                  {highlights.filter(h => h.event_id === isEditing).length > 0 ? (
                    <div className="grid gap-2">
                      {highlights.filter(h => h.event_id === isEditing).map(hl => (
                        <div key={hl.id} className="flex items-center justify-between bg-white/[0.03] rounded-xl px-4 py-3 border border-white/5">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-sm font-bold text-white/40">{hl.num}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate">{hl.title}</p>
                              <p className="text-xs text-white/40">{hl.date} • {hl.place}</p>
                            </div>
                          </div>
                          <button onClick={() => { setActiveTab('highlights'); setIsEditing(hl.id); setFormData(hl); }} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white flex-shrink-0"><Edit2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/30 text-sm">No highlights linked to this event yet.</p>
                  )}
                </div>
              )}

              {activeTab === 'highlights' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Number (e.g., 01)</label>
                      <input type="text" value={formData.num || ''} onChange={e => setFormData({...formData, num: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Title</label>
                      <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Date</label>
                      <input type="text" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Time</label>
                      <input type="text" value={formData.time || ''} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Place</label>
                      <input type="text" value={formData.place || ''} onChange={e => setFormData({...formData, place: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Associated Event (Optional)</label>
                    <select value={formData.event_id || ''} onChange={e => setFormData({...formData, event_id: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30">
                      <option value="">-- Select Event --</option>
                      {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Highlight Text</label>
                    <textarea rows={3} value={formData.highlight || ''} onChange={e => setFormData({...formData, highlight: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Image</label>
                    <div className="flex items-center gap-4">
                      {formData.image_url && (
                        <img src={formData.image_url} alt="Preview" className="w-24 aspect-video rounded-xl object-cover border-2 border-white/10" />
                      )}
                      <label className="flex-1 cursor-pointer">
                        <div className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-all text-white/40">
                          <Upload className="w-5 h-5" />
                          {uploading ? 'Uploading...' : 'Click to Upload'}
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'highlights')} />
                      </label>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'contributors' && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Name</label>
                      <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Role</label>
                      <input type="text" value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" required />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Tag</label>
                      <input
                        type="text"
                        list="contributor-tags"
                        value={formData.tag || ''}
                        onChange={e => setFormData({...formData, tag: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30"
                        placeholder="volunteer"
                        required
                      />
                      <datalist id="contributor-tags">
                        {contributorTagMeta.map(tag => (
                          <option key={tag.value} value={tag.value}>{tag.label}</option>
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Joined Date</label>
                      <input type="date" value={formData.joined_at || ''} onChange={e => setFormData({...formData, joined_at: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Contribution Points</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.points ?? 0}
                      onChange={e => setFormData({...formData, points: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-2 uppercase">GitHub URL</label>
                      <input
                        type="url"
                        value={formData.github_url || ''}
                        onChange={e => setFormData({...formData, github_url: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30"
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-2 uppercase">LinkedIn URL</label>
                      <input
                        type="url"
                        value={formData.linkedin_url || ''}
                        onChange={e => setFormData({...formData, linkedin_url: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30"
                        placeholder="https://www.linkedin.com/in/username"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Profile Image</label>
                    <div className="flex items-center gap-4">
                      {formData.image_url && (
                        <img src={formData.image_url} alt="Preview" className="w-20 aspect-square rounded-xl object-cover object-center border-2 border-white/10" />
                      )}
                      <label className="flex-1 cursor-pointer">
                        <div className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-all text-white/40">
                          <Upload className="w-5 h-5" />
                          {uploading ? 'Uploading...' : 'Click to Upload'}
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'contributors')} />
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      id="contributor-active" 
                      type="checkbox" 
                      checked={formData.active ?? true} 
                      onChange={e => setFormData({...formData, active: e.target.checked})}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-white focus:ring-white/30"
                    />
                    <label htmlFor="contributor-active" className="text-sm text-white/60">Active</label>
                  </div>
                </>
              )}

              <button type="submit" className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-all">
                <Save className="w-5 h-5" /> Save Changes
              </button>
            </form>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeTab === 'events' && events.length === 0 && (
              <p className="text-white/40 text-sm py-8 text-center">No events found. Add one to get started.</p>
            )}
            {activeTab === 'events' && events.map(ev => (
              <div key={ev.id} className={`glass p-6 rounded-2xl flex items-center justify-between border transition-all group ${ev.archived ? 'border-white/5 opacity-60' : 'border-white/5 hover:border-white/20'}`}>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-bold uppercase tracking-widest">{ev.type}</span>
                    <h4 className="font-bold text-lg">{ev.title}</h4>
                    {ev.archived && <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-bold uppercase tracking-widest text-white/40">Archived</span>}
                  </div>
                  <p className="text-white/40 text-sm">{ev.date}{ev.location ? ` • ${ev.location}` : ''}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => { setIsEditing(ev.id); setFormData(ev); fetchEventDetails(ev.id); }} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={() => handleArchive(ev.id, ev.archived)} className={`p-2 hover:bg-white/10 rounded-lg ${ev.archived ? 'text-emerald-400 hover:text-emerald-300' : 'text-white/60 hover:text-white'}`} title={ev.archived ? 'Unarchive' : 'Archive'}>
                    {ev.archived ? <ArchiveRestore className="w-5 h-5" /> : <Archive className="w-5 h-5" />}
                  </button>
                  <button onClick={() => handleDelete('events', ev.id)} className="p-2 hover:bg-red-400/20 rounded-lg text-white/60 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))}

            {activeTab === 'highlights' && highlights.length === 0 && (
              <p className="text-white/40 text-sm py-8 text-center">No highlights found. Add one to get started.</p>
            )}
            {activeTab === 'highlights' && highlights.map(hi => (
              <div key={hi.id} className="glass p-6 rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/20 transition-all group">
                <div className="flex items-center gap-6">
                  <span className="text-2xl font-display font-black text-white/10">{hi.num}</span>
                  {hi.image_url && <img src={hi.image_url} className="w-16 aspect-video rounded-lg object-cover" alt="" />}
                  <div>
                    <h4 className="font-bold text-lg mb-1">{hi.title}</h4>
                    <p className="text-white/40 text-xs">{hi.date} • {hi.place}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => { setIsEditing(hi.id); setFormData(hi); }} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={() => handleDelete('highlights', hi.id)} className="p-2 hover:bg-red-400/20 rounded-lg text-white/60 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))}

            {activeTab === 'contributors' && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                  <p className="text-white/40 text-sm">{contributors.length} contributors sorted by contribution points.</p>
                  <select
                    value={contributorFilter}
                    onChange={(e) => setContributorFilter(e.target.value as 'all' | ContributorTag)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-white/30"
                  >
                    <option value="all">All tags</option>
                    {contributorTagMeta.map(tag => (
                      <option key={tag.value} value={tag.value}>{tag.label}</option>
                    ))}
                  </select>
                </div>

                <div className="glass rounded-2xl border border-white/5 p-4 mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-4 h-4 text-white/50" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Tags</h3>
                  </div>
                  <form onSubmit={handleSaveTag} className="grid gap-3 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end mb-4">
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Value</label>
                      <input
                        type="text"
                        value={tagForm.value}
                        onChange={e => setTagForm({...tagForm, value: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                        placeholder="community_lead"
                        disabled={!!editingTag}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Label</label>
                      <input
                        type="text"
                        value={tagForm.label}
                        onChange={e => setTagForm({...tagForm, label: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                        placeholder="Community Lead"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Color</label>
                      <input
                        type="color"
                        value={tagForm.color}
                        onChange={e => setTagForm({...tagForm, color: e.target.value})}
                        className="h-10 w-full lg:w-16 cursor-pointer rounded-xl border border-white/10 bg-white/5 p-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 lg:flex-none px-4 py-2 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/90">
                        {editingTag ? 'Update' : 'Add'}
                      </button>
                      {editingTag && (
                        <button type="button" onClick={resetTagForm} className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/15">
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                  <div className="flex flex-wrap gap-2">
                    {contributorTagMeta.map(tag => (
                      <div key={tag.value} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: tag.color || DEFAULT_TAG_COLOR }} />
                        <span className="text-xs font-bold uppercase tracking-widest text-white/70">{tag.label}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTag(tag.value);
                            setTagForm({ value: tag.value, label: tag.label, color: tag.color || DEFAULT_TAG_COLOR });
                          }}
                          className="p-1 text-white/40 hover:text-white"
                          aria-label={`Edit ${tag.label}`}
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTag(tag.value)}
                          className="p-1 text-white/40 hover:text-red-400"
                          aria-label={`Delete ${tag.label}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {contributors.filter(c => contributorFilter === 'all' || c.tag === contributorFilter).length === 0 && (
                  <p className="text-white/40 text-sm py-8 text-center">No contributors found. Add one to get started.</p>
                )}

                {contributors
                  .filter(c => contributorFilter === 'all' || c.tag === contributorFilter)
                  .map(contributor => (
                    <div
                      key={contributor.id}
                      onClick={() => handleToggleContributor(contributor.id, contributor.active)}
                      className={`glass p-4 rounded-2xl flex items-center justify-between border transition-all group cursor-pointer ${contributor.active ? 'border-white/5 hover:border-white/20' : 'border-white/5 opacity-60'}`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {contributor.image_url ? (
                          <img src={contributor.image_url} className="w-12 h-12 rounded-xl object-cover object-center flex-shrink-0" alt="" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white/40 flex-shrink-0"><User className="w-5 h-5" /></div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold truncate">{contributor.name}</h4>
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${contributor.active ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'}`} />
                          </div>
                          <p className="text-white/40 text-xs uppercase tracking-widest truncate">{contributor.role}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                            <span>{getContributorTag(contributor.tag).label}</span>
                            <span>Joined {contributor.joined_at || 'Unknown'}</span>
                            <span>{contributor.points ?? 0} pts</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { setIsEditing(contributor.id); setFormData(contributor); }} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"><Edit2 className="w-5 h-5" /></button>
                        <button onClick={() => handleDelete('contributors', contributor.id)} className="p-2 hover:bg-red-400/20 rounded-lg text-white/60 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
