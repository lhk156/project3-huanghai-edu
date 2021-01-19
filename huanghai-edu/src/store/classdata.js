import http from '../utils/http.js';

export default {
        namespaced: true,
        state:{
                list: [],
                total: 0
        },
        mutations:{
                _init(state, result){
                        state.total = result.total;
                        state.list = result.list;
                },
                _addClass(state, addData){
                        state.list.push(addData);
                },
                _updateClass(state, updateData){
                        let i = state.list.findIndex( item => item.cls_id === updateData.cls_id );
                        state.list.splice( i, 1, updateData );
                },

        },
        actions: {
                async init( { commit, rootState }, classData ){
                         let result = await rootState.http({
                                method: "post",
                                url: "/class/list",
                                data: classData
                        });
                        commit( "_init", result )
                },
                async addClass({ commit, rootState }, addData){
                        addData.cls_id = await rootState.http({
                                method: "post",
                                url: "/class/add",
                                data: addData
                        });
                        commit( "_addClass" , addData)
                },
                async updateClass({ commit, rootState }, updateData){
                        await rootState.http({
                                method: "post",
                                url: "/class/update",
                                data: updateData
                        });
                        commit( "_updateClass", updateData )
                },

        }
}