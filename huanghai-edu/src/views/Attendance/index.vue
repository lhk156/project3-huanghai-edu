<template>
	<div>
		<el-upload accept=".jpg, .png" list-type="picture-card" :before-upload="beforeAvatarUpload"
		action="/student/avatarUpload" name="avatar" :headers="uploadHeaders"
		:on-success="avatarUploadSuccess" :on-remove="avatarRemove" ref="upload">
			<i class="el-icon-plus"></i>
			<p slot="tip">提示：只能上传jpg或者png文件，且文件大小不超过2MB</p>
		</el-upload>
		<el-button :disabled="this.upload.model.stu_avatar_new === ''" type="primary" @click="avatarUpload">确定</el-button>
	</div>
</template>

<script type="text/ecmascript-6">
        export default {
                name: "Attendance",
	        data(){
                        return {
                                uploadHeaders:{
                                        "Authorization" : sessionStorage.getItem("token")
                                },
	                        upload:{
					isUpdata: false,
		                        model:{
                                                stu_id: 9,
			                        stu_avatar_old: null,
			                        stu_avatar_new: ""
		                        }
	                        }
                        }
	        },
	        methods:{
                        beforeAvatarUpload(file){
                                const isPng = file.type === 'image/png';
                                const isJPG = file.type === 'image/jpg';
                                const isLt2M = file.size / 1024 / 1024 < 2;

                                if( (!isPng) &&(!isJPG) ){
                                        this.$message.error("上传头像只能是jpg或者png格式")
                                }
                                if( !isLt2M ){
                                        this.$message.error("文件大小不超过2M")
                                }

                                return (isPng || isJPG ) && isLt2M
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
                                await this.$http({
	                                method: "post",
					url: "/student/avatarupdate",
	                                data: this.upload.model
                                });
                                this.$message.success("头像上传成功");
                                this.upload.isUpdata = false;                                   //关闭弹窗
	                        this.$refs.upload.clearFiles();                                  //清空
                        }
	        }
        }
</script>

<style lang="stylus" type="text/stylus" scoped></style>