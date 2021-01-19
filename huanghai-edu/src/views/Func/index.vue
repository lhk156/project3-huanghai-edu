<template>
	<div>
		<el-tree :data = "treeData" default-expand-all class="custom-tree" :expand-on-click-node="false">
			<span class="custom-tree-node" slot-scope="{ node, data }">
				<span v-text="data.func_name" :class="{ root: data.func_id === 0, unleaf: data.func_key === '', leaf: data.func_key !== '' }"></span>
				<span>
					<el-button type="text" v-if="data.func_key === ''" @click="beginAdd(data)"><i class="el-icon-plus"></i></el-button>
					<el-button type="text" v-if="data.func_id != 0" @click="beginUpdata(data)"><i class="el-icon-edit"></i></el-button>
					<el-button type="text" v-if="[0, 44, 45].indexOf(data.func_id) === -1"
					           :disabled="typeof(data.children) != 'undefined'" @click="remove(data)">
						<i class="el-icon-delete"></i>
					</el-button>
				</span>
			</span>
		</el-tree>
		<el-dialog :modal="false"
			:visible.sync = "edit.isEdit" :title=" edit.mode? '系统功能维护-新增' : '系统维护-编辑'" :show-close="false" :close-on-click-modal="false" width="600px">
			<el-form label-width="140px" :model="edit.model" :rules="edit.rules" ref="form">
				<el-form-item label="系统功能类型："  v-model="edit.isLeaf">
					<el-radio v-model="edit.isLeaf" :label="false" :disabled="!( edit.mode && edit.model.func_fid === 0)">非叶子功能节点</el-radio>
					<el-radio v-model="edit.isLeaf" :label="true" :disabled="!( edit.mode && edit.model.func_fid === 0)">叶子功能节点</el-radio>
				</el-form-item>
				<el-form-item label="父节点名称：" >
					<el-select v-model="edit.model.func_fid" :disabled="edit.mode || !edit.isLeaf">
						<el-option v-for="item in selectData"
						           :key="item.value"
						           :value="item.value"
						           :label="item.label">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="系统功能名称：" prop="func_name">
					<el-input v-model.trim="edit.model.func_name" placeholder="请输入系统功能名称"></el-input>
				</el-form-item>
				<el-form-item label="系统功能相关组件："  v-show="edit.isLeaf" prop="func_key">
					<el-select v-model="edit.model.func_key">
						<el-option v-for="item in Object.keys(views)" :key="item"
							:label="item" :value="item"
							:disabled="list.findIndex( func => func.func_key === item ) !== -1">
						</el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button type="primary" @click="save">保存</el-button>
				<el-button @click="edit.isEdit = false">取消</el-button>
			</span>
		</el-dialog>

	</div>
</template>

