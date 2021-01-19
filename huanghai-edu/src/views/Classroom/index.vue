<template>
	<div>
		<div class="spot">
			<i class="green"></i><span>闲置</span>
			<i class="orange"></i><span>使用中</span>
		</div>
		<el-row :gutter="20">
			<el-col v-for="item in list" :key="item.clsr_id" :span="6">
				<el-card shadow="hover" :class="item.clsr_occupy === 1 ? 'orange' : 'green'"  >
					<span v-text="item.clsr_name"></span>
					<div class="btn-style">
						<el-button class="el-icon-edit-outline" type="text" @click="begainUpdata(item)"></el-button>
						<el-button class="el-icon-delete" type="text" @click="romove(item.clsr_id)" v-show="!item.clsr_occupy"></el-button>
					</div>
				</el-card>
			</el-col>
			<el-col :span="6" >
				<el-card class="btn-add" @click.native.stop="beginAdd">
					<i class="el-icon-plus"></i>
					<div class="btn-style"></div>
				</el-card>
			</el-col>
		</el-row>
		<el-dialog :visible.sync="edit.isEdit" :modal="false" :show-close="false" width="450px" :title="edit.mode? '教室管理-新增' : '教室管理-修改'">
			<el-form :model="edit.model" :rules="edit.rules" ref="form">
				<el-form-item label="教室名字" prop="clsr_name" label-width="70px">
					<el-input clearable v-model="edit.model.clsr_name" style="width: 320px"></el-input>
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
        import {createNamespacedHelpers} from 'vuex';
        let { mapState: mapStateFromClassroom, mapActions: mapActionsFromClassroom } = createNamespacedHelpers('classroom');
        export default {
                name: "Classroom",
	        data(){
			return  {
				edit: {
					isEdit: false,                           //是否开始编辑
					mode: true,                             //表示新增还是
					model:{
                                                clsr_id: 0,
                                                clsr_name: "",
                                                clsr_occupy: 0
					},
					rules:{
                                                clsr_name:[
                                                        {
                                                                validator: ( rule, value, callback )=>{
	                                                                if( value.length === 0 )
	                                                                        callback( new Error("教室名称不能为空") );
		                                                        else if ( value.length < 2 || value.length > 20 )
		                                                                callback( new Error("教室名称长度2-10"));
		                                                        else if( this.list.some(item =>  item.clsr_name === this.edit.model.clsr_name ) )
                                                                                callback( new Error("教室名称不能重复"));
		                                                        else
		                                                                callback();
	                                                        },
                                                                trigger: "blur"
                                                        }
                                                ]
					}
				},

			}
	        },
                created() {
                        this.init();
                },
	        computed:{
		        ...mapStateFromClassroom(["list"]),

	        },
	        methods:{
                        ...mapActionsFromClassroom(["init", "addClassroom", "updataClassroom", "removeClassroom"]),
                        beginAdd(){
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.mode = true;
				this.edit.model.clsr_name = "";
                                this.edit.isEdit = true;
                        },
		        begainUpdata(node){
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.mode = false;
                                this.edit.model.clsr_id = node.clsr_id;
                                this.edit.model.clsr_name = node.clsr_name;
                                this.edit.isEdit = true;
		        },
		        save(){
		                this.$refs.form.validate(async valid => {
		                        if( !valid ) return;
                                        if( this.edit.mode ){
                                                await this.addClassroom(Object.assign({}, this.edit.model));
                                                this.edit.isEdit = false;
                                                this.$message({
                                                        message: `"${this.edit.model.clsr_name}"节点新增成功`,
                                                        type: "success"
                                                })
                                        } else{
                                                await this.updataClassroom(Object.assign({}, this.edit.model));
                                                this.edit.isEdit = false;
                                                this.$message({
                                                        message: `"${this.edit.model.clsr_name}"节点修改成功`,
                                                        type: "success"
                                                })
                                        }
		                })

		        },
		        async romove(clsr_id){
                                this.$confirm(`你确定要删除节点吗`,"警告",{ type: "warning" })
                                        .then( async () =>{
                                                await this.removeClassroom(clsr_id);
                                                this.edit.isEdit = false;
                                                this.$message({
                                                        message: `节点删除成功`,
                                                        type: "success"
                                                })
                                        })
		        },
	        }

        }
</script>

<style lang="stylus" type="text/stylus" scoped>
	.spot
		display flex
		align-items center
		padding 10px
		i
			display block
			width 15px
			height 15px
			margin 10px
	.green
		background-color #070
		color #eee
	.orange
		background-color #E79602
		color #eee
	.el-row
		text-align center
		cursor pointer
	.el-card
		position: relative
		text-align: center
		padding-top 15px
		font-size: 20px
		margin-bottom 20px
		font-weight: bolder
		cursor: pointer
		.btn-style
			text-align right
			height 25px
			.el-button
				color #eee
				font-size 20px
</style>