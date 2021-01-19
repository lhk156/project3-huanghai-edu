<template>
	<div>
		<el-form :model="edit.formModel" status-icon :rules="edit.rules" label-width="100px" ref="form">
			<el-form-item label="原始密码" prop="oldPwd">
				<el-input v-model="edit.formModel.oldPwd" clearable autocomplete="false" type="password"></el-input>
			</el-form-item>
			<el-form-item label="新密码" prop="newPwd">
				<el-input v-model="edit.formModel.newPwd" clearable autocomplete="false" type="password"></el-input>
			</el-form-item>
			<el-form-item label="确认新密码" prop="checkPwd">
				<el-input v-model="edit.formModel.checkPwd" clearable autocomplete="false" type="password"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="save">确定</el-button>
			</el-form-item>
		</el-form>

	</div>
</template>

<script type="text/ecmascript-6">

        export default {
                name: "ChangePwd",
	        data(){
                        return {
                                edit: {
                                        formModel: {
                                                oldPwd: "",
                                                newPwd: "",
                                                checkPwd: ""
                                        },
                                        rules: {
                                                oldPwd: [
                                                        { required: true, message: '必须输入原密码', trigger: 'blur' },
                                                        { min: 3, max: 20, message: '密码长度在 3 到 20 个字符', trigger: 'blur' }
                                                ],
                                                newPwd:[
		                                        {
                                                                validator: ( rule, value, callback ) => {
			                                                if( value.length === 0 )
			                                                        callback( new Error("请输入新密码") );
			                                                else if( value.length < 3 || value.length > 20 )
			                                                        callback( new Error("密码长度在 3 到 20 个字符") );
			                                                else if( value === this.edit.formModel.oldPwd )
			                                                        callback( new Error("你虎啊，咋和原密码一样？") );
			                                                else
			                                                        callback();
		                                                },
			                                        trigger: "blur"
		                                        }
	                                        ],
	                                        checkPwd:[
		                                        {
                                                                validator: (rule, value, callback) => {
                                                                        if( value.length === 0 )
                                                                                callback( new Error("请在输一次密码") );
                                                                        else if( value.length < 3 || value.length > 20 )
                                                                                callback( new Error("密码长度在 3 到 20 个字符") );
                                                                        else if( value !== this.edit.formModel.newPwd )
                                                                                callback( new Error("你虎啊，确认密码要和新密码一样，晓得不") );
                                                                        else
                                                                                callback();
		                                                },
			                                        trigger: "blur"
		                                        }
	                                        ]
                                        }
                                }

                        }
	        },
	        methods:{
                        save(){
                                this.$refs.form.validate( async valid  =>{
                                        if(!valid) return;
                                        await this.$http({
                                                method: "post",
                                                url: "/user/pwdchange",
                                                data: this.edit.formModel
                                        });
                                        this.$alert('密码修改成功，请点击确定按钮回到登录页面重新登录！！！', '提示', {
                                                confirmButtonText: '确定',
                                                type: 'warning',
                                                callback: () => {
                                                      this.$router.replace('/login');
                                                }
                                        });
                                })
                        }
	        }
        }
</script>

<style lang="stylus" type="text/stylus" scoped>
	.el-form
		width 500px
</style>