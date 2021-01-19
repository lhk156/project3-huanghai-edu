<template>
	<el-container>
		<el-header>
			<el-form inline v-model="edit.model">
				<el-form-item label="员工名称">
					<el-input v-model="search.stf_name" prefix-icon="el-icon-search" clearable @change="searchGetData()"></el-input>
				</el-form-item>
				<el-form-item label="员工类型">
					<el-select v-model="search.stf_category" @change="searchGetData()">
						<el-option :value="0" label="- 所有类型 -"></el-option>
						<el-option v-for="item in jobCategoryList" :key="item.dic_id" :label="item.dic_name" :value="item.dic_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" icon="el-icon-plus" size="small" @click="begainAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-header>
		<el-main>
			<el-table :data="list" border stripe size="small">
				<el-table-column label="#" fixed width="50px" type="index" ></el-table-column>
				<el-table-column label="姓名" prop="stf_name" width="100px"></el-table-column>
				<el-table-column label="职务名称" width="100px" >
					<template slot-scope="{row}">
						<span v-text="jobCategoryList.find( item => item.dic_id === row.stf_category ).dic_name"></span>
					</template>
				</el-table-column>

				<el-table-column label="备注" >
					<template slot-scope="scope">
						<span v-if="scope.row.stf_remark !== null" v-text="scope.row.stf_remark"></span>
						<span v-else class="gray">暂无相关备注</span>
					</template>
				</el-table-column>

				<el-table-column label="员工状态"width="100px" >
					<template slot-scope="scope">
						<span v-if="scope.row.stf_invalid === 1">在职</span>
						<span v-else="scope.row.stf_invalid === 0" style="color: red">离职</span>
					</template>
				</el-table-column>

				<el-table-column label="操作" width="170px">
					<template slot-scope="scope">
						<el-button type="primary" size="mini" @click="begainUpdata(scope.row)">编辑</el-button>
						<el-button type="danger" size="mini" v-show="scope.row.stf_invalid === 1" @click="resign(scope.row)">离职</el-button>
						<el-button type="warning" size="mini" v-show="scope.row.stf_invalid === 0" @click="entry(scope.row)">入职</el-button>
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
		<el-dialog :visible.sync = "edit.isEdit" :modal="false" :show-close="false"
		:title="edit.mode? '员工维护 - 新增' : '员工维护 - 编辑'" width="500px">
			<el-form  :model="edit.model" ref="form" :rules="edit.rules">
				<el-form-item label="员工名称" label-width="80px" prop="stf_name">
					<el-input v-model.trim="edit.model.stf_name" clearable >

					</el-input>
				</el-form-item>
				<el-form-item label="*员工类型" label-width="80px" prop="stf_class">
					<el-select v-model="edit.model.stf_category">
						<el-option :value="0" label="- 所有类型 -"></el-option>
						<el-option v-for="item in jobCategoryList" :key="item.dic_id" :label="item.dic_name" :value="item.dic_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="*员工备注" label-width="80px">
					<el-input type="textarea" autosize clearable v-model="edit.model.stf_remark">

					</el-input>
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button type="primary" @click="save">保存</el-button>
				<el-button @click="edit.isEdit = false">取消</el-button>
			</span>
		</el-dialog>
	</el-container>
</template>

<script type="text/ecmascript-6">
	import { createNamespacedHelpers } from 'vuex';
	let { mapState, mapActions } = createNamespacedHelpers('staff');
	let { mapState: dicMapState } = createNamespacedHelpers("dictionary");

        export default {
                name: "",
	        data(){
                        return {
                                edit:{
                                        isEdit: false,
	                                mode: true,
	                                model:{
                                                stf_category: 0,
                                                stf_name: "",
                                                stf_remark: null,
                                                stf_id: -1,
                                                stf_invalid: 1
	                                },
	                                rules: {
                                                stf_name:[
	                                                { required: true, message: "用户名字不能为空", trigger: "blur" },
	                                                { min: 2, max: 20, message: "用户名字长度应在2-20", trigger: "blur" }
                                                ],
                                                stf_class:[
	                                                {
                                                                validator : ( rule, value, callback ) => {
                                                                        if( value === 0 )
                                                                                callback( new Error("请选择员工类型") );
                                                                        else
                                                                                callback();
                                                                },
                                                                trigger: "blur"
	                                                }
                                                ]
	                                }
                                } ,
	                        search:{
                                        stf_category: 0,
                                        stf_name: "",
	                        },
                                pagination:{
                                        currentPage: 1,
                                        begin: 0,
                                        pageSize: 5
                                }
                        }
	        },
	        created(){
			this.getData();
	        },
	        computed: {
		        ...mapState(["list","total"]),
		        ...dicMapState({ "dicList": 'list' }),
                        jobCategoryList(){
                                return this.dicList.filter(item => item.dic_group_key === 'staff_category')
                        }
	        },
	        methods:{
		        ...mapActions(["init", "addStaff", "updateStaff","staffResign", "staffEntry" ]),

		        //分页器拿数据
                        currentChangeHandler(){
		                this.pagination.begin = (this.pagination.currentPage - 1) * 5;
                                this.init(Object.assign({} ,this.edit.model, this.pagination, this.search) )
                        },
			//搜索获取数据
		        searchGetData(){
                                this.init(Object.assign({} ,this.edit.model, this.pagination, this.search) )
		        },
		        //获取数据
		        getData(){
                                this.init(Object.assign({} ,this.edit.model, this.pagination) )
		        },
                        begainAdd(){
                                this.$refs.form && this.$refs.form.resetFields();        //重置表单
		                this.edit.mode = true;
		                this.edit.model.stf_name = "";
		                this.edit.model.stf_remark = null;
				this.edit.model.stf_category = 0;
				this.edit.isEdit = true;
		        },
		        begainUpdata(node){
                                this.$refs.form && this.$refs.form.resetFields();        //重置表单
                                this.edit.mode = false;
                                this.edit.model.stf_name = node.stf_name;
                                this.edit.model.stf_remark = node.stf_remark;
                                this.edit.model.stf_id = node.stf_id;
                                this.edit.model.stf_category = node.stf_category;
                                this.edit.isEdit = true;
		        },
                        async save(){
		                //判断是新增还是修改
                                this.$refs.form.validate( async valid  =>{
                                        if(!valid) return;
                                        if(this.edit.mode){                   //新增
                                                await  this.addStaff(Object.assign({},this.edit.model));
                                                this.$message({
                                                        message: `"${this.edit.model.stf_name}"节点新增成功`,
                                                        type: "success"
                                                });
                                        }else{
                                                await  this.updateStaff(Object.assign({},this.edit.model));
                                                this.$message({
                                                        message: `"${this.edit.model.stf_name}"节点更改成功`,
                                                        type: "success"
                                                });
                                        }
                                        this.edit.isEdit = false;
                                });
                        },
		        //离职
                        resign( staff ){
                                this.$confirm(`你确定要让"${staff.stf_name}"离职吗?`, '警告', { type: "warning" })
                                        .then( async () => {
                                                await this.staffResign(staff);
                                                this.$message({
                                                        message: `"${staff.stf_name}"离职成功`,
                                                        type: "success"
                                                });
                                        }).then( () => {})

                        },
		        //入职
                        entry( staff ){
                                this.$confirm(`你确定要让"${staff.stf_name}"入职吗?`, '警告', { type: "warning" })
                                        .then( async () => {
                                                await this.staffEntry(staff);
                                                this.$message({
                                                        message: `"${staff.stf_name}"入职成功`,
                                                        type: "success"
                                                });
                                        }).then( () => {})
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
	.gray
		color #b0b0b0
</style>