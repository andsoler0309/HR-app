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
import { useTranslations } from 'next-intl';

export default function DocumentsPage() {
  const t = useTranslations('documents');

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

  const handleDelete = async (document: Document) => {
    if (!confirm(t('delete.confirm'))) return;

    try {
      const { error } = await supabase
        .from('documents')
        .update({ status: 'deleted' })
        .eq('id', document.id);

      if (error) throw error;
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  // Add this function to check if user needs to sign
  const handleSignRequest = async (document: Document) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if there's a pending signature for this user
      const { data: signature, error } = await supabase
        .from('document_signatures')
        .select('*')
        .eq('document_id', document.id)
        .eq('signer_id', user.id)
        .eq('signature_status', 'pending')
        .single();

      if (error) throw error;

      if (signature) {
        setSelectedDocumentForSign(document);
        setIsSignatureModalOpen(true);
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-platinum">
            {t('header.title')}
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              {t('buttons.newCategory')}
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg"
            >
              <Upload className="w-4 h-4" />
              {t('buttons.uploadDocument')}
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger 
              value="documents" 
              className="flex items-center gap-2 data-[state=active]:text-flame data-[state=active]:border-b-2 data-[state=active]:border-flame"
            >
              <FileText className="w-4 h-4" />
              {t('tabs.documents')}
            </TabsTrigger>
            <TabsTrigger 
              value="templates" 
              className="flex items-center gap-2 data-[state=active]:text-flame data-[state=active]:border-b-2 data-[state=active]:border-flame"
            >
              <FileEdit className="w-4 h-4" />
              {t('tabs.templates')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-6">
            {/* Documents Content */}
            {/* <div className="flex gap-3">
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                {t('buttons.newCategory')}
              </button>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg"
              >
                <Upload className="w-4 h-4" />
                {t('buttons.uploadDocument')}
              </button>
            </div> */}

            {/* Search and Filters */}
            <div className="bg-card rounded-lg border border-card-border shadow-md p-4 mb-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sunset" />
                  <input
                    type="text"
                    placeholder={t('search.placeholder')}
                    className="input-base pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="input-base px-4 py-2.5 w-48"
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
                  className="input-base px-4 py-2.5 w-48"
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
                <div className="flex border border-card-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 ${
                      viewMode === 'grid' 
                        ? 'bg-flame text-platinum' 
                        : 'text-sunset hover:bg-background'
                    }`}
                  >
                    <Grid2X2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 ${
                      viewMode === 'list' 
                        ? 'bg-flame text-platinum' 
                        : 'text-sunset hover:bg-background'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>  
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => setCategoryFilter(prev => prev === category.id ? 'all' : category.id)}
                  className={`bg-card rounded-lg border border-card-border p-4 cursor-pointer hover:shadow-lg transition-all ${
                    categoryFilter === category.id 
                      ? 'ring-2 ring-flame shadow-md' 
                      : 'hover:border-flame/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${
                      categoryFilter === category.id 
                        ? 'bg-flame text-platinum' 
                        : 'bg-flame/10 text-flame'
                    }`}>
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-platinum">{category.name}</h3>
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
                  <div className="w-6 h-6 border-2 border-flame/20 border-t-flame rounded-full animate-spin" />
                  <span>{t('loading')}</span>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <DocumentGrid 
                documents={filteredDocuments} 
                onDocumentClick={handleDocumentClick}
                onDownload={handleDownload}
                onShare={handleShare}
                onDelete={handleDelete}
                onSignRequest={handleSignRequest}
              />
            ) : (
              <DocumentList 
                documents={filteredDocuments} 
                onDocumentClick={handleDocumentClick}
                onDownload={handleDownload}
                onShare={handleShare}
                onDelete={handleDelete}
                onSignRequest={handleSignRequest}
              />
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
            onClose={() => setSelectedDocument(null)}
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
          <SignaturePad
            isOpen={isSignatureModalOpen}
            onClose={() => {
              setIsSignatureModalOpen(false);
              setSelectedDocumentForSign(null);
            }}
            document={selectedDocumentForSign}
            onSuccess={() => {
              fetchDocuments();
              setIsSignatureModalOpen(false);
              setSelectedDocumentForSign(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
