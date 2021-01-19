<template>
	<div class="backg">
		<div class="logo-wrapper">
			<h1>青岛黄海学院教务系统</h1>
		</div>
		<el-form :model="model" :rules="rules" status-icon ref="form">
			<h1>登录</h1>
			<el-form-item prop="user_name">
				<el-input suffix-icon="el-icon-s-custom" v-model.trim="model.user_name">
					<template slot="prepend" ><span class="prependText">用户名:</span></template>
				</el-input>
			</el-form-item>
			<el-form-item prop="user_pwd">
				<el-input suffix-icon="el-icon-lock" v-model="model.user_pwd" type="password">
					<template slot="prepend"><span class="prependText">密码:</span></template>
				</el-input>
			</el-form-item>
			<el-form-item>
				<el-button plain @click="login">登录</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script type="text/ecmascript-6">

        export default {
                name: "Login",
	        data(){
                        return{
                                model:{
                                        user_name: "",
	                                user_pwd: ""
                                },
	                        rules:{
                                        user_name:[
	                                        { required: true, message: "* 用户名不能为空", trigger: "blur" },
	                                        { min: 3, max: 20, message: "* 用户名长度3-20", trigger: "blur" }
                                        ],
                                        user_pwd:[
                                                { required: true, message: "* 密码不能为空", trigger: "blur" },
                                                { min: 3, max: 20, message: "* 密码长度3-20", trigger: "blur" }
                                        ]
	                        }
                        }
	        },
	        methods:{
	                login(){
	                        this.$refs.form.validate( async  valid =>{
	                                if( !valid ) return;
                                        let token = await this.$http({
                                                method: "post",
                                                url: '/user/login',
                                                data: this.model
                                        });
                                        sessionStorage.setItem("token", token);
                                        sessionStorage.setItem("user_name", this.model.user_name);
                                        this.$router.replace('/home');
	                        } );


	                },
	        }
	}
</script>

<style lang="stylus" type="text/stylus" scoped>
	.backg
		background url("./bcimg.jpg") no-repeat center
		background-size cover
		height 100%
		@keyframes aaa
			0% { transform:rotateY(0deg)}
			100% {transform:rotateY(30deg)}

		@keyframes bbb
			0%{transform:translateY(-50%) translateX(0%)}
			100%{transform:translateY(-50%) translateX(5%)}

		.logo-wrapper
			perspective 500px
			position fixed
			top 50%
			right 50%
			transform translateY(-50%) translateX(0%)
			animation-name bbb
			animation-duration 1s
			animation-fill-mode forwards//保持结束动画，停留
			animation-delay 1s//延时一秒
			h1
				animation-name aaa
				animation-duration 1s
				animation-fill-mode forwards
				font-size 60px
				transform-origin left center
				transform  rotateY(20deg)
				text-shadow -10px 10px 10px black
				white-space nowrap
				padding 10px 50px
				color: #b0b0b0
				border-bottom 1px solid black
		.el-form
			background-color rgba(200,200,200,0.5)
			position: fixed
			top: 50%
			left: 50%
			transform: translate( -20%, -50% )
			width: 400px
			border: 1px solid #b0b0b0
			border-radius: 10px
			padding: 50px 80px
			span.prependText
				display: inline-block
				width: 80px
				text-align: center
			h1
				color #666
				text-align: center
				font-size: 28px
				margin-bottom: 10px
</style>