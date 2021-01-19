
export default {
        namespaced: true,
        state: {
                list: [],
                isInit: false
        },
        mutations: {
                _init( state, list ){
                       state.list = list;
                       state.isInit = true;
                },
                _addRole( state, role ){
                        state.list.push( role );
                },
                _updateRole( state, role ){
                        let i = state.list.findIndex( item => item.role_id === role.role_id );
                        state.list.splice( i, 1, role );
                },
                _removeRole( state, role_id ){
                        let i = state.list.findIndex( item => item.role_id === role_id );
                        state.list.splice( i, 1 );
                },
        },
        actions: {
                async init( { commit, rootState, state } ){
                        if( state.isInit ) return;
                        let list = await rootState.http({ url: "/role/all" });
                        commit( "_init", list );
                },
                async addRole( { commit, rootState }, role ){
                        role.role_id = await rootState.http({
                                method: "post",
                                url: "/role/add",
                                data: role
                        });
                        commit("_addRole", role );
                },
                async updataRole( { commit, rootState }, role ){
                        await rootState.http({
                                method: "post",
                                url: "/role/update",
                                data: role
                        });
                        commit( "_updateRole", role );
                },
                async removeRole( { commit, rootState }, role_id ){
                        await rootState.http({
                                method: "post",
                                url: "/role/remove/" + role_id
                        });
                        commit("_removeRole", role_id);
                },
        },
}