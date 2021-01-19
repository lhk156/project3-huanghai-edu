<template>
	<div class="rolesclass">
		<el-form :model="edit.model" class="form1">
			<el-form-item label="用户名称：">
				<el-input v-model="search.user_name" placeholder="请输入搜索内容" @change="getData()" clearable>
					<i  slot="prefix" class="el-input__icon el-icon-search"></i>
				</el-input>
			</el-form-item>
			<el-form-item label="用户角色："  >
				<el-select v-model="search.role_id" @change="getData()">
					<el-option :value="-1" label="- 全部 -"></el-option>
					<el-option :value="0" label="- 无角色 -"></el-option>
					<el-option v-for="item in roleList"
					           :key="item.role_id"
						   :label="item.role_name"
						   :value="item.role_id"></el-option>

				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button @click="beginAdd" type="primary" icon="el-icon-plus" size="small">新增</el-button>
			</el-form-item>
		</el-form>
		<el-table :data="usersList"  border stripe size="small" height="320px">
			<el-table-column label="#" fixed width="50px" type="index" :index="indexMethod"></el-table-column>
			<el-table-column label="姓名" prop="user_name" fixed width="120px"></el-table-column>
			<el-table-column label="角色"  fixed width="120px" >
				<template slot-scope="{ row }">
					<span v-if="row.role_id !== null && roleList.length > 0" v-text="roleList.find( item => item.role_id === row.role_id ).role_name"></span>
					<span  v-else class="no-role">暂无角色</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" fixed>
				<template slot-scope="scope">
					<el-button type="primary" size="mini" icon="el-icon-edit-outline" @click="begainUpdata(scope.$index)">编辑</el-button>
					<el-button type="danger" size="mini" icon="el-icon-delete" @click="remove(scope.$index)">删除</el-button>
					<el-popover
						placement="right"
						width="370"
						title="角色分配">
						<el-form inline>
							<el-form-item label="角色：">
								<el-select v-model="edit.model.role_id">
									<el-option :value="0" label="- 无角色 -"></el-option>
									<el-option v-for="item in roleList"
									           :key="item.role_id"
									           :label="item.role_name"
									           :value="item.role_id"></el-option>
								</el-select>
							</el-form-item>
							<el-form-item>
								<el-button plain @click="distribution">分配</el-button>
							</el-form-item>
						</el-form>
						<el-button slot="reference" type="success" size="mini" icon="el-icon-setting" @click="begainDistribution(scope.row)">角色分配</el-button>
					</el-popover>
				</template>
			</el-table-column>
		</el-table>
		<el-pagination
			@current-change="getData(false)"
			@size-change="getData()"
			layout=" total, prev, pager, next, jumper, ->, sizes "
			:page-sizes="[ 5, 8, 10, 13, 15 ]"
			:current-page.sync="pagination.currentPage"
			:page-size.sync="pagination.pageSize"
			:total="pagination.total"
			background>
		</el-pagination>
		<el-dialog :visible.sync = "edit.isEdit" :title=" edit.mode? '用户编辑 - 新增' : '用户编辑  - 修改' " :modal="false"
		           :show-close="false"  width="500px">
			<el-form :model="edit.model" label-width="70px" ref="form"  :rules="edit.rules" status-icon @validate="formValidateHandler">
				<el-form-item label="*用户名" v-show="edit.mode" prop="user_name">
					<el-input placeholder="请输入用户名" v-model.trim="edit.model.user_name">

					</el-input>
				</el-form-item>
				<el-form-item label="*密码" prop="user_pwd">
					<el-input placeholder="请输入密码" v-model="edit.model.user_pwd">

					</el-input>
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button type="primary" @click="save" >保存</el-button>
				<el-button @click="edit.isEdit = false">取消</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script type="text/ecmascript-6">
	import { createNamespacedHelpers } from 'vuex';
	let { mapState } = createNamespacedHelpers("role");

        export  default {
                name: "User",
		data(){
	                return {
				usersList:[],                   //用户数据存放的数组
		                edit:{
                                        isEdit: false,          //是否进入编辑状态，默认false
			                mode: true,             //标识是新增还是修改，默认新增
			                model: {                        //初始配置模板
	                                        user_name : "",
                                                user_pwd: "",
				                role_id: null
                                        },
                                        rules:{
                                                user_name:[
	                                                {
	                                                        validator: async ( rule, value, callback ) => {
	                                                                if( !this.edit.mode ) {
                                                                                callback();
	                                                                }
	                                                                else if(!/^[a-zA-Z][a-zA-Z0-9]{2,19}$/.test(value)){
                                                                                callback( new Error("*用户名长度3-20，且只能包含字母数字，不能以数字开头") );
	                                                                }

		                                                        else if( await this.$http({method: "post", url: "/user/valid_name", data: {user_name: value}}) ){
                                                                                callback(new Error("*用户名已存在"));
	                                                                }
	                                                                else{
                                                                                callback();
	                                                                }
	                                                        },
                                                                trigger: "blur"
	                                                }
                                                ],
	                                        user_pwd: [
		                                        { required: true, message: "*密码不能为空", trigger: "blur" },
		                                        { min: 3, max: 20, message: "*密码长度3-20", trigger: "blur" }
	                                        ]
                                        }
		                },
		                search: {
                                        user_name : "",
                                        role_id: -1,
		                },
		                pagination:{
                                        total: 0,                       //一共多少条数据
                                        currentPage: 1,
                                        pageSize: 5,
		                }
	                }
		},
		async created(){
			this.$store.dispatch("role/init");
                        this.getData();
		},
	        computed:{
                        ...mapState({"roleList" :"list"}),
	        },
	        watch: {
		        "edit.isEdit"( newValue ){
		                if( !newValue ) delete this.userNameValidateResult;
		        }
	        },
                methods: {
		        //获取数据
	                async getData( fromPage1 = true ){
                                if(fromPage1) this.pagination.currentPage = 1;
                                let backdata = await this.$http({
                                        method: "post",
                                        url: "/user/list",
                                        data: {
	                                        ...this.search,
                                                begin: this.pagination.pageSize * ( this.pagination.currentPage - 1 ),
                                                pageSize: this.pagination.pageSize
                                        }
                                });
                                this.pagination.total = backdata.total;
                                this.usersList = backdata.list;
	                },

		        //表格自带的index
                        indexMethod(index){
                                return index+1;
                        },

	                //开始新增
	                beginAdd(){
                                this.$refs.form && this.$refs.form.resetFields();        //重置表单
                                this.edit.mode = true;
                                this.edit.model.user_name = "";
                                this.edit.model.user_pwd = "";
                                this.edit.model.role_id = null;
                                this.edit.isEdit = true;
	                },
	                //开始编辑，主要是修改密码
                        begainUpdata(index){
                                this.$refs.form && this.$refs.form.resetFields();        //重置表单
                                this.edit.mode = false;
                                this.edit.model.user_name = this.usersList[index].user_name;
                                this.edit.model.user_pwd = this.usersList[index].user_pwd;
                                this.edit.model.role_id = this.usersList[index].role_id;
                                this.edit.isEdit = true;
                        },
                        formValidateHandler( prop, valid, message ){
                                if( prop === "user_name" ) this.userNameValidateResult = valid;
                        },
	                //保存
                        async save(){
				if( this.edit.isEdit ){
				        if( this.userNameValidateResult === false )  return;                    //验证了，没通过
					if( typeof this.userNameValidateResult === 'undefined'){        //没有验证过，用户直接点的确定
						await new Promise( resolve => this.$refs.form.validateField("user_name", message => {
						        if( message === '' ) resolve();
						}) )
					}
				}
                                await new Promise( resolve => this.$refs.form.validateField("user_pwd", message => {
                                        if( message === '' ) resolve();                                                                //验证密码
                                }) );
	                        //代码能执行到这里，说明用户名和密码已经通过了验证，可以执行后续真正的修改与新增操作了
                                //判断是新增还是修改
                                if( this.edit.mode ){
                                        await this.$http({
                                                method: "post",
                                                url: '/user/add',
                                                data: this.edit.model
                                        });
                                        this.usersList.push(Object.assign({}, this.edit.model));
                                        this.pagination.total += 1;
                                        this.$message({
                                                message: `"${this.edit.model.user_name}"节点新增成功`,
                                                type: "success"
                                        });
                                }else{
                                        await this.$http({
                                                method: "post",
                                                url: '/user/change_pwd',
                                                data: this.edit.model
                                        });
                                        let i = this.usersList.findIndex( item => item.user_name === this.edit.model.user_name );
                                        this.usersList.splice( i, 1, Object.assign( {}, this.edit.model ) );
                                        this.$message({
                                                message: `"${this.edit.model.user_name}"节点修改成功`,
                                                type: "success"
                                        });
                                }

                                this.edit.isEdit = false;

                        },
	                //删除
                        async remove(index){
                                let nodeName = this.usersList[index].user_name;
                                this.$confirm(`你确定要删除"${nodeName}"节点吗?`, '警告', { type: "warning" })
	                                .then( async () => {
                                                await this.$http({
                                                        method: "post",
                                                        url: "/user/remove/" + nodeName,
                                                });
                                                this.usersList.splice(index,1);
                                                this.pagination.total -= 1;
                                                this.$message({
                                                        message: `"${nodeName}"节点删除成功`,
                                                        type: "success"
                                                });
	                                })
	                                .catch(() => {})

                        },

	                //角色功能分配
                        async begainDistribution(user){
                                this.edit.model.user_name = user.user_name;
                                this.edit.model.role_id = user.role_id || 0;
                        },
                        async distribution(){
	                        await this.$http({ method: "post", url: "/user/config_role", data: this.edit.model });
	                        let target = this.usersList.find(item => item.user_name === this.edit.model.user_name);
	                        target.role_id = this.edit.model.role_id || null;
	                        this.$message({ message: `用户：${this.edit.model.user_name}, 角色分配成功`, type: "success" })
                        }
                },

	}
</script>

<style lang="stylus" type="text/stylus" scoped>
	.form1
		display: flex
		.el-form-item
			display: flex
			margin: 10px
	span.no-role
		color: #b0b0b0

</style>