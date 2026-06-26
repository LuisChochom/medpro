const fs = require('fs');
const path = require('path');

// 1. Fix Layout.jsx (NavLinks)
const layoutPath = path.join(__dirname, 'src', 'components', 'Layout.jsx');
let layoutContent = fs.readFileSync(layoutPath, 'utf8');

// Replace import
layoutContent = layoutContent.replace(/import { Outlet, Navigate, Link } from 'react-router-dom';/, 'import { Outlet, Navigate, NavLink } from \'react-router-dom\';');

// Helper to replace Links with NavLinks and dynamic class
const linkRegex = /<Link to="([^"]+)" onClick=\{([^}]+)\} className="([^"]+)">/g;
layoutContent = layoutContent.replace(linkRegex, (match, to, onClick, className) => {
  // Base classes (remove text-gray-xxx, bg-gray-xxx)
  let baseClass = className.replace(/text-gray-\d+/g, '').replace(/bg-gray-\d+/g, '').replace(/hover:[^\s]+/g, '').replace(/\s+/g, ' ').trim();
  
  return `<NavLink to="${to}" onClick={${onClick}} className={({isActive}) => \`${baseClass} \${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}\`}>`;
});
layoutContent = layoutContent.replace(/<\/Link>/g, '</NavLink>');

fs.writeFileSync(layoutPath, layoutContent, 'utf8');
console.log('Updated Layout.jsx');

// 2. Fix Pages (Toasts)
const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  if (file === 'Login.jsx') return; // Skip login for now or handle differently
  
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Import toast
  if (!content.includes('import toast from')) {
    content = content.replace(/import React.*?;/, '$&\nimport toast from \'react-hot-toast\';');
  }

  // Remove the old red banner for formErrors
  content = content.replace(/\{formErrors && \(\s*<div className="bg-red-50[^>]+>\s*<p className="text-sm text-red-700">\{formErrors\}<\/p>\s*<\/div>\s*\)\}/g, '');

  // Replace setFormErrors with toast.error
  content = content.replace(/setFormErrors\(([^)]+)\);/g, 'toast.error($1);');

  // Add toast.success on successful handleCreate
  content = content.replace(/(await api\.post\('[^']+', formData\);\s*setShowCreateModal\(false\);\s*fetch\w+\(.*?\);)/g, '$1\n      toast.success("Registro creado exitosamente.");');

  // Add toast.success on successful handleEdit
  content = content.replace(/(await api\.put\(`[^`]+`, formData\);\s*setShowEditModal\(false\);\s*fetch\w+\(.*?\);)/g, '$1\n      toast.success("Registro actualizado exitosamente.");');

  // Add toast.success on successful handleDelete
  content = content.replace(/(await api\.delete\(`[^`]+`\);\s*setShowDeleteModal\(false\);\s*fetch\w+\(.*?\);)/g, '$1\n      toast.success("Registro eliminado/archivado exitosamente.");');
  
  // Also fix the catch block in handleDelete which currently uses alert
  content = content.replace(/alert\('Error al archivar[^']+'\);/g, 'toast.error("Error al eliminar/archivar el registro");');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
