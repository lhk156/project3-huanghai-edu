<template>
	<el-container>
		<el-header style="min-width: 1100px">
			<el-form inline>
				<el-form-item label="班级名称">
					<el-input prefix-icon="el-icon-search" placeholder="请输入搜索内容"
					v-model="search.cls_name" clearable @change="searchGetData()"></el-input>
				</el-form-item>
				<el-form-item label="班级专业">
					<el-select v-model="search.cls_dic_id_major" @change="searchGetData()">
						<el-option label=" - 所有专业 - " :value="0"></el-option>
						<el-option v-for="item in proList" :key="item.dic_id"
						:value="item.dic_id" :label="item.dic_name"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="班级状态">
					<el-select v-model="search.cls_status" @change="searchGetData()">
						<el-option label=" - 所有 - " :value="0"></el-option>
						<el-option label="开课中" :value="1"></el-option>
						<el-option label="未开课" :value="2"></el-option>
						<el-option label="结课" :value="3"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="success" size="small" @click="beginAdd"><i class="el-icon-plus"></i>新增</el-button>
				</el-form-item>
			</el-form>
		</el-header>
		<el-main>
			<el-table :data="list" border stripe size="small">
				<el-table-column label="#" type="index" fixed></el-table-column>
				<el-table-column label="班级名称" prop="cls_name" fixed></el-table-column>
				<el-table-column label="班级专业">
					<template slot-scope="{row}">
						<span v-text=" proList.length > 0 && proList.find( item => item.dic_id === row.cls_dic_id_major ).dic_name"></span>
					</template>
				</el-table-column>
				<el-table-column label="教学老师">
					<template slot-scope="{row}">
						<span v-text="teacherList.length > 0 && teacherList.find(item => item.stf_id === row.cls_stf_id_teacher).stf_name"></span>
					</template>
				</el-table-column>
				<el-table-column label="教务老师">
					<template slot-scope="{row}">
						<span v-text="adminList.length > 0 && adminList.find(item => item.stf_id === row.cls_stf_id_admin).stf_name"></span>
					</template>
				</el-table-column>
				<el-table-column label="就业老师">
					<template slot-scope="{row}">
						<span v-text="jobList.length > 0 && jobList.find(item => item.stf_id === row.cls_stf_id_job).stf_name"></span>
					</template>
				</el-table-column>
				<el-table-column label="教室">
					<template slot-scope="{row}">
						<span v-text=" row.cls_clsr_id ? classroomList.length > 0 && classroomList.find( item => item.clsr_id === row.cls_clsr_id ).clsr_name : '' "></span>
					</template>
				</el-table-column>
				<el-table-column label="开课时间" prop="cls_begin" width="100px"></el-table-column>
				<el-table-column label="结课时间" prop="cls_end" width="100px"></el-table-column>
				<el-table-column label="班级状态" >
					<template slot-scope="{ row }">
						<span v-if="row.cls_begin === null" style="color: green">未开课</span>
						<span v-else-if="row.cls_end === null" style="color: orange">开课中</span>
						<span v-else style="color: #b0b0b0">结课</span>
					</template>
				</el-table-column>
				<el-table-column label="备注" width="200px">
					<template slot-scope="{row}">
						<span v-text="row.cls_remark ? `${ row.cls_remark }` : '暂无相关备注...'"></span>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="200px" fixed="right">
					<template slot-scope="{row}">
						<el-button type="primary" size="mini" @click="beginUpdate(row)"><i class="el-icon-edit"></i>修改</el-button>
						<el-button type="success" size="mini" @click="beginStart(row)" v-show="row.cls_begin === null">开课</el-button>
						<el-button type="danger" size="mini"  @click="endClass(row)" v-show="row.cls_begin !== null && row.cls_end === null">结课</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-main>
		<el-footer>
			<el-pagination
				@current-change="currentChangeHandler()"
				layout=" total, prev, pager, next, jumper "
				:current-page.sync="pagination.currentPage"
				:page-size.sync="pagination.pageSize"
				:total="total"
				background>
			</el-pagination>
		</el-footer>
		<el-dialog :visible.sync="edit.isEdit" :modal="false"
		           :show-close="false" size="400px" :title="edit.mode? '班级维护 - 新增' : '班级维护 - 修改'">
			<el-form :model="edit.model" :rules="edit.rules" ref="form" @validate="formValidateHandler">
				<el-form-item label="班级名称：" label-width="100px" prop="cls_name">
					<el-input v-model="edit.model.cls_name" placeholder="请输入班级名称"></el-input>
				</el-form-item>
				<el-form-item label="班级专业：" label-width="100px" prop="cls_dic_id_major">
					<el-select v-model="edit.model.cls_dic_id_major">
						<el-option label=" - 所有专业 - " :value="0"></el-option>
						<el-option v-for="item in proList" :key="item.dic_id"
						           :value="item.dic_id" :label="item.dic_name"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="教室" label-width="100px" v-show="edit.model.cls_status === 1">
					<el-select v-model="edit.model.cls_clsr_id">
						<el-option v-for="item in classroomList" :key="item.clsr_id" :value="item.clsr_id"
						           :label="item.clsr_name" :disabled="item.clsr_occupy === 1">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="教学老师：" label-width="100px" prop="cls_stf_id_teacher">
					<el-select v-model="edit.model.cls_stf_id_teacher">
						<el-option v-for="item in teacherList" :key="item.stf_id"
						:value="item.stf_id" :label="item.stf_name" :disabled="item.stf_invalid === 0"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="教务老师：" label-width="100px" prop="cls_stf_id_admin">
					<el-select v-model="edit.model.cls_stf_id_admin">
						<el-option v-for="item in adminList" :key="item.stf_id"
						           :value="item.stf_id" :label="item.stf_name" :disabled="item.stf_invalid === 0"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="就业老师：" label-width="100px" prop="cls_stf_id_job">
					<el-select v-model="edit.model.cls_stf_id_job">
						<el-option v-for="item in jobList" :key="item.stf_id"
						           :value="item.stf_id" :label="item.stf_name" :disabled="item.stf_invalid === 0"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="班级备注：" label-width="100px">
					<el-input type="textarea" v-model="edit.model.cls_remark" placeholder="请输入班级备注..."></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button type="primary" @click="save">保存</el-button>
				<el-button @click="edit.isEdit = false">取消</el-button>
			</span>
		</el-dialog>
		<el-dialog :visible.sync="edit.storingClass" :modal="false" :show-close="false" title="开课" width="450px">
			<el-form :model="edit.model">
				<el-form-item label="教室">
					<el-select v-model="edit.model.cls_clsr_id">
						<el-option v-for="item in classroomList" :key="item.clsr_id" :value="item.clsr_id"
						           :label="item.clsr_name" :disabled="item.clsr_occupy === 1">
						</el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button type="primary" @click="saveClass">保存</el-button>
				<el-button @click="edit.storingClass = false">取消</el-button>
			</span>
		</el-dialog>
	</el-container>
