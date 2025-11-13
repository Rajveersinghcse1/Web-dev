/**
 * Admin Pages Routes
 * Route definitions for admin panel pages
 */

import React from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../components/admin/AdminDashboard';
import LibraryContentList from '../components/admin/LibraryContentList';
import LibraryContentForm from '../components/admin/LibraryContentForm';
import InnovationProjectsList from '../components/admin/InnovationProjectsList';
import InnovationProjectForm from '../components/admin/InnovationProjectForm';
import InternshipsList from '../components/admin/InternshipsList';
import InternshipForm from '../components/admin/InternshipForm';
import HackathonsList from '../components/admin/HackathonsList';
import HackathonForm from '../components/admin/HackathonForm';
// Note: Other admin components will be created in subsequent implementations

const AdminRoutes = [
  {
    path: '/admin',
    element: (
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    )
  },
  {
    path: '/admin/library',
    element: (
      <AdminLayout>
        <LibraryContentList />
      </AdminLayout>
    )
  },
  {
    path: '/admin/library/create',
    element: (
      <AdminLayout>
        <LibraryContentForm />
      </AdminLayout>
    )
  },
  {
    path: '/admin/library/edit/:id',
    element: (
      <AdminLayout>
        <LibraryContentForm />
      </AdminLayout>
    )
  },
  {
    path: '/admin/innovation',
    element: (
      <AdminLayout>
        <InnovationProjectsList />
      </AdminLayout>
    )
  },
  {
    path: '/admin/innovation/create',
    element: (
      <AdminLayout>
        <InnovationProjectForm />
      </AdminLayout>
    )
  },
  {
    path: '/admin/innovation/edit/:id',
    element: (
      <AdminLayout>
        <InnovationProjectForm />
      </AdminLayout>
    )
  },
  {
    path: '/admin/internship',
    element: (
      <AdminLayout>
        <InternshipsList />
      </AdminLayout>
    )
  },
  {
    path: '/admin/internship/create',
    element: (
      <AdminLayout>
        <InternshipForm />
      </AdminLayout>
    )
  },
  {
    path: '/admin/internship/edit/:id',
    element: (
      <AdminLayout>
        <InternshipForm />
      </AdminLayout>
    )
  },
  {
    path: '/admin/hackathon',
    element: (
      <AdminLayout>
        <HackathonsList />
      </AdminLayout>
    )
  },
  {
    path: '/admin/hackathon/create',
    element: (
      <AdminLayout>
        <HackathonForm />
      </AdminLayout>
    )
  },
  {
    path: '/admin/hackathon/edit/:id',
    element: (
      <AdminLayout>
        <HackathonForm />
      </AdminLayout>
    )
  },
  // Additional routes will be added here:
  // - /admin/users
  // - /admin/analytics
  // - /admin/settings
];

export default AdminRoutes;