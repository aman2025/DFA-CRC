/*
 * Copyright 1999-2018 Alibaba Group Holding Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * 入口页
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import { routerReducer } from 'react-router-redux';
import thunk from 'redux-thunk';
import { Provider, connect } from 'react-redux';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import { ConfigProvider, Loading } from '@alifd/next';

import './lib';

import Layout from './layouts/MainLayout';
import { LANGUAGE_KEY, REDUX_DEVTOOLS } from './constants';

import Login from './pages/Login';
import Namespace from './pages/NameSpace';
import Newconfig from './pages/ConfigurationManagement/NewConfig';
import Configsync from './pages/ConfigurationManagement/ConfigSync';
import Configdetail from './pages/ConfigurationManagement/ConfigDetail';
import Configeditor from './pages/ConfigurationManagement/ConfigEditor';
import HistoryDetail from './pages/ConfigurationManagement/HistoryDetail';
import ConfigRollback from './pages/ConfigurationManagement/ConfigRollback';
import HistoryRollback from './pages/ConfigurationManagement/HistoryRollback';
import ListeningToQuery from './pages/ConfigurationManagement/ListeningToQuery';
import ConfigurationManagement from './pages/ConfigurationManagement/ConfigurationManagement';
import ServiceList from './pages/ServiceManagement/ServiceList';
import ServiceDetail from './pages/ServiceManagement/ServiceDetail';
import SubscriberList from './pages/ServiceManagement/SubscriberList';
import ClusterNodeList from './pages/ClusterManagement/ClusterNodeList';
import UserManagement from './pages/AuthorityControl/UserManagement';
import PermissionsManagement from './pages/AuthorityControl/PermissionsManagement';
import RolesManagement from './pages/AuthorityControl/RolesManagement';
import Welcome from './pages/Welcome/Welcome';

import reducers from './reducers';
import { changeLanguage } from './reducers/locale';

import './index.scss';
import './shinedfa.scss';
import PropTypes from 'prop-types';

module.hot && module.hot.accept();

if (!localStorage.getItem(LANGUAGE_KEY)) {
  localStorage.setItem(LANGUAGE_KEY, navigator.language === 'zh-CN' ? 'zh-CN' : 'en-US');
}

const reducer = combineReducers({
  ...reducers,
  routing: routerReducer,
});

const store = createStore(
  reducer,
  compose(applyMiddleware(thunk), window[REDUX_DEVTOOLS] ? window[REDUX_DEVTOOLS]() : f => f)
);

const MENU = [
  { path: '/', exact: true, render: () => <Redirect to="/welcome" /> },
  { path: '/welcome', component: Welcome },
  { path: '/namespace', component: Namespace },
  { path: '/newconfig', component: Newconfig },
  { path: '/configsync', component: Configsync },
  { path: '/configdetail', component: Configdetail },
  { path: '/configeditor', component: Configeditor },
  { path: '/historyDetail', component: HistoryDetail },
  { path: '/configRollback', component: ConfigRollback },
  { path: '/historyRollback', component: HistoryRollback },
  { path: '/listeningToQuery', component: ListeningToQuery },
  { path: '/configurationManagement', component: ConfigurationManagement },
  { path: '/serviceManagement', component: ServiceList },
  { path: '/serviceDetail', component: ServiceDetail },
  { path: '/subscriberList', component: SubscriberList },
  { path: '/clusterManagement', component: ClusterNodeList },
  { path: '/userManagement', component: UserManagement },
  { path: '/rolesManagement', component: RolesManagement },
  { path: '/permissionsManagement', component: PermissionsManagement },
];

@connect(state => ({ ...state.locale }), { changeLanguage })
class App extends React.Component {
  static propTypes = {
    locale: PropTypes.object,
    changeLanguage: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      shownotice: 'none',
      noticecontent: '',
      nacosLoading: {},
    };
    this._beforeUnload_time = 0;
    this._gap_time = 0;
  }

  componentDidMount() {
    const language = localStorage.getItem(LANGUAGE_KEY);
    this.props.changeLanguage(language);
  }

  // 关闭浏览器，清空token，重新登录
  // 关闭浏览器的事件顺序 先beforeunload，再unload
  componentWillMount() {
    window.addEventListener('beforeunload', this.beforeunload.bind(this)); // 拦截判断是否离开当前页面
    window.addEventListener('unload', this.unload.bind(this)); // 拦截判断是否离开当前页面
  }

  componentWillUnmount() {
    window.addEventListener('beforeunload', this.beforeunload.bind(this)); // 拦截判断是否离开当前页面
    window.addEventListener('unload', this.unload.bind(this)); // 拦截判断是否离开当前页面
  }

  beforeunload(e) {
    this._beforeUnload_time = new Date().getTime();
  }

  unload() {
    this._gap_time = new Date().getTime() - this._beforeUnload_time;
    console.log(this._gap_time);
    if (this._gap_time <= 5) {
      // 时间差小于5，是关闭事件
      window.localStorage.clear();
    } else {
      // 刷新
    }
  }

  get router() {
    return (
      <HashRouter>
        <Switch>
          <Route path="/login" component={Login} />
          <Layout>
            {MENU.map(item => (
              <Route key={item.path} {...item} />
            ))}
          </Layout>
        </Switch>
      </HashRouter>
    );
  }

  render() {
    const { locale } = this.props;
    return (
      <Loading
        className="nacos-loading"
        shape="flower"
        tip="loading..."
        visible={false}
        fullScreen
        {...this.state.nacosLoading}
      >
        <ConfigProvider locale={locale}>{this.router}</ConfigProvider>
      </Loading>
    );
  }
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
