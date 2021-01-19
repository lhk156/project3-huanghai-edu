<template>
	<div>
		<el-row :gutter="20">
			<el-col v-for="item in list" :key="item.role_id" :span="6">
				<el-card shadow="hover">
					<span v-text="item.role_name"></span>
					<div class="button-wrapper">
						<el-button type="text" @click="beginUpdata(item)"><i class="el-icon-edit-outline"></i></el-button>
						<el-button type="text" @click="beginRemove(item)"><i class="el-icon-delete"></i></el-button>
						<el-button type="text" @click="beginRoleFuncConfig(item.role_id)"><i class="el-icon-set-up"></i></el-button>
					</div>
				</el-card>
			</el-col>
			<el-col :span="6" >
				<el-card class="btn-add" @click.native.stop="beginAdd">
					<i class="el-icon-plus"></i>
				</el-card>
			</el-col>
		</el-row>
		<el-dialog :visible.sync="edit.isEdit" :title="edit.mode? '新增用户' : '修改用户'"
		           :modal="false"
		           :show-close="false" width="500px">
			<el-form :model="edit.model" :rules="edit.rules" ref="form">
				<el-form-item label="用户名字" prop="role_name">
					<el-input v-model.trim="edit.model.role_name"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button type="primary" @click="save">保存</el-button>
				<el-button @click="edit.isEdit = false">取消</el-button>
			</span>
		</el-dialog>
		<el-drawer :visible.sync="edit2.isEdit" :show-close="false" class="custom-drawer" :modal="false" size="400px">
			<div class="flexRole">
				<h3 slot="title">角色 - 功能分配</h3>
				<el-tree class="custom-tree" :data="edit2.treeData" default-expand-all :expand-on-click-node="false">
					<span class="custom-tree-node" slot-scope="{ node, data }" :class="{ parent: data.func_key === '' }">
						<span>
							<i v-if="data.func_key !== ''"  class="el-icon-paperclip"></i>
							<span v-text="data.func_name"></span>
						</span>
						<span class="switch-wrapper">
							<el-switch v-model="data.open" @change="switchChangeHandler(data)"></el-switch>
						</span>
					</span>
				</el-tree>
				<div class="drawer-footer">
					<el-button type="primary" @click="roleFuncConfig">确定</el-button>
					<el-button @click="edit2.isEdit = false">取消</el-button>
				</div>
			</div>

		</el-drawer>
	</div>
</template>

