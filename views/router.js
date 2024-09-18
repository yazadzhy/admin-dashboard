import React from 'react'
import {Switch, Router, Route} from 'react-router'
import Layout from './top-layout/layout-view'
import AuthLayout from './layout/auth-layout'
import NotFoundPage from './pages/not-found-page'
import DashboardPage from './pages/dashboard-page'
import ServerConfigurationPage from './pages/server-configuration-page'
import PublicInitialGatewaysConfigView from './gateway/public-initial-gateways-config-view'

export default function AppRouter({history}) {
    return <Router history={history}>
        <Layout>
            <Switch>
                <Route path="/" exact>
                    <AuthLayout><DashboardPage/></AuthLayout>
                </Route>
                <Route path="/config" exact>
                    <AuthLayout><ServerConfigurationPage/></AuthLayout>
                </Route>
                <Route path="/gateway-initial-config" exact>
                    <PublicInitialGatewaysConfigView/>
                </Route>
                <Route component={NotFoundPage}/>
            </Switch>
        </Layout>
    </Router>
}