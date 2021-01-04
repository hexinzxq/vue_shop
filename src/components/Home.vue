<template>
<div>
    Home组件
    <el-button type="info" @click="logout">退出</el-button>
</div>
</template>

<script>
export default {
  name: "Home",
  methods:{
      logout(){
        //   清楚token重定向到登录页面
          window.sessionStorage.clear();
          this.$router.push('/login');
      }
  }
}
</script>

<style lang="less" scoped>
</style>