<script type="text/ecmascript-6">
	import {createNamespacedHelpers} from 'vuex';
        import ElContainer from "../../../node_modules/element-ui/packages/container/src/main.vue";
	let { mapState: mapStateFromRole , mapActions: mapActionsFromRole } = createNamespacedHelpers('role');
	let {mapGetters: mapGettersFromFunc, mapActions: mapActionsFromFunc} = createNamespacedHelpers('func');

        export default {
                components: {ElContainer},
                name: "Role",
	        data(){
                        return {
	                        edit: {
                                        isEdit: false,            //是否进入了编辑状态，默认没有
		                        mode: true,             //新增还是修改，true表示新增
		                        model:{                    //模板，存放id和name，初始值为无效值
                                                role_id : -1,
			                        role_name : ""
		                        },
		                        rules: {
                                                role_name:[
	                                                {
                                                                validator: (rule, value, callback) => {
                                                                        let { role_name, role_id } = this.edit.model;
	                                                                if( value.length === 0 )
	                                                                        callback( new Error( "*角色名称不能为空" ) );
	                                                                else if( value.length < 2 || value.length > 20  )
	                                                                        callback( new Error( "*角色名称应该在2-20个字符中间" ) );
	                                                                else if( this.list.some( item => item.role_id !== role_id && item.role_name === role_name ) )
	                                                                        callback( new Error( "*角色名字不能重复" ) );
	                                                                else
	                                                                        callback();
                                                                },
		                                                trigger: "blur"
	                                                }
                                                ]
		                        }
	                        },
	                        edit2: {
	                                isEdit: false,                   //有没有进去角色功能分配,默认没有
		                        model: {
						role_id: 0,
			                        role_func_ids: "",
		                        },
                                        treeData: []                    //实际和树绑定的数据
	                        }
                        }
	        },
	        created(){
                        this.init();
		        this.initFunc();
	        },
	        computed:{
                        ...mapStateFromRole(["list"]),
		        ...mapGettersFromFunc(["listToTree"]),
	        },
	        methods: {
		        ...mapActionsFromRole(["init", "addRole", "updataRole", "removeRole"]),
		        ...mapActionsFromFunc({ "initFunc": "init" }),
		        updateTreeData(roleFuncIds){
				let result = JSON.parse(JSON.stringify(this.listToTree));
				result.forEach( item => {
				        item.open = roleFuncIds.indexOf( item.func_id) !== -1;
				        item.children && item.children.forEach( item2 => item2.open = roleFuncIds.indexOf( item2.func_id ) !== -1 );
				} );
			        this.edit2.treeData = result;
		        },
                        beginAdd(){
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.mode = true;
	                        this.edit.model.role_name = "";
	                        this.edit.isEdit = true;
                        },
                        beginUpdata( node ){
//				console.log(node);
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.mode = false;
                                this.edit.model.role_id = node.role_id;
                                this.edit.model.role_name = node.role_name;
                                this.edit.isEdit = true;
                        },
                        save(){
                                this.$refs.form.validate( async (valid) => {
                                        if( !valid ) return;
                                        //新增保存的时候做的事
                                        if( this.edit.mode ){
//                                                let role_id = await this.$http({
//                                                        method: "post",
//                                                        url: "/role/add",
//                                                        data: this.edit.model
//                                                });
//                                                this.roles.push( Object.assign({}, this.edit.model, { role_id }) );
						await this.addRole( Object.assign({}, this.edit.model) );
                                                this.$message({
                                                        message: `"${this.edit.model.role_name}"节点新增成功`,
                                                        type: "success"
                                                });
                                        }else{
//                                                await this.$http({
//                                                        method: "post",
//                                                        url: "/role/update",
//                                                        data: this.edit.model
//                                                });
//                                                let i = this.roles.findIndex( item => item.role_id === this.edit.model.role_id );
//                                                this.roles.splice( i, 1, Object.assign( {}, this.edit.model ) );
	                                        await this.updataRole( Object.assign({}, this.edit.model) );
                                                this.$message({
                                                        message: `"${ this.edit.model.role_name }"节点修改成功`,
                                                        type: "success"
                                                })
                                        }

                                        this.edit.isEdit = false;
                                } ) ;

                        },
                        beginRemove(node){

                                this.$confirm(`你确定要删除节点吗`,"警告",{ type: "warning" })
	                                .then( async () =>{
//                                                let id = parseInt( node.role_id );
//                                                await this.$http({
//                                                        url: "/role/remove/" + id,
//                                                        method: "post",
//                                                });
//                                                let i = this.roles.findIndex( item => item.role_id === node.role_id );
//                                                this.roles.splice( i, 1 );
		                                await this.removeRole(node.role_id);
						this.$message({
							message: `"${ this.edit.model.role_name }"删除成功`,
							type: "success",
						})
	                                })
                        },
                        async beginRoleFuncConfig(role_id){
				let roleFuncs = await this.$http({ url: '/role_function/list/' + role_id });
				let roelFuncIds = roleFuncs.reduce(( result, item ) => {
				        result.push(item.func_id);
				        return result;
				}, []);
				this.updateTreeData(roelFuncIds);

				this.edit2.model.role_func_ids = "";
                                this.edit2.model.role_id = role_id;

                                this.edit2.isEdit = true;
                        },
                        switchChangeHandler( node ){
				if( node.func_key === "" ) {                    //非叶子节点
				        node.children && node.children.forEach( item => item.open = node.open );
				}else{                                                          //叶子节点
				        let parent = this.edit2.treeData.find( item => item.func_id === node.func_fid );

                                        if( parent ) parent.open = parent.children.some( item => item.open );
				}
		        },
                        async roleFuncConfig(){
                                //发ajax之前统计树中所有open的节点的func_id
				let func_ids = [] ;
				this.edit2.treeData.forEach( item => {
				     if( item.open ) func_ids.push( item.func_id );
				     item.children && item.children.forEach( item2 => {
				             if( item2.open ) func_ids.push( item2.func_id );
				     } )
				} );
				this.edit2.model.role_func_ids = func_ids.join(',');
	                        //发ajax
				await this.$http({
					method: "post",
					url: "/role_function/config",
					data: this.edit2.model
				});
	                        //ajax成功之后页面的相应变化
	                        this.edit2.isEdit = false;
	                        this.$message( { message: "角色功能分配成功!" , type: "success" } )
                        },
	        },
	        watch:{
	                listToTree(){
	                        this.edit2.isEdit = false;
	                        this.updateTreeData([]);
	                }
	        }
        }
</script>

<style lang="stylus" type="text/stylus" scoped>
	.el-col
		margin-top: 20px
		.el-card
			position: relative
			text-align: center
			padding: 10% 0
			background-color: lightblue
			color: #fff
			font-size: 20px
			font-weight: bolder
			cursor: pointer
			&.btn-add
				background-color: transparent
				color: #0094ff
				border: 2px dashed #0094ff
			.button-wrapper
				position: absolute
				right: 10px
				bottom: 0
				.el-button
					font-size: 20px
					color: #eee
	.custom-tree
		width: 300px
		margin: 20px 0 50px 50px
		span.custom-tree-node
			flex: 1
			display: flex
			justify-content: space-between
			align-items: center
			&.parent
				padding-right: 40px
				color: #0094ff

	.flexRole
		padding 0 15px
		box-sizing border-box
		display flex
		flex-direction column
		height: 380px
		h3
			flex-shrink 0
			padding-left 20px
		.el-tree
			flex: 1
			overflow: auto
			&::-webkit-scrollbar
				display: none
		.drawer-footer
			text-align: center
			flex-shrink 0


</style>