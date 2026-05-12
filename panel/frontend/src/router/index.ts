import { createRouter, createWebHistory } from 'vue-router'
import Instances from '../views/Instances.vue'
import Login from '../views/Login.vue'
import InstanceDetails from '../views/instance/InstanceDetails.vue'
import InstanceFiles from '../views/instance/Files.vue'
import InstanceStartup from '../views/instance/Startup.vue'
import AdminOverview from '../views/admin/Overview.vue'
import AdminUsers from '../views/admin/Users.vue'
import AdminAPIKeys from '../views/admin/APIKeys.vue'
import AdminSettings from '../views/admin/Settings.vue'
import AdminNotifications from '../views/admin/Notifications.vue'
import AdminAuditLogs from '../views/admin/AuditLogs.vue'
import AdminNodes from '../views/admin/Nodes.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/instances',
    name: 'Instances',
    component: Instances
  },
  {
    path: '/instance/:id',
    name: 'InstanceDetails',
    component: InstanceDetails
  },
  {
    path: '/instance/:id/files',
    name: 'InstanceFiles',
    component: InstanceFiles
  },
  {
    path: '/instance/:id/startup',
    name: 'InstanceStartup',
    component: InstanceStartup
  },
  {
    path: '/admin/overview',
    name: 'AdminOverview',
    component: AdminOverview
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: AdminUsers
  },
  {
    path: '/admin/nodes/overview',
    name: 'AdminNodes',
    component: AdminNodes
  },
  {
    path: '/admin/apikeys',
    name: 'AdminAPIKeys',
    component: AdminAPIKeys
  },
  {
    path: '/admin/settings',
    name: 'AdminSettings',
    component: AdminSettings
  },
  {
    path: '/admin/notifications',
    name: 'AdminNotifications',
    component: AdminNotifications
  },
  {
    path: '/admin/auditlogs',
    name: 'AdminAuditLogs',
    component: AdminAuditLogs
  },
  {
    path: '/',
    redirect: '/instances'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