</template>

<script type="text/ecmascript-6">
	import {createNamespacedHelpers} from 'vuex';
	//自己的数据仓库
	let { mapState, mapActions} = createNamespacedHelpers('classdata');
	//字典仓库
	let { mapState: dicMapState } = createNamespacedHelpers('dictionary');
	//教室仓库
	let { mapState: classroomMapState , mapActions:classroomMapActions } = createNamespacedHelpers('classroom');

        export default {
                name: "Class",
	        data(){
			return{
                                teacherList: [],
				adminList: [],
				jobList: [],
				search:{
                                        cls_name: "",
                                        cls_dic_id_major: 0,
                                        cls_status: 0
				},
				edit:{
				        isEdit: false,
					mode: true,
					storingClass: false,                            //是否打开分班的对话框
					model:{
				                cls_id: 0,
                                                cls_name: "",
                                                cls_dic_id_major: null,
                                                cls_status: 0,
						cls_clsr_id: null,
						cls_stf_id_teacher: null,                  //教学老师
						cls_stf_id_admin: null,                    //教务老师
						cls_stf_id_job: null,                         //就业老师
						cls_begin: null,
						cls_end: null,
						cls_remark: null
					},
                                        rules:{
                                                cls_name:[
                                                        {
                                                                validator: async ( rule, value, callback ) => {
                                                                        if( !this.edit.mode  )
                                                                                callback();
                                                                        else if( !/^[0-9][a-zA-Z0-9]{2,19}$/.test(value)){
                                                                                callback( new Error("*班级名称长度3-20，且只能包含字母数字，必须以数字开头") );
                                                                        }
                                                                        else if( await this.$http({method: "post", url: "/class/valid_name", data: {cls_name: value}}) ){
                                                                                callback(new Error("*用户名已存在"));
                                                                        }
                                                                        else{
                                                                                callback();
                                                                        }
                                                                },
                                                                trigger: "blur"
                                                        }
                                                ],
                                                cls_dic_id_major: [{required: true, trigger: "blur", message: "必须选择一位老师"}],
                                                cls_stf_id_teacher: [{required: true, trigger: "blur", message: "必须选择一位老师"}],
                                                cls_stf_id_admin: [{required: true, trigger: "blur", message: "必须选择一位老师"}],
                                                cls_stf_id_job: [{required: true, trigger: "blur", message: "必须选择一位老师"}]
                                        }
				},
                                pagination:{
                                        currentPage: 1,
                                        begin: 0,
                                        pageSize: 5
                                },

			}
	        },
                computed:{
		        ...dicMapState({ "List" :"list"}),
                        ...mapState(["list","total"]),
	                ...classroomMapState({ "classroomList" : "list" }),
	                //专业列表
		        proList(){
		                return this.List.filter(item => item.dic_group_key === 'class_major')
		        }
	        },
	       async created(){
		        this.classroomInit();
	                this.getData();
	                //教学老师数组
		        this.$http({url: "/staff/listbycategory/" + 4}).then( list => this.teacherList = list );
		        //教务老师数组
                        this.$http({url: "/staff/listbycategory/" + 5}).then( list => this.adminList = list );
		        //就业老师数组
                        this.$http({url: "/staff/listbycategory/" + 6}).then( list => this.jobList = list );
	        },
                watch: {
                        "edit.isEdit"( newValue ){
                                if( !newValue ) delete this.userNameValidateResult;
                        }
                },
	        methods:{
	               //自己的数据仓库
		        ...mapActions(["init", "addClass", "updateClass"]),
		        //教室的数据仓库
		        ...classroomMapActions({ "classroomInit": 'init' }),
			//初始获取数据
			getData(){
		                this.init( Object.assign({},this.edit.model, this.pagination) )
			},
                        //分页器拿数据
                        currentChangeHandler(){
                                this.pagination.begin = (this.pagination.currentPage - 1) * 5;
                                this.init(Object.assign({} ,this.edit.model, this.pagination, this.search) )
                        },
                        //搜索获取数据
                        searchGetData(){
                                this.init(Object.assign({} ,this.edit.model, this.pagination, this.search) )
                        },
		        //开始新增
                        beginAdd(){
                                this.$refs.form && this.$refs.form.resetFields();        //重置表单
			        this.edit.mode = true;
			        this.edit.model.cls_id = 0;
			        this.edit.model.cls_name = "";
			        this.edit.model.cls_dic_id_major = null;
			        this.edit.model.cls_clsr_id = null;
			        this.edit.model.cls_stf_id_teacher = null;
			        this.edit.model.cls_stf_id_admin = null;
			        this.edit.model.cls_stf_id_job = null;
			        this.edit.model.cls_begin = null;
			        this.edit.model.cls_end = null;
			        this.edit.model.cls_remark = null;
			        this.edit.isEdit = true;
                        },
		        //开始修改
                        beginUpdate(node){
                                this.$refs.form && this.$refs.form.resetFields();        //重置表单
                                this.edit.mode = false;
                                this.edit.model.cls_id = node.cls_id;
                                this.edit.model.cls_name = node.cls_name;
                                this.edit.model.cls_dic_id_major = node.cls_dic_id_major;
                                this.edit.model.cls_clsr_id = node.cls_clsr_id;
                                this.edit.model.cls_stf_id_teacher = node.cls_stf_id_teacher;
                                this.edit.model.cls_stf_id_admin = node.cls_stf_id_admin;
                                this.edit.model.cls_stf_id_job = node.cls_stf_id_job;
                                this.edit.model.cls_begin = node.cls_begin;
                                this.edit.model.cls_end = node.cls_end;
                                this.edit.model.cls_remark = node.cls_remark;
                                this.edit.isEdit = true;
                        },
                        formValidateHandler( prop, valid, message ){
                                if( prop === "cls_name" ) this.classNameValidateResult = valid;
                        },
		        //保存
		        async save(){
                                if( this.edit.mode ){
                                        if( this.classNameValidateResult === false )  return;                    //验证了，没通过
                                        if( typeof this.classNameValidateResult === 'undefined'){        //没有验证过，用户直接点的确定
                                                await new Promise( resolve => this.$refs.form.validateField("cls_name", message => {
                                                        if( message === '' ) resolve();
                                                }) )
                                        }
                                }
				let arr = ["cls_dic_id_major", "cls_stf_id_teacher", "cls_stf_id_admin", "cls_stf_id_job"];
				Promise.all(arr).then( arr.forEach( async item => {
                                        await new Promise(resolve => this.$refs.form.validateField( item , message => {
				                if ( message === '' ) resolve();
				        }))
				}));

                                if( this.edit.mode ) {
					 await this.addClass(Object.assign({}, this.edit.model));
					 this.$message({
						 message: `"${ this.edit.model.cls_name }"新增成功`,
						 type: "success"
					 })
                                }else{
                                        await this.updateClass(Object.assign({}, this.edit.model));
                                        this.$message({
                                                message: `"${ this.edit.model.cls_name }"修改成功`,
                                                type: "success"
                                        })
                                }
                                this.edit.isEdit = false;
                        },
		        //开课
                        beginStart(node){
		                this.$confirm(`确定要对"${node.cls_name}"开课吗`, '提示',{
                                        type: 'warning'
		                })
			                .then( ()=> {
                                                this.edit.model.cls_id = node.cls_id;
                                                this.edit.storingClass = true;
			                })
			                .catch(()=> {});

                        },
		        //保存开课
		        async saveClass(){
                                let time = await this.$http({
                                        method: "post",
                                        url: "/class/begin",
                                        data: {
                                                cls_id : this.edit.model.cls_id,
	                                        cls_clsr_id: this.edit.model.cls_clsr_id
                                        }
                                });
                                this.edit.storingClass = false;
                                //替换掉时间
                                this.list.find( item => item.cls_id === this.edit.model.cls_id  ).cls_begin = time;
                                //替换掉教室
                                this.list.find( item => item.cls_id === this.edit.model.cls_id ).cls_clsr_id = this.edit.model.cls_clsr_id;
				this.classroomList.find( item => item.clsr_id === this.edit.model.cls_clsr_id ).clsr_occupy = 1;
		        },
		        //结课
                         endClass(node){
		                this.$confirm(`确定要对“${node.cls_name}”结课吗`, '提示', { type: "warning" })
			                .then(async()=>{
                                                let time = await this.$http({
                                                        method: "post",
                                                        url: "/class/end",
                                                        data: {
                                                                cls_id: node.cls_id
                                                        }
                                                });
                                                this.list.find( item => item.cls_id === node.cls_id  ).cls_end = time;
                                                this.classroomList.find( item => item.clsr_id === this.edit.model.cls_clsr_id ).clsr_occupy = 0;
			                })
			                .catch(()=>{})

                        }
	        }
        }
</script>

<style lang="stylus" type="text/stylus" scoped>
	.el-container
		position absolute
		left 0
		top 0
		display flex
		flex-direction column
		width 100%
		height 100%
		justify-content space-between
</style>