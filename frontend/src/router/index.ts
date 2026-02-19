import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'Home',
        redirect: '/csr-generator'
    },
    {
        path: '/csr-generator',
        name: 'CsrGenerator',
        component: () => import('../components/cert/CsrGenerator.vue')
    },
    {
        path: '/matcher',
        name: 'Matcher',
        component: () => import('../components/cert/KeyMatcher.vue')
    },
    {
        path: '/pfx-generator',
        name: 'PfxGenerator',
        component: () => import('../components/cert/PfxGenerator.vue')
    },
    {
        path: '/csr-decoder',
        name: 'CsrDecoder',
        component: () => import('../components/cert/CsrDecoder.vue')
    },
    {
        path: '/cert-decoder',
        name: 'CertDecoder',
        component: () => import('../components/cert/CertificateDecoder.vue')
    },
    {
        path: '/ssl-checker',
        name: 'SslChecker',
        component: () => import('../components/cert/SslChecker.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