<script type="text/ecmascript-6">
	import views from '../../views';
	//仓库数据映射
	import { createNamespacedHelpers } from 'vuex';
	let { mapState, mapGetters, mapActions } = createNamespacedHelpers("func");

        export default {
                name: "Func",
	        data(){
                        return {
                                views,
//                                funcs: [],
				edit:{
                                        mode: true,        //true是新增，false是修改
                                        isEdit: false,        //是否进入编辑状态
					isLeaf: true,        //是否是叶子节点
					model: {
                                                func_id: 0,
						func_name: "",
						func_fid: -1,
						func_key: ""
					} ,                         //模型，初始值尽量避开有效值
					rules: {
						func_name:[
							{
							        validator: ( rule, value, callback ) => {
                                                                        //es6中解构赋值
							                let { func_name, func_id, func_fid } = this.edit.model;
							                if( value.length === 0 )
							                        callback( new Error("*功能名称不能为空") );
							                else if( value.length < 2 || value.length > 50 )
							                        callback( new Error("*功能名称长度为2-50") );
							                else if( this.list.some( item => item.func_id !== func_id && item.func_name === func_name && item.func_fid === func_fid ) )
							                        callback( new Error("*功能名称在当前父级中已经存在") );
							                else
							                        callback();
							        },
								trigger: "blur"
							}
						],
						func_key:[
							{
							        validator: ( rule, value, callback ) => {

							                if( this.edit.mode && this.edit.isLeaf && value === "" )
							                        callback ( new Error("*叶子节点，必须绑定组件") );
							                else
							                        callback()
							        },
								trigger: "blur"
							}
						]
					}
				},
                        }
	        },
	        computed: {
		        ...mapState(["list"]),
		        ...mapGetters(["listToTree"]),
                        treeData(){
				return [{
				        func_id: 0,
					func_name: "Root",
					func_key: "",
					func_fid: -1,
					children: this.listToTree,
				}];
                        },
		        selectData(){
                                let result = [{ label: "Root", value: 0 }];
                                this.list.filter( item => item.func_key === "" ).forEach( item => {
                                        result.push({ label: item.func_name, value: item.func_id })
                                } );
                                return result;
		        },
                },
	        created(){
//			this.$store.dispatch( "func/init" );
		        this.init();
	        },
		methods:{
			...mapActions(["init", "addFunc", "removeFunc", "updateFunc"]),
	                remove( node ){
		                this.$confirm(`你确定要删除"${node.func_name}"节点吗?`, '警告', { type: "warning" })
			                .then( async () => {
//		                                await this.$store.dispatch( 'func/removeFunc', node.func_id );
				                await this.removeFunc(node.func_id);
		                                this.$message({
			                                message: `"${node.func_name}"节点删除成功，请刷新页面，启用新版菜单`,
			                                type: "success"
		                                })
			                })
			                .catch(() => {})
	                },
                        beginAdd( parentNode ){
	                        this.$refs.form && this.$refs.form.resetFields();        //重置表单
	                        this.edit.mode = true;
				this.edit.isLeaf = parentNode.func_id !== 0;
				this.edit.model.func_id = 0;
                                this.edit.model.func_name = "";
                                this.edit.model.func_key = "";
                                this.edit.model.func_fid = parentNode.func_id;
//				打开对话框开始新增
				this.edit.isEdit = true;
                        },
                        beginUpdata( node ){
                                this.$refs.form && this.$refs.form.resetFields();        //重置表单
                                this.edit.mode = false;
                                this.edit.isLeaf = node.func_key !== "";
                                this.edit.model.func_id = node.func_id;
                                this.edit.model.func_name = node.func_name;
                                this.edit.model.func_key = node.func_key;
                                this.edit.model.func_fid = node.func_fid;
//				打开对话框开始新增
                                this.edit.isEdit = true;
                        },
			save(){
				this.$refs.form.validate( async valid  => {
					if( !valid ) return;
                                        if( this.edit.mode ){
                                                //新增
//                                                await this.$store.dispatch( "func/addFunc", Object.assign({}, this.edit.model) );
	                                        await this.addFunc(Object.assign({}, this.edit.model));
                                                this.$message({
                                                        message: `"${this.edit.model.func_name}"节点新增成功，请刷新页面，启用新版菜单`,
                                                        type: "success"
                                                });
                                        }else{
                                                //修改
//                                                await this.$store.dispatch( "func/updateFunc", Object.assign({}, this.edit.model) );
                                                await this.updateFunc( Object.assign({}, this.edit.model) );
	                                        this.$message({
                                                        message: `"${this.edit.model.func_name}" 节点修改成功，请刷新页面，启用新版菜单`,
                                                        type: "success"
                                                });
                                        }
                                        this.edit.isEdit = false;
				});


                        }
		}
        }
</script>

<style lang="stylus" type="text/stylus" scoped>
	.custom-tree
		width: 500px
		span.custom-tree-node
			flex: 1
			display: flex
			justify-content: space-between
			align-items: center
			span.root
				color: brown !important
				font-weight: bolder
			span.unleaf
				color: green
			span.leaf
				color: #0094ff

</style>