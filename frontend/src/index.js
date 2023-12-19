import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {store,persistor} from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
/**
 * 根元素
 * @typedef {Object} Root
 * @property {function} render - 渲染函数
 */

/**
 * 创建根元素
 * @function
 * @param {HTMLElement} container - 包含根元素的容器
 * @returns {Root} - 根元素对象
 */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <App />
        </PersistGate>
    </Provider>
    
);

reportWebVitals();
