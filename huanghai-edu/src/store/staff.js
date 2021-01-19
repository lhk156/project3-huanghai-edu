
export default {
        namespaced: true,
        state:{
                list: [],
                total: 0,
                isInit: false
        },
        mutations:{
                _init(state, list){
                        state.list = list.list;
                        state.total = list.total;
                        state.isInit = true;
                },
                _addStaff(state, staff){
                        state.list.push( staff );
                },
                _updateStaff( state, staff ){
                        let i =  state.list.forEach( item => item.stf_id === staff.stf_id );
                        state.list.splice( i, 1, staff );
                },
                _staffResign(state, staffId){
                        state.list.find( item => item.stf_id === staffId ).stf_invalid = 0;
                },
                _staffEntry(state, staffId){
                        state.list.find( item => item.stf_id === staffId ).stf_invalid = 1;
                }
        },
        actions:{
                async init( { commit, rootState }, model,  ){
                        let list = await rootState.http({
                                method: "post",
                                url: "/staff/list",
                                data: model
                        });
                        commit("_init", list)
                },
                async addStaff( { commit, rootState }, staff){
                        staff.stf_id = await rootState.http({
                                method: "post",
                                url: "/staff/add",
                                data: staff
                        });
                        commit("_addStaff", staff)
                },
                async updateStaff({ commit, rootState }, staff){
                        await rootState.http({
                                method: "post",
                                url: "/staff/update",
                                data: staff
                        });
                        commit("_updateStaff", staff)
                },
                async staffResign( { commit, rootState }, staff ){
                        await rootState.http({ url: "/staff/dimission/" + staff.stf_id });
                        commit("_staffResign", staff.stf_id)
                },
                async staffEntry( { commit, rootState }, staff ){
                        await rootState.http({ url: "/staff/reinstate/" + staff.stf_id });
                        commit("_staffEntry", staff.stf_id)
                },
        }
}
