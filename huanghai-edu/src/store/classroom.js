
export default {
        namespaced: true,
        state: {
                list: [],
                isInit: false
        },
        mutations: {
                _init(state, list){
                        state.list = list;
                        state.isInit = true;
                },
                _addClassroom( state, classroom ){
                        state.list.push(classroom);
                },
                _updataClassroom(state, classroom ){
                        let i = state.list.findIndex( item => item.clsr_id === classroom. clsr_id );
                        state.list.splice( i, 1, classroom );
                },
                _removeClassroom(state, clsr_id){
                        let i = state.list.findIndex( item => item.clsr_id === clsr_id );
                        state.list.splice( i, 1 );
                }
        },
        actions: {
                async init( { commit, rootState, state } ){
                        if( state.isInit ) return;
                        let list = await rootState.http({url: '/classroom/all'});
                        commit( "_init", list );
                },
                async addClassroom({ commit, rootState }, classroom){
                        classroom.clsr_id = await rootState.http({
                                method: "post",
                                url: "/classroom/add",
                                data: classroom
                        });
                        commit("_addClassroom", classroom);
                },
                async updataClassroom({ commit, rootState }, classroom){
                        await rootState.http({
                                method: "post",
                                url: "/classroom/update",
                                data: classroom
                        });
                        commit("_updataClassroom", classroom);
                },
                async removeClassroom({ commit, rootState },clsr_id){
                        await rootState.http({ url: "/classroom/remove/" + clsr_id });
                        commit("_removeClassroom", clsr_id);
                }
        }
}