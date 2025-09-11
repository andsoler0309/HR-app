'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Document, DocumentCategory } from '@/types/document';
import { 
  Grid2X2, 
  List, 
  Search, 
  Upload, 
  Plus,
  FolderOpen,
  FileText,
  FileEdit
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import DocumentUploadModal from '@/components/documents/DocumentUploadModal';
import DocumentCategoryModal from '@/components/documents/DocumentCategoryModal';
import DocumentList from '@/components/documents/DocumentList';
import DocumentGrid from '@/components/documents/DocumentGrid';
import DocumentViewer from '@/components/documents/DocumentViewer';
import DocumentShareModal from '@/components/documents/DocumentShareModal';
import { Employee } from '@/types/employee';
import DocumentTemplates from '@/components/documents/DocumentTemplates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignaturePad from '@/components/documents/SignaturePad';
import DeleteConfirmationModal from '@/components/documents/DeleteConfirmationModal';
import EmptyState from '@/components/documents/EmptyState';
import TourGuide from '@/components/shared/TourGuide';
import HelpWidget from '@/components/shared/HelpWidget';
import { useHelp } from '@/context/HelpContext';
import { createDocumentsTour } from '@/lib/tour-configs/documents-tour';
import { useTranslations } from 'next-intl';

export default function DocumentsPage() {
  const t = useTranslations('documents');
  const tTours = useTranslations('tours');
  const { tourIsVisible, helpIsVisible, setTourVisible, setHelpVisible } = useHelp();

  // State management
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeFilter, setEmployeeFilter] = useState('all');

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedDocumentForSign, setSelectedDocumentForSign] = useState<Document | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchDocuments();
    fetchCategories();
    fetchEmployees();
  }, []);

  // Fetch documents
  async function fetchDocuments() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          category:category_id(*),
          employee:employee_id(id, first_name, last_name)
        `)
        .neq('status', 'deleted')
        .eq('company_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  }

  // Fetch categories
  async function fetchCategories() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
  
      const { data, error } = await supabase
        .from('document_categories')
        .select('*')
        .eq('company_id', user.id)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  // Fetch employees
  async function fetchEmployees() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
  
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', user.id)
        .order('first_name');

      if (error) throw error;
      setEmployees(data as Employee[]);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }

  // Handle document actions
  const handleDocumentClick = (document: Document) => {
    setSelectedDocument(document);
  };

  const handleDownload = (document: Document) => {
    window.open(document.file_url, '_blank');
  };

  const handleShare = (document: Document) => {
    setSelectedDocument(document);
    setIsShareModalOpen(true);
  };

  const handleDelete = (document: Document) => {
    setDocumentToDelete(document);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('documents')
        .update({ status: 'deleted' })
        .eq('id', documentToDelete.id);

      if (error) throw error;
      
      fetchDocuments();
      setIsDeleteModalOpen(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDocumentToDelete(null);
  };

  // Handle opening upload modal or category modal if no categories
  const handleUploadClick = () => {
    if (categories.length === 0) {
      setIsCategoryModalOpen(true);
    } else {
      setIsUploadModalOpen(true);
    }
  };
  
  const handleSignRequest = async (document: Document) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      // Check if document requires signature and user hasn't signed yet
      if (document.requires_signature) {
        const signedBy = document.signed_by || [];
        const hasUserSigned = signedBy.includes(user.id);
        
        if (!hasUserSigned) {
          // Open document viewer in signature mode
          setSelectedDocumentForSign(document);
        } else {
          console.log('User has already signed this document');
        }
      } else {
        console.log('Document does not require signature');
      }
    } catch (error) {
      console.error('Error checking signature status:', error);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.employee && 
        `${doc.employee.first_name} ${doc.employee.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || doc.category_id === categoryFilter;
    const matchesEmployee = employeeFilter === 'all' || doc.employee_id === employeeFilter;
    
    return matchesSearch && matchesCategory && matchesEmployee;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-platinum">
            {t('header.title')}
          </h1>
          <p className="text-sm text-sunset mt-1 sm:hidden">Gestiona documentos y archivos</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            data-tour="new-category"
            className="btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            {t('buttons.newCategory')}
          </button>
          <button
            onClick={handleUploadClick}
            data-tour="upload-document"
            className="btn-primary flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
          >
            <Upload className="w-4 h-4" />
            {t('buttons.uploadDocument')}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="documents" className="space-y-6">
        <div className="tabs-list">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="documents" 
              className="flex items-center gap-2 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              <FileText className="w-4 h-4" />
              {t('tabs.documents')}
            </TabsTrigger>
            <TabsTrigger 
              value="templates" 
              className="flex items-center gap-2 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              <FileEdit className="w-4 h-4" />
              {t('tabs.templates')}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="documents" className="space-y-6">
          {/* Show empty state if no categories exist */}
          {!loading && categories.length === 0 ? (
            <EmptyState 
              type="noCategories" 
              onAction={() => setIsCategoryModalOpen(true)}
            />
          ) : (
            <>
              {/* Search and Filters */}
              <div className="search-filters bg-card rounded-lg border border-card-border shadow-md p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sunset" />
                    <input
                      type="text"
                      placeholder={t('search.placeholder')}
                      className="input-base pl-10 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <select
                      className="select-custom w-full sm:w-48"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="all">
                        {t('filters.allCategories')}
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {/* Add Employee Filter */}
                    <select
                      className="select-custom w-full sm:w-48"
                      value={employeeFilter}
                      onChange={(e) => setEmployeeFilter(e.target.value)}
                    >
                      <option value="all">
                        {t('filters.allEmployees')}
                      </option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.first_name} {employee.last_name}
                        </option>
                      ))}
                    </select>
                    <div className="view-toggle flex border border-card-border rounded-lg overflow-hidden w-full sm:w-auto">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`flex-1 sm:flex-none px-3 py-2 ${
                          viewMode === 'grid' 
                            ? 'bg-primary text-platinum' 
                            : 'text-sunset hover:bg-background'
                        }`}
                      >
                        <Grid2X2 className="w-4 h-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`flex-1 sm:flex-none px-3 py-2 ${
                          viewMode === 'list' 
                            ? 'bg-primary text-platinum' 
                            : 'text-sunset hover:bg-background'
                        }`}
                      >
                        <List className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>  
              </div>

              {/* Categories Grid */}
              <div className="categories-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => setCategoryFilter(prev => prev === category.id ? 'all' : category.id)}
                    className={`bg-card rounded-lg border border-card-border p-4 cursor-pointer hover:shadow-lg transition-all ${
                      categoryFilter === category.id 
                        ? 'ring-2 ring-flame shadow-md' 
                        : 'hover:border-primary/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg ${
                        categoryFilter === category.id 
                          ? 'bg-primary text-platinum' 
                          : 'bg-primary/10 text-primary'
                      }`}>
                        <FolderOpen className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-platinum truncate">{category.name}</h3>
                        <p className="text-sm text-sunset mt-0.5">
                          {t('category.documentsCount', { count: documents.filter(d => d.category_id === category.id).length })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Documents Section */}
              {loading ? (
                <div className="flex items-center justify-center h-64 text-sunset">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-primary/20 border-t-flame rounded-full animate-spin" />
                    <span>{t('loading')}</span>
                  </div>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <EmptyState 
                  type="noDocuments" 
                  onAction={handleUploadClick}
                />
              ) : viewMode === 'grid' ? (
                <div className="document-actions">
                  <DocumentGrid 
                    documents={filteredDocuments} 
                    onDocumentClick={handleDocumentClick}
                    onDownload={handleDownload}
                    onShare={handleShare}
                    onDelete={handleDelete}
                    onSignRequest={handleSignRequest}
                  />
                </div>
              ) : (
                <div className="document-actions">
                  <DocumentList 
                    documents={filteredDocuments} 
                    onDocumentClick={handleDocumentClick}
                    onDownload={handleDownload}
                    onShare={handleShare}
                    onDelete={handleDelete}
                    onSignRequest={handleSignRequest}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="templates">
          <DocumentTemplates />
        </TabsContent>
      </Tabs>
 
      {/* Modals */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        categories={categories}
        employees={employees}
        onSuccess={fetchDocuments}
      />
 
      <DocumentCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={fetchCategories}
      />
 
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => {
            setSelectedDocument(null);
            fetchDocuments(); // Recargar en caso de que se haya firmado
          }}
        />
      )}
 
      {selectedDocument && (
        <DocumentShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          document={selectedDocument}
          onSuccess={() => {
            fetchDocuments();
            setIsShareModalOpen(false);
          }}
        />
      )}

      {selectedDocumentForSign && (
        <DocumentViewer
          document={selectedDocumentForSign}
          signatureMode={true}
          onClose={() => {
            setSelectedDocumentForSign(null);
            fetchDocuments(); // Recargar documentos para actualizar el estado de firma
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        document={documentToDelete}
        loading={isDeleting}
      />

      {/* Tour Guide */}
      <TourGuide
        steps={createDocumentsTour(tTours)}
        isOpen={tourIsVisible}
        onClose={() => setTourVisible(false)}
        onComplete={() => setTourVisible(false)}
      />

      {/* Help Widget */}
      <HelpWidget 
        currentPage="documents" 
        forceOpen={helpIsVisible}
        onOpenChange={(isOpen) => {
          if (!isOpen) setHelpVisible(false);
        }}
      />
    </div>
  );
}
