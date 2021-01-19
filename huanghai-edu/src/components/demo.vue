<template>
	<div>
		<button @click="$emit('update:a', 100)">修改父组件的aa</button>
		<button @click="$emit('abc', 1000)">修改父组件的bb</button>
		<!-- 默认插槽 -->
		<slot></slot>
		<!-- 具名插槽 -->
		<div>
			<slot name="a1"></slot>
		</div>
		<div>
			<slot name="a2"></slot>
		</div>
		<div>
			<slot name="a2"></slot>
		</div>
		<div>
			<slot name="a3" name1="张三" :age="18"></slot>
		</div>
	</div>
</template>

<script type="text/ecmascript-6">
        export default {
                name: "Demo",
	        props: ["a", "b"],
	        model:{
                        prop: "b",
		        event: "abc"
	        }
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>

</style>