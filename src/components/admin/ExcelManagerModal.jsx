import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  FileCheck, 
  Layers, 
  RefreshCw, 
  Database,
  ArrowRight
} from 'lucide-react';
import { parseExcelFileForImport, commitImportedProducts } from '../../utils/excelImport';
import { exportProductsToExcel, exportCatalogTemplate } from '../../utils/excelExport';
import { loadProductsCatalog } from '../../utils/excelParser';
import { isSupabaseConfigured } from '../../services/supabaseClient';

export default function ExcelManagerModal({ isOpen, onClose, onImportSuccess }) {
  const [activeTab, setActiveTab] = useState('import'); // 'import' | 'export'
  const fileInputRef = useRef(null);

  // Import states
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percent: 0 });
  const [importResult, setImportResult] = useState(null);

  // Export states
  const [exporting, setExporting] = useState(false);
  const [exportCategory, setExportCategory] = useState('all');
  const [exportInStockOnly, setExportInStockOnly] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Handle file select
  const handleFileSelect = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setParsing(true);
    setParsedData(null);
    setImportResult(null);

    try {
      const result = await parseExcelFileForImport(selected);
      setParsedData(result);
    } catch (err) {
      alert(err.message || 'Error parsing Excel file');
      setFile(null);
    } finally {
      setParsing(false);
    }
  };

  // Commit import
  const handleCommitImport = async () => {
    if (!parsedData || parsedData.validRows.length === 0) return;
    setImporting(true);
    setProgress({ current: 0, total: parsedData.validRows.length, percent: 0 });

    try {
      const res = await commitImportedProducts(parsedData.validRows, {
        onProgress: setProgress,
      });
      setImportResult(res);
      if (onImportSuccess) {
        onImportSuccess(res);
      }
    } catch (err) {
      setImportResult({ success: false, errors: [err.message] });
    } finally {
      setImporting(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    setExporting(true);
    setExportSuccessMsg('');
    try {
      const catalog = await loadProductsCatalog();
      let filtered = catalog;

      if (exportCategory !== 'all') {
        filtered = filtered.filter(p => String(p.category || '').toLowerCase() === exportCategory.toLowerCase());
      }
      if (exportInStockOnly) {
        filtered = filtered.filter(p => p.inStock);
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Gandhi_Shop_Catalog_${exportCategory === 'all' ? 'All' : exportCategory}_${timestamp}.xlsx`;
      
      const res = exportProductsToExcel(filtered, filename);
      setExportSuccessMsg(`Successfully exported ${res.rowCount} products to ${res.filename}`);
    } catch (err) {
      alert(err.message || 'Export error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-terracotta-dark/60 backdrop-blur-sm animate-fadeIn">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-olive/20 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sand bg-cream">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-terracotta/15 flex items-center justify-center text-terracotta">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-terracotta-dark">
                Excel Product Hub
              </h2>
              <p className="text-xs text-olive/80 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-forest" />
                {isSupabaseConfigured ? 'Connected to Supabase live database' : 'Operating in local catalog fallback mode'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-sand/60 hover:bg-sand flex items-center justify-center text-olive transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-sand bg-sand/20 px-6 pt-2">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'import'
                ? 'border-terracotta text-terracotta font-semibold'
                : 'border-transparent text-olive hover:text-terracotta'
            }`}
          >
            <Upload className="w-4 h-4" />
            Import Products (Excel ➔ Database)
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'export'
                ? 'border-terracotta text-terracotta font-semibold'
                : 'border-transparent text-olive hover:text-terracotta'
            }`}
          >
            <Download className="w-4 h-4" />
            Export Products (Database ➔ Excel)
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'import' ? (
            <div className="space-y-5">
              {/* Dropzone */}
              {!parsedData && !importResult && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-olive/30 hover:border-terracotta rounded-2xl p-8 text-center bg-cream/50 hover:bg-cream transition-all cursor-pointer group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    accept=".xlsx, .xls" 
                    className="hidden" 
                  />
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-terracotta/10 group-hover:bg-terracotta/20 flex items-center justify-center text-terracotta transition-colors">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-semibold text-terracotta-dark">
                    Click or drag Excel spreadsheet here
                  </h3>
                  <p className="text-xs text-olive/70 mt-1 max-w-sm mx-auto">
                    Supports .xlsx and .xls with standard Gandhi Shop headers (Product ID, Name, Tamil Name, Price, Category, etc.)
                  </p>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      exportCatalogTemplate();
                    }}
                    className="mt-4 text-xs font-medium text-terracotta hover:underline inline-flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Sample Excel Template
                  </button>
                </div>
              )}

              {/* Parsing Indicator */}
              {parsing && (
                <div className="py-8 text-center text-olive space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-terracotta" />
                  <p className="text-sm font-medium">Parsing and validating products spreadsheet...</p>
                </div>
              )}

              {/* Parsed Preview Table */}
              {parsedData && !importResult && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-sand/30 p-3.5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-6 h-6 text-forest" />
                      <div>
                        <div className="text-sm font-bold text-terracotta-dark">
                          {file?.name}
                        </div>
                        <div className="text-xs text-olive/80">
                          {parsedData.validRows.length} valid products ready | {parsedData.categories.length} categories
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-forest/15 text-forest">
                        {parsedData.validRows.length} Valid
                      </span>
                      {parsedData.invalidRows.length > 0 && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-terracotta/15 text-terracotta">
                          {parsedData.invalidRows.length} Skipped
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Preview Rows Table */}
                  <div className="border border-sand rounded-xl overflow-hidden text-xs">
                    <div className="bg-sand/40 px-3 py-2 font-semibold text-terracotta-dark">
                      Sample Preview (First 4 rows):
                    </div>
                    <div className="divide-y divide-sand max-h-44 overflow-y-auto">
                      {parsedData.validRows.slice(0, 4).map((r, i) => (
                        <div key={i} className="p-2.5 flex items-center justify-between hover:bg-cream/40">
                          <div className="truncate pr-2">
                            <span className="font-mono text-terracotta font-bold mr-2">{r.sku}</span>
                            <span className="font-medium text-terracotta-dark">{r.name}</span>
                            {r.name_ta && <span className="text-olive/70 ml-1.5">({r.name_ta})</span>}
                          </div>
                          <div className="flex items-center gap-4 shrink-0 font-medium">
                            <span className="text-olive/80">{r.category_name}</span>
                            <span className="text-forest font-bold">₹{r.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress Bar (During commit) */}
                  {importing && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-medium text-olive">
                        <span>Importing to database...</span>
                        <span>{progress.percent}% ({progress.current}/{progress.total})</span>
                      </div>
                      <div className="w-full h-2.5 bg-sand/50 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-forest rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress.percent}%` }}
                          transition={{ ease: "easeInOut" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      disabled={importing}
                      onClick={() => {
                        setFile(null);
                        setParsedData(null);
                      }}
                      className="px-4 py-2 text-xs font-semibold rounded-xl text-olive hover:bg-sand/40 transition-colors"
                    >
                      Cancel & Choose Other File
                    </button>
                    <button
                      type="button"
                      disabled={importing}
                      onClick={handleCommitImport}
                      className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-terracotta text-white hover:bg-terracotta-dark flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
                    >
                      {importing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Importing ({progress.percent}%)...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Commit {parsedData.validRows.length} Products to Database
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Import Result Screen */}
              {importResult && (
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-forest/15 flex items-center justify-center text-forest">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-terracotta-dark">
                      Import Completed Successfully!
                    </h3>
                    <p className="text-xs text-olive/80 mt-1">
                      {importResult.totalProcessed} products were processed and upserted into the Gandhi Shop catalog.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      setParsedData(null);
                      setImportResult(null);
                      onClose();
                      window.location.reload();
                    }}
                    className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-forest text-white hover:bg-forest-light transition-all shadow-md"
                  >
                    Refresh & View Updated Catalog
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Export Tab */
            <div className="space-y-6">
              <div className="bg-cream/50 border border-sand rounded-2xl p-4 space-y-4">
                <div className="text-sm font-semibold text-terracotta-dark flex items-center gap-2">
                  <Layers className="w-4 h-4 text-terracotta" />
                  Select Catalog Export Filters
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-olive mb-1">
                      Category
                    </label>
                    <select
                      value={exportCategory}
                      onChange={(e) => setExportCategory(e.target.value)}
                      className="w-full text-xs rounded-xl border border-olive/20 p-2.5 bg-white text-terracotta-dark font-medium focus:outline-none focus:border-terracotta"
                    >
                      <option value="all">All Categories (Complete Store Catalog)</option>
                      <option value="Masala & Podi">Masala & Podi</option>
                      <option value="Cooking Oil & Ghee">Cooking Oil & Ghee</option>
                      <option value="Tea Coffee Drinks">Tea Coffee Drinks</option>
                      <option value="Rice Varieties">Rice Varieties</option>
                      <option value="Dal & Pulses">Dal & Pulses</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-terracotta-dark">
                      <input 
                        type="checkbox" 
                        checked={exportInStockOnly}
                        onChange={(e) => setExportInStockOnly(e.target.checked)}
                        className="rounded text-terracotta focus:ring-terracotta w-4 h-4"
                      />
                      Export Only "In Stock" Products
                    </label>
                  </div>
                </div>
              </div>

              {exportSuccessMsg && (
                <div className="p-3 bg-forest/15 text-forest border border-forest/20 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {exportSuccessMsg}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-sand">
                <button
                  type="button"
                  onClick={() => exportCatalogTemplate()}
                  className="text-xs font-medium text-olive hover:text-terracotta flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Empty Template (.xlsx)
                </button>

                <button
                  type="button"
                  disabled={exporting}
                  onClick={handleExport}
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold rounded-xl bg-terracotta text-white hover:bg-terracotta-dark flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                >
                  {exporting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Generating Spreadsheet...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download Catalog (.xlsx)
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
