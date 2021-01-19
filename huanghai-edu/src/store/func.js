

export default {
        namespaced: true,
        state: {
                list: [],
                isInit: false
        },
        getters: {
                listToTree(state){
                        let result = [];
                        state.list.filter( item => 0 === item.func_fid ).forEach( item => {
                                let node = Object.assign( {}, item );
                                let children = state.list.filter( func => func.func_fid === item.func_id );
                                if( children.length > 0 ){
                                        node.children = [];
                                        children.forEach( func => node.children.push( Object.assign( {}, func )));
                                }
                                result.push(node);
                        } );
                        return result;
                }
        },
        mutations: {
                _init( state, list ){
                        state.list = list;
                        state.isInit = true;
                },
                _removeFunc( state, func_id ){
                        let i = state.list.findIndex( item => item.func_id === func_id );
                        state.list.splice( i, 1 );
                },
                _addFunc( state, func ){
                        state.list.push(  func  );
                },
                _updateFunc( state, func ){
                        let i = state.list.findIndex( item => item.func_id === func.func_id );
                        state.list.splice( i, 1, func );
                }
        },
        actions: {
                async init( { commit, rootState,state } ){
                        if( state.isInit ) return;
                        let list = await rootState.http({ url: "/function/all" });
                        commit( "_init", list );
                },
                async removeFunc({ commit, rootState }, func_id){
                        await rootState.http({
                                method: "post",
                                url: "/function/remove/" + func_id
                        });
                        commit("_removeFunc", func_id)
                },
                async addFunc( { commit, rootState }, func ){
                        func.func_id = await rootState.http({
                                method: "post",
                                url: "/function/add",
                                data: func
                        });
                        commit( "_addFunc", func );
                },
                async updateFunc( { commit, rootState }, func ){
                        await rootState.http({
                                method: "post",
                                url: "/function/update",
                                data: func
                        });
                        commit( "_updateFunc", func)
                }
        },


}