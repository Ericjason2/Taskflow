import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, SlidersHorizontal, Grid3X3, List } from 'lucide-react';
import useProjectStore from '../store/projectStore';
import useAuthStore from '../store/authStore';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectModal from '../components/projects/ProjectModal';
import ConfirmModal from '../components/common/ConfirmModal';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
  const { projects, isLoading, total, totalPages, fetchProjects, createProject, updateProject, deleteProject } = useProjectStore();
  const { user } = useAuthStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('grid');
  const [filters, setFilters] = useState({ search: '', statut: '', priorite: '', page: 1, sort: 'createdAt', order: 'DESC' });
  const [showFilters, setShowFilters] = useState(false);

  const loadProjects = useCallback(() => {
    const params = { ...filters, limit: 12 };
    if (!params.search) delete params.search;
    if (!params.statut) delete params.statut;
    if (!params.priorite) delete params.priorite;
    fetchProjects(params);
  }, [filters]);

  useEffect(() => {
    const debounce = setTimeout(loadProjects, 300);
    return () => clearTimeout(debounce);
  }, [loadProjects]);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await createProject(data);
      toast.success('Projet créé !');
      setModalOpen(false);
      loadProjects();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur');
    } finally { setSaving(false); }
  };

  const handleEdit = async (data) => {
    setSaving(true);
    try {
      await updateProject(editProject.id, data);
      toast.success('Projet modifié');
      setEditProject(null);
      loadProjects();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(deleteTarget.id);
      toast.success('Projet supprimé');
      setDeleteTarget(null);
      loadProjects();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur');
    }
  };

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projets</h1>
          <p className="page-subtitle">{total} projet{total !== 1 ? 's' : ''} au total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Nouveau projet
        </button>
      </div>

      {/* Toolbar */}
      <div className="projects-toolbar">
        <div className="search-wrapper">
          <Search size={15} className="search-icon" />
          <input type="text" className="search-input" placeholder="Rechercher un projet..."
            value={filters.search} onChange={e => setFilter('search', e.target.value)} />
        </div>

        <button className={`btn btn-secondary btn-sm ${showFilters ? 'active-filter' : ''}`} onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal size={14} /> Filtres
        </button>

        <select className="form-select" style={{ width: 'auto', padding: '7px 12px', fontSize: 13 }}
          value={`${filters.sort}-${filters.order}`}
          onChange={e => {
            const [sort, order] = e.target.value.split('-');
            setFilters(f => ({ ...f, sort, order, page: 1 }));
          }}>
          <option value="createdAt-DESC">Plus récents</option>
          <option value="createdAt-ASC">Plus anciens</option>
          <option value="titre-ASC">Titre A→Z</option>
          <option value="titre-DESC">Titre Z→A</option>
        </select>

        <div className="view-toggle">
          <button className={`btn btn-ghost btn-icon btn-sm ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}>
            <Grid3X3 size={16} />
          </button>
          <button className={`btn btn-ghost btn-icon btn-sm ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
            <List size={16} />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filter-bar">
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <label className="form-label" style={{ whiteSpace: 'nowrap', marginBottom: 0 }}>Statut :</label>
            <select className="form-select" style={{ width: 'auto' }} value={filters.statut} onChange={e => setFilter('statut', e.target.value)}>
              <option value="">Tous</option>
              <option value="actif">Actif</option>
              <option value="en_pause">En pause</option>
              <option value="terminé">Terminé</option>
              <option value="annulé">Annulé</option>
            </select>
          </div>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <label className="form-label" style={{ whiteSpace: 'nowrap', marginBottom: 0 }}>Priorité :</label>
            <select className="form-select" style={{ width: 'auto' }} value={filters.priorite} onChange={e => setFilter('priorite', e.target.value)}>
              <option value="">Toutes</option>
              <option value="basse">Basse</option>
              <option value="moyenne">Moyenne</option>
              <option value="haute">Haute</option>
              <option value="critique">Critique</option>
            </select>
          </div>
          {(filters.statut || filters.priorite) && (
            <button className="btn btn-ghost btn-sm" onClick={() => setFilters(f => ({ ...f, statut: '', priorite: '', page: 1 }))}>
              Réinitialiser
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <span className="spinner spinner-lg" />
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
          <h3>Aucun projet trouvé</h3>
          <p>{filters.search || filters.statut || filters.priorite ? 'Modifiez vos filtres' : 'Créez votre premier projet'}</p>
          {!filters.search && !filters.statut && !filters.priorite && (
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setModalOpen(true)}>
              <Plus size={16} /> Créer un projet
            </button>
          )}
        </div>
      ) : (
        <div className={view === 'grid' ? 'projects-grid' : 'projects-list'}>
          {projects.map(p => (
            <ProjectCard key={p.id} project={p} currentUserId={user?.id}
              onEdit={(p) => setEditProject(p)}
              onDelete={(p) => setDeleteTarget(p)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-secondary btn-sm" disabled={filters.page <= 1}
            onClick={() => setFilter('page', filters.page - 1)}>← Précédent</button>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Page {filters.page} / {totalPages}
          </span>
          <button className="btn btn-secondary btn-sm" disabled={filters.page >= totalPages}
            onClick={() => setFilter('page', filters.page + 1)}>Suivant →</button>
        </div>
      )}

      <ProjectModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} isLoading={saving} />
      <ProjectModal open={!!editProject} onClose={() => setEditProject(null)} onSubmit={handleEdit} initialData={editProject} isLoading={saving} />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Supprimer le projet" message={`Supprimer "${deleteTarget?.titre}" et toutes ses tâches ? Cette action est irréversible.`} danger />

      <style>{`
        .projects-toolbar { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
        .filter-bar { display: flex; gap: 16px; align-items: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 20px; flex-wrap: wrap; }
        .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .projects-list { display: flex; flex-direction: column; gap: 12px; }
        .view-toggle { display: flex; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 3px; gap: 2px; }
        .view-toggle .btn.active { background: var(--bg-elevated); color: var(--text-primary); }
        .active-filter { border-color: var(--accent-dim) !important; color: var(--accent) !important; }
        .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 32px; }
        @media (max-width: 600px) { .projects-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
