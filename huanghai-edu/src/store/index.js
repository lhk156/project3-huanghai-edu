import Vue from 'vue';
import Vuex from 'vuex';
import http from '../utils/http.js'
import func from './func.js';
import role from './role.js';
import classroom from './classroom.js';
import staff from './staff.js';
import dictionary from './dictionary.js';
import classdata from './classdata.js'
Vue.use(Vuex);

let store = new Vuex.Store({
        // 拆分子仓库
        modules: {
                func,
                role,
                classroom,
                staff,
                dictionary,
                classdata
        },
        // 存放共用数据
        state: { http },
        // 当仓库中的state中的数据，多个组件在用时都要通过一定的计算处理来用，
        // 可以让仓库在getters中算好后再让多个组件去调用
        // getters相当于组件中的计算属性
        getters: {},
        // 只有mutations中的方法才可以修改state节点中的数据。
        // mutations节点中的方法在调用时第一个参数总是state本身
        // mutations节点中的方法在组件调用时必须用commit（）来进行调用
        // mutations节点中的方法只能包含同步的代码，不能包含异步的耗时的代码
        mutations: {},

        // actions可以包含异步的耗时的代码，但绝对不可以修改state中的数据
        // actions节点中的方法的第一个参数是一个仓库上下文对象，里面重要的属性包括state、commit
        // actions节点中的方法组件调用时必须用dispatch（）来进行间接调用
        actions: {}
});

export default store;