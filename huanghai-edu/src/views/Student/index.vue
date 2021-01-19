<template>
	<div>
		<el-container>
			<el-header>
				<el-form inline>
					<el-form-item label="学生名字：">
						<el-input placeholder="请输入搜索内容" v-model="search.stu_name"
						          prefix-icon="el-icon-search" clearable @change="getData()">
						</el-input>
					</el-form-item>
					<el-form-item label="所在班级：">
						<el-select v-model="search.stu_cls_id" @change="getData()">
							<el-option :value="0" label="- 全部 -"></el-option>
							<el-option :value="null" label="- 无班级 -"></el-option>
							<el-option v-for="item in classList" :key="item.cls_id" :value="item.cls_id" :label="item.cls_name"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="学生学历：">
						<el-select v-model="search.stu_qualification" @change="getData()">
							<el-option :value="0" label="- 全部 -"></el-option>
							<el-option v-for="item in getGroupByKey('qualification')" :key="item.dic_id" :value="item.dic_id" :label="item.dic_name"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" icon="el-icon-plus" @click="beginAdd">新增</el-button>
						<el-button type="success" icon="el-icon-share" @click="beginMoreClass">批量分班</el-button>
						<el-button type="danger" icon="el-icon-download">导出学生信息</el-button>
					</el-form-item>
				</el-form>
			</el-header>
			<el-main style="width: 1370px">
				<el-table :data="studentsList" border stripe width="1370px"  @selection-change="handleSelectionChange">
					<el-table-column label="#" type="index" fixed></el-table-column>
					<el-table-column type="selection" width="55"fixed></el-table-column>
					<el-table-column label="学生姓名" fixed prop="stu_name"></el-table-column>
					<el-table-column label="班级" width="90px">
						<template slot-scope="{ row }">
							<span v-if="row.stu_cls_id " v-text="  classList.length > 0 && classList.find( item => item.cls_id === row.stu_cls_id ).cls_name "></span>
							<span v-else class="gray">无班级</span>
						</template>
					</el-table-column>
					<el-table-column label="存档照片" width="80px" align="center">
						<template slot-scope="{row}">
							<el-popover	placement="right"	:title="row.stu_name" trigger="click">
								<el-image v-if="row.stu_avatar" :src = "row.stu_avatar" style="width: 200px"></el-image>
									<span v-else class="orange">
									暂无照片，可以点击照片存档按钮进行存储
								</span>
								<el-button slot="reference" type="text">预览</el-button>
							</el-popover>
						</template>
					</el-table-column>
					<el-table-column label="性别" align="center">
						<template slot-scope="{ row }">
							<span v-show="row.stu_sex === 1">男</span>
							<span v-show="row.stu_sex === 0">女</span>
						</template>
					</el-table-column>
					<el-table-column label="联系电话" prop="stu_phone" width="120px"></el-table-column>
					<el-table-column label="联系电话（备用）" prop="stu_phone2" width="120px"></el-table-column>
					<el-table-column label="出生日期" prop="stu_born" width="120px"></el-table-column>
					<el-table-column label="学历" width="120px">
						<template slot-scope="{ row }">
							<span v-text="getGroupByKey('qualification').find( item => item.dic_id === row.stu_qualification ).dic_name"></span>
						</template>
					</el-table-column>
					<el-table-column label="毕业院校" prop="stu_school"></el-table-column>
					<el-table-column label="院校专业" prop="stu_major"></el-table-column>
					<el-table-column label="家庭住址" prop="stu_address"></el-table-column>
					<el-table-column label="备注" prop="stu_remark"></el-table-column>
					<el-table-column label="操作" fixed="right" width="400px" align="center">
						<template slot-scope="{ row }">
							<el-button size="small" type="success" icon="el-icon-share" @click="groupClass(row.stu_id)">分班</el-button>
							<el-button size="small" type="danger" icon="el-icon-picture" @click="beginPostPhoto(row)">照片存档</el-button>
							<el-button size="small" type="primary" icon="el-icon-edit" @click="beginUpdata(row)">编辑</el-button>
							<el-button size="small" type="warning" icon="el-icon-delete">删除</el-button>
						</template>
					</el-table-column>
				</el-table>
			</el-main>
			<el-footer>
				<el-pagination
					@current-change="getData()"
					layout=" total, prev, pager, next, jumper "
					:current-page.sync="pagination.currentPage"
					:page-size.sync="pagination.pageSize"
					:total="pagination.total"
					background>
				</el-pagination>
			</el-footer>
		</el-container>
		<el-dialog :visible.sync="edit.isEdit" :modal="false" :show-close="false" :title="edit.mode ? '用户维护 - 新增' : '用户维护 - 修改'" >
			<el-form :model="edit.model" :rules="edit.rules" ref="form">
				<el-form-item label="学生姓名：" label-width="120px" prop="stu_name">
					<el-input v-model="edit.model.stu_name" placeholder="请输入学生姓名"></el-input>
				</el-form-item>
				<el-form-item label="性别：" label-width="120px">
					<el-radio v-model="edit.model.stu_sex" :label="0">女</el-radio>
					<el-radio v-model="edit.model.stu_sex" :label="1">男</el-radio>
				</el-form-item>
				<el-form-item label="联系电话：" label-width="120px" prop="stu_phone">
					<el-input type="text" placeholder="请输入手机号" v-model="edit.model.stu_phone" maxlength="11" show-word-limit></el-input>
				</el-form-item>
				<el-form-item label="备用电话：" label-width="120px" prop="stu_phone">
					<el-input placeholder="请输入备用联系电话（手机号/座机号）" v-model="edit.model.stu_phone2">
						<template slot="append">例如：028-88888888</template>
					</el-input>
				</el-form-item>
				<el-form-item label="出生日期：" label-width="120px">
					<el-date-picker value-format="yyyy-MM-dd" type="date" placeholder="选择出生日期" v-model="edit.model.stu_born" ></el-date-picker>
				</el-form-item>
				<el-form-item label="学历：" label-width="120px" prop="stu_qualification">
					<el-select v-model="edit.model.stu_qualification" placeholder="请选择学生的学历">
						<el-option v-for="item in getGroupByKey('qualification')" :key="item.dic_id" :value="item.dic_id" :label="item.dic_name"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="在读/毕业院校：" label-width="120px">
					<el-input placeholder="请输入在读/毕业院校（选填）" v-model="edit.model.stu_school"></el-input>
				</el-form-item>
				<el-form-item label="在校学习专业：" label-width="120px">
					<el-input placeholder="请输入在校学习专业（选填）" v-model="edit.model.stu_major"></el-input>
				</el-form-item>
				<el-form-item label="家庭住址：" label-width="120px" prop="stu_address">
					<el-input placeholder="请输入学生家庭住址" v-model="edit.model.stu_address"></el-input>
				</el-form-item>
				<el-form-item label="学生备注：" label-width="120px">
					<el-input placeholder="请输入备注" v-model="edit.model.stu_remark" type="textarea"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button type="primary" @click="save">保存</el-button>
				<el-button @click="edit.isEdit = false">取消</el-button>
			</span>
		</el-dialog>
		<el-dialog :visible.sync="grouping.isEdit" :modal="false" :show-close="false" >
			<p slot="title">分班</p>
			<el-form :model="grouping">
				<el-form-item label="班级：">
					<el-select v-model="grouping.stu_cls_id">
						<el-option :value="null" label="- 无班级 -"></el-option>
						<el-option v-for="item in classList" :key="item.cls_id" :value="item.cls_id"
						           :label="item.cls_name" :disabled="item.cls_end !== null">
						</el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button type="primary" @click="saveClass">保存</el-button>
				<el-button @click="grouping.isEdit = false">取消</el-button>
			</span>
		</el-dialog>
		<el-dialog :visible.sync="upload.isUpload" :modal="false" :show-close="false" width="700px">
			<div class="photo-warpper">
				<el-image v-if="upload.model.stu_avatar_old" :src = "upload.model.stu_avatar_old" style="width: 180px"></el-image>
				<div class="photo-content">
					<el-upload accept=".jpg, .png" list-type="picture-card" :before-upload="beforeAvatarUpload"
				           action="/student/avatarUpload" name="avatar" :headers="uploadHeaders"
				           :on-success="avatarUploadSuccess" :on-remove="avatarRemove" ref="upload">
						<i class="el-icon-plus"></i>
						<p slot="tip" class="orange">提示：只能上传jpg或者png文件，且文件大小不超过2MB</p>
					</el-upload>
					<el-button :disabled="this.upload.model.stu_avatar_new === ''" type="primary" @click="avatarUpload">确定</el-button>
				</div>
			</div>
		</el-dialog>
	</div>
