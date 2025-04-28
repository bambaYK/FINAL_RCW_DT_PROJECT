import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { BookOpen, FileText, Eye, ChevronRight } from 'lucide-react';
import {
  Squares2X2Icon as ViewGridIcon,
  ListBulletIcon as ViewListIcon,
  MagnifyingGlassIcon as SearchIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import Navbar from '../Navbar';
import Footer from '../Footer';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function DashboardHeader({ totalItems, viewMode, setViewMode }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center">
      <div>
        <h1 className="text-3xl font-serif text-gray-900">Bibliothèque Numérique</h1>
        <p className="mt-2 text-gray-600">
          {totalItems} ressources disponibles
        </p>
      </div>

      <div className="mt-4 sm:mt-0 flex items-center space-x-4">
        <div className="bg-white rounded-lg shadow p-1 flex">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <ViewGridIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <ViewListIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ResourcesFilters({ filters, setFilters, setPagination }) {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        <div>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les types</option>
            <option value="book">Livres</option>
            <option value="document">Documents</option>
          </select>
        </div>

        <div>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toutes les catégories</option>
            <option value="Roman classique">Roman classique</option>
            <option value="Science-fiction">Science-fiction</option>
            <option value="Fantastique">Fantastique</option>
            <option value="Policier">Policier</option>
            <option value="Sciences">Sciences</option>
            <option value="Technique">Technique</option>
          </select>
        </div>

        <div>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="title_asc">Titre (A-Z)</option>
            <option value="title_desc">Titre (Z-A)</option>
            <option value="date_desc">Plus récent</option>
            <option value="date_asc">Plus ancien</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function ResourcesStats({ resources }) {
  const stats = {
    total: resources.length,
    books: resources.filter(r => r.type === 'book').length,
    documents: resources.filter(r => r.type === 'document').length,
    categories: {}
  };

  resources.forEach(resource => {
    if (resource.categorie) {
      const mainCategory = resource.categorie.split(' - ')[0];
      stats.categories[mainCategory] = (stats.categories[mainCategory] || 0) + 1;
    }
  });

  const chartData = {
    labels: Object.keys(stats.categories),
    datasets: [
      {
        label: 'Nombre de ressources',
        data: Object.values(stats.categories),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Répartition par catégorie'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Total</h3>
        <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        <p className="text-sm text-gray-500 mt-2">ressources disponibles</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Livres</h3>
        <p className="text-3xl font-bold text-green-600">{stats.books}</p>
        <p className="text-sm text-gray-500 mt-2">dans la bibliothèque</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
        <p className="text-3xl font-bold text-purple-600">{stats.documents}</p>
        <p className="text-sm text-gray-500 mt-2">disponibles</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Catégories</h3>
        <p className="text-3xl font-bold text-orange-600">
          {Object.keys(stats.categories).length}
        </p>
        <p className="text-sm text-gray-500 mt-2">différentes</p>
      </div>

      <div className="md:col-span-4 bg-white rounded-xl shadow-md p-6">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

function ResourcesGrid({ resources, loading, pagination, setPagination }) {
  const navigate = useNavigate();

  const handleBorrow = (resource) => {
    navigate(`/borrow/${resource.id}`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {resources.map((resource, index) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl transition-shadow duration-300"
          >
            <div className="relative">
              <div className="aspect-w-3 aspect-h-2">
                <img
                  src={
                    resource.type === 'book'
                      ? `https://picsum.photos/seed/${resource.id}/400/300`
                      : `https://picsum.photos/seed/${resource.id + 'doc'}/400/300`
                  }
                  alt={resource.titre}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-4 right-4">
                {resource.type === 'book' ? (
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Livre
                  </span>
                ) : (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Document
                  </span>
                )}
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {resource.titre}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {resource.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  {resource.type === 'book' ? (
                    <BookOpen className="w-4 h-4 mr-2" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  <span>{resource.auteur}</span>
                </div>
                <button
                  onClick={() => handleBorrow(resource)}
                  className="text-blue-500 hover:text-blue-700 transition-colors flex items-center space-x-1"
                >
                  <Eye className="w-5 h-5" />
                  <span className="text-sm">Voir</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <button
            onClick={() =>
              setPagination(prev => ({ ...prev, page: prev.page - 1 }))
            }
            disabled={pagination.page === 1}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
            Page {pagination.page} sur {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPagination(prev => ({ ...prev, page: prev.page + 1 }))
            }
            disabled={pagination.page === pagination.totalPages}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            Suivant
          </button>
        </nav>
      </div>
    </>
  );
}

function ResourcesList({ resources, loading, pagination, setPagination }) {
  const navigate = useNavigate();

  const handleBorrow = (resource) => {
    navigate(`/borrow/${resource.id}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="border-b border-gray-200 p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {resources.map((resource, index) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="p-6 flex items-center">
              <div className="flex-shrink-0">
                <img
                  src={
                    resource.type === 'book'
                      ? `https://picsum.photos/seed/${resource.id}/200/200`
                      : `https://picsum.photos/seed/${resource.id + 'doc'}/200/200`
                  }
                  alt={resource.titre}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              </div>

              <div className="ml-6 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {resource.titre}
                  </h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleBorrow(resource)}
                      className="text-blue-500 hover:text-blue-700 transition-colors flex items-center space-x-1"
                    >
                      <Eye className="w-5 h-5" />
                      <span className="text-sm">Voir</span>
                    </button>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="mt-2 flex items-center space-x-6">
                  <div className="flex items-center text-sm text-gray-500">
                    {resource.type === 'book' ? (
                      <BookOpen className="w-4 h-4 mr-2" />
                    ) : (
                      <FileText className="w-4 h-4 mr-2" />
                    )}
                    <span>{resource.auteur}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {resource.type === 'book' ? (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Livre
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Document
                      </span>
                    )}
                  </div>
                  {resource.categorie && (
                    <div className="text-sm text-gray-500">
                      {resource.categorie}
                    </div>
                  )}
                </div>

                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {resource.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <button
            onClick={() =>
              setPagination(prev => ({ ...prev, page: prev.page - 1 }))
            }
            disabled={pagination.page === 1}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
            Page {pagination.page} sur {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPagination(prev => ({ ...prev, page: prev.page + 1 }))
            }
            disabled={pagination.page === pagination.totalPages}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            Suivant
          </button>
        </nav>
      </div>
    </>
  );
}

function Dashboard() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    type: 'all',
    search: '',
    category: 'all',
    sort: 'title_asc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0
  });

  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/library/', {
        params: {
          page: pagination.page,
          type: filters.type !== 'all' ? filters.type : undefined,
          search: filters.search || undefined,
          category: filters.category !== 'all' ? filters.category : undefined,
          ordering: filters.sort
        }
      });

      setResources(response.data.results);
      setPagination(prev => ({
        ...prev,
        totalPages: Math.ceil(response.data.count / 20),
        totalItems: response.data.count
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des ressources:', error);
      toast.error('Erreur lors du chargement des ressources');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000')"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-black/80" />
        </div>

        <div className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20"
            >
              <DashboardHeader 
                totalItems={pagination.totalItems}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />

              <div className="mt-8">
                <ResourcesFilters 
                  filters={filters}
                  setFilters={setFilters}
                  setPagination={setPagination}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8"
              >
                {viewMode === 'grid' ? (
                  <ResourcesGrid 
                    resources={resources}
                    loading={loading}
                    pagination={pagination}
                    setPagination={setPagination}
                  />
                ) : (
                  <ResourcesList 
                    resources={resources}
                    loading={loading}
                    pagination={pagination}
                    setPagination={setPagination}
                  />
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
}

export default Dashboard;
