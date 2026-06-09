import { createRouter, createWebHistory } from 'vue-router';
import Instances from '../views/Instances.vue';
import Login from '../views/Login.vue';
import InstanceDetails from '../views/instance/InstanceDetails.vue';
import AdminOverview from '../views/admin/Overview.vue';
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
        path: '/admin/overview',
        name: 'AdminOverview',
        component: AdminOverview
    },
    {
        path: '/',
        redirect: '/instances'
    }
];
const router = createRouter({
    history: createWebHistory(),
    routes
});
export default router;
//# sourceMappingURL=index.js.map