</template>

<script type="text/ecmascript-6">
	import { createNamespacedHelpers } from 'vuex';
        //字典仓库
        let { mapGetters: dicMapGetters } = createNamespacedHelpers('dictionary');
        //教室仓库
        let { mapState: classroomMapState , mapActions:classroomMapActions } = createNamespacedHelpers('classroom');
        export default {
                name: "Student",
	        data(){
                        return {
                                classList: [],                                          //班级列表
                                studentsList: [],                                   //学生列表
                                search:{
                                        stu_name: "",
                                        stu_cls_id: 0,
                                        stu_qualification: 0
                                },
	                        edit:{
                                        isEdit: false,
		                        mode: true,
		                        model:{
                                                stu_id: 0,
                                                stu_name: "",
			                        stu_avatar: null,
			                        stu_cls_id: null,
			                        stu_sex: 0,
			                        stu_phone: "",
			                        stu_phone2: "",
			                        stu_born: "",
			                        stu_qualification: "",                               //学历
			                        stu_school: null,
			                        stu_major: null,                                        //专业
			                        stu_address: "",
			                        stu_remark: null
		                        },
		                        rules:{
                                                stu_name:[
	                                                {
	                                                        validator: ( rule, value, callback) => {
	                                                                if( value.length === 0 )
	                                                                        callback( new Error("*学生名字必填") );
		                                                        else if (value.length< 2 || value.length > 20)
		                                                                callback( new Error("*学生名字长度2-20") );
		                                                        else
		                                                                callback()
	                                                        },
		                                                ttrigger: "blur"
	                                                }
                                                ],
                                                stu_phone:[
	                                                {
	                                                        validator: ( rule, value, callback ) => {
									if( value.length === 0 )
									        callback( new Error("*用户手机号必填") );
		                                                        else if( !/^1[3|5|7|8][0-9]{9}$/.test(value) )
		                                                                callback( new Error("*无效的手机号") );
		                                                        else
		                                                                callback()
	                                                        },
		                                                trigger: "blur"
	                                                }
                                                ],
                                                stu_qualification:[{ required: true, message: "学生学历必选", trigger: "blur" }],
                                                stu_address:[
                                                        {required: true, message: "学生家庭住址必写", trigger: "blur"},
	                                                { min: 10, max: 100, message: "学生家庭住址长度10-100", trigger: "blur" }
                                                ]
		                        }
	                        },
                                pagination:{
                                        currentPage: 1,
                                        begin: 0,
                                        pageSize: 5,
	                                total: 0
                                },
                                grouping:{
                                        isEdit: false,
                                        stu_id: 0,
	                                stu_ids: [],
	                                stu_cls_id: null,
	                                haveIds:[]
                                },
                                uploadHeaders:{
                                        "Authorization" : sessionStorage.getItem("token")
                                },
                                upload:{
                                        isUpload: false,
                                        model:{
                                                stu_id: 0,
                                                stu_avatar_old: null,
                                                stu_avatar_new: ""
                                        }
                                }
                        }
	        },
	        created(){
                        this.classroomInit();
			this.$http({  url: "/class/all" }).then( list => this.classList = list );
		        this.getData();
	        },
	        computed:{
		        ...dicMapGetters(["getGroupByKey"]),
                        ...classroomMapState({ "classroomList" : "list" }),
	        },
	        methods:{
                        ...classroomMapActions({ "classroomInit": 'init' }),
                        //获取数据
                        async getData( fromPage1 = true ){
                                if(fromPage1) this.pagination.currentPage = 1;
                                let backdata = await this.$http({
                                        method: "post",
                                        url: "/student/list",
                                        data: {
                                                ...this.search,
                                                begin: this.pagination.pageSize * ( this.pagination.currentPage - 1 ),
                                                pageSize: this.pagination.pageSize
                                        }
                                });
                                this.pagination.total = backdata.total;
                                this.studentsList = backdata.list;
                        },
		        //开始新增
                        beginAdd(){
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.mode = true;
                                this.edit.model.stu_id = 0;
	                        this.edit.model.stu_name = "";
	                        this.edit.model.stu_avatar = null;
	                        this.edit.model.stu_cls_id = null;
	                        this.edit.model.stu_sex = 0;
	                        this.edit.model.stu_phone = "";
	                        this.edit.model.stu_phone2 ="";
	                        this.edit.model.stu_born = "";
	                        this.edit.model.stu_qualification = "";                               //学历
	                        this.edit.model.stu_school = null;
	                        this.edit.model.stu_major = null;                                        //专业
	                        this.edit.model.stu_address="";
	                        this.edit.model.stu_remark= null;
	                        this.edit.isEdit = true;
                        },
		        //开始编辑
		        beginUpdata(node){
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.mode = false;
                                this.edit.model.stu_id = node.stu_id;
                                this.edit.model.stu_name = node.stu_name;
                                this.edit.model.stu_avatar = node.stu_avatar;
                                this.edit.model.stu_cls_id = node.stu_cls_id;
                                this.edit.model.stu_sex = node.stu_sex;
                                this.edit.model.stu_phone = node.stu_phone;
                                this.edit.model.stu_phone2 =node.stu_phone2;
                                this.edit.model.stu_born = node.stu_born;
                                this.edit.model.stu_qualification = node.stu_qualification;
                                this.edit.model.stu_school = node.stu_school;
                                this.edit.model.stu_major = node.stu_major;
                                this.edit.model.stu_address=node.stu_address;
                                this.edit.model.stu_remark= node.stu_remark;
                                this.edit.isEdit = true;
		        },
		        //保存
		        async save(){
		                this.$refs.form.validate( async valid => {
		                        if( !valid ) return;
                                        if( this.edit.mode ) {
                                                this.edit.model.stu_id = await this.$http({
                                                        method: "post",
                                                        url: "/student/add",
                                                        data: this.edit.model
                                                });
                                                this.studentsList.push( Object.assign({}, this.edit.model) );
                                                this.$message({
                                                        message: `"${this.edit.model.stu_name}"学生添加成功`,
                                                        type: "success"
                                                })
                                        }else{
                                                await this.$http({
                                                        method: "post",
                                                        url: "/student/update",
                                                        data: this.edit.model
                                                });
                                                let i = this.studentsList.findIndex( item => item.stu_id === this.edit.model.stu_id );
                                                this.studentsList.splice( i, 1, Object.assign({}, this.edit.model) );
                                                this.$message({
                                                        message: `"${this.edit.model.stu_name}"学生修改成功`,
                                                        type: "success"
                                                })
                                        }
                                        this.edit.isEdit = false;
		                } )

		        },
		        //分班
                        groupClass(stu_id){
                                this.grouping.stu_id = stu_id;
                                this.grouping.stu_ids = [stu_id];
                                this.grouping.stu_cls_id = null;
		                this.grouping.isEdit = true;
                        },
		        //确定分班
                        async saveClass(){
				await this.$http({
					method: "post",
					url: "/student/assignclass",
					data: this.grouping
				});
				this.grouping.stu_ids.forEach( item1 => {
                                        this.studentsList.find(item => item.stu_id === item1).stu_cls_id = this.grouping.stu_cls_id;
				});
                                this.grouping.isEdit = false;
	                        this.$message.success("分班成功");
                        },
		        //多选框
		        handleSelectionChange(rows){
                                this.grouping.haveIds = [];
                                rows.forEach( item => {
                                        this.studentsList.forEach( item1 => {
                                                item.stu_id === item1.stu_id && this.grouping.haveIds.push(item.stu_id)
                                        } )
                                } );
		        },
		        //开始批量分班
                        async beginMoreClass(){
                                if( this.grouping.haveIds.length > 0 ){
                                        this.grouping.stu_id = null;
                                        this.grouping.stu_cls_id = null;
                                        this.grouping.stu_ids = this.grouping.haveIds;
                                        this.grouping.isEdit = true;
                                }else{
                                        this.$message.warning("请选择要分班的学生！")
                                }
                        },
		        //开始进行照片存档
                        beginPostPhoto(node){
//                                this.$refs.upload.clearFiles();
                                this.upload.model.stu_id = node.stu_id;
                                this.upload.model.stu_avatar_old = node.stu_avatar;
	                        this.upload.model.stu_avatar_new = "";
				this.upload.isUpload = true;
                        },
                        beforeAvatarUpload(file){
                                const isPng = file.type === 'image/png';
                                const isJpg = file.type === 'image/jpeg';
                                const isLt2M = file.size / 1024 / 1024 < 2;

                                if( (!isPng) && (!isJpg) ){
                                        this.$message.error("上传头像只能是jpg或者png格式")
                                }
                                if( !isLt2M ){
                                        this.$message.error("文件大小不超过2M")
                                }
                                return (isPng || isJpg ) && isLt2M
                        },
                        avatarUploadSuccess( { status, data, message }, file, fileList){
                                switch(status){
                                        case 200:
                                                this.upload.model.stu_avatar_new = data;
                                                if( fileList.length >1 ) fileList.shift();
                                                break;
                                        case 401:
                                        case 500:
                                        case 404:
                                        case 199:
                                                this.$message({message})
                                }
                        },
                        avatarRemove(file, fileList){
                                this.upload.model.stu_avatar_new = "";
                        },
                        async avatarUpload(){
                                let oldImg = await this.$http({
                                        method: "post",
                                        url: "/student/avatarupdate",
                                        data: this.upload.model
                                });
                                this.$message.success("头像上传成功");
                                this.studentsList.find(item => item.stu_id === this.upload.model.stu_id).stu_avatar = oldImg;
                                this.upload.isUpload = false;                                   //关闭弹窗
                                this.$refs.upload.clearFiles();                                  //清空
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
		.el-header
			width 1400px
	.orange
		color orange
	.photo-warpper
		display flex
		.photo-content
			margin-left 50px
			.el-button
				margin 10px 80%
	.gray
		color #b0b0b0
</style>