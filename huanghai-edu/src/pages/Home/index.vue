<template>
	<el-container class="page-container">
		<el-header height="60px">
			<div>
				<h1>黄海学院学生管理系统 V1.0</h1>
			</div>
			<div>
				<span v-text=" '欢迎您：'  + `${userName}`"></span>
				<el-button @click="quit" class="quit" size="small" type="primary" plain>退出</el-button>
			</div>
		</el-header>
		<el-container>
			<el-aside>
				<el-menu unique-opened background-color="#77AAAD" text-color="#eee" active-text-color="#ffd04b"
					:default-active="activeFuncKey" @select="menuSeleteHandler">
					<template v-for="item in menuData" >
						<el-menu-item v-if="item.func_key" :index="item.func_key" :key="item.func_id">
							<i class="el-icon-menu"></i>
							<span slot="title" v-text="item.func_name"></span>
						</el-menu-item>
						<el-submenu v-else :index="item.func_id.toString()" :key="item.func_id">
							<template slot="title">
								<i class="el-icon-setting"></i>
								<span slot="title" v-text="item.func_name"></span>
							</template>
							<template v-if="item.children">
								<el-menu-item v-for="item2 in item.children" :index="item2.func_key" :key="item2.func_id">
									<i class="el-icon-menu"></i>
									<span slot="title" v-text="item2.func_name"></span>
								</el-menu-item>
							</template>
						</el-submenu>
					</template>
				</el-menu>

			</el-aside>
			<el-container>
				<el-main>
					<el-tabs type="card" closable  v-model="activeFuncKey" @tab-remove="tabRemoveHandler">
						<el-tab-pane v-for="func_key in activeFunkeys" :key="func_key"
						             :label="menu.find( item => item.func_key === func_key ).func_name"
						             :name="func_key">
							<complate :is="views[func_key]"></complate>
						</el-tab-pane>

					</el-tabs>
				</el-main>
				<el-footer>
					版权所有 &copy;康康 www.kengni.com
				</el-footer>
			</el-container>
		</el-container>
	</el-container>
</template>

<script type="text/ecmascript-6">
	import views from '../../views';
	import { createNamespacedHelpers } from 'vuex';
        import ElButton from "../../../node_modules/element-ui/packages/button/src/button.vue";
	let { mapActions } = createNamespacedHelpers('dictionary');
	export default {
                components: {ElButton},
                name: "Home",
		data(){
	                return{
                                views,
	                        activeFuncKey: "",
		                activeFunkeys: [],
                                menu:[],                                                                        //窗口
		                userName: sessionStorage.getItem("user_name")    //用户名字
	                };

		},
		async created(){
		        this.init();
		        this.menu = await this.$http({
			        url: "/user/getmenu",
			        method: "post"
		        })
		},
		computed:{
		        menuData(){
		                let result = [];
		                this.menu.filter( item => item.func_fid === 0 ).forEach( item => {
		                        let node = Object.assign({} , item);
		                        let children = this.menu.filter( item2 => item2.func_fid === item.func_id );
		                        if( children.length > 0 ){
		                                node.children = [];
		                                children.forEach( item2 => node.children.push(Object.assign({}, item2)));
		                        }
		                        result.push(node);
		                } );
		                return result;
		        }
		},
		methods:{
			...mapActions( ["init"] ),
		        menuSeleteHandler( index,indexPath ){
		                this.activeFuncKey = index;
		                if( this.activeFunkeys.indexOf( index ) === -1 ){
                                        this.activeFunkeys.push(index);
                                }
		        },
                        tabRemoveHandler( name ){
//	                        if( this.activeFuncKey === name ){
//	                                this.activeFuncKey = this.activeFunkeys[0] || "";
//	                        }
	                        this.activeFunkeys.splice( this.activeFunkeys.indexOf(name) ,1 );
                                if( this.activeFunkeys.indexOf(this.activeFuncKey) === -1 ){
                                        this.activeFuncKey = this.activeFunkeys[0] || "";
                                }
                        },
                        quit(){
                                sessionStorage.removeItem( "token" );
                                sessionStorage.removeItem( "user_name" );
                                this.$router.replace('/login');
                        }
		}
	}
</script>

<style lang="stylus" type="text/stylus" scoped>
	.page-container
		height: 100%
		.el-header
			display: flex
			justify-content: space-between
			align-items: center
			background-color: #379392
			color: #fff
			h1
				font-size: 28px
				margin-left 40px
			.quit
				margin-right 30px
				cursor: pointer
		.el-aside
			background-color: #77AAAD
			.el-menu
				border-right: none
		.el-footer
			height 50px !important
			background-color #9DC3C1
			text-align center
			color #666
			line-height 50px
		.el-main
			position relative
</style>