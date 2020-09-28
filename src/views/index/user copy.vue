<template>
  <div class="app-container">
    <header class="app-header">
      <span class="title">{{ $route.meta.title }}</span>
    </header>
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
      <el-tab-pane label="账号信息" name="1">
        <el-form :inline="false" :model="organization" class="query-form" style="padding-bottom:20px;">
          <el-form-item label="所属机构" label-width="100px" class="query-form-item">
            <el-select v-model="organization.schoolname" disabled />
          </el-form-item>
          <el-form-item label="用户名称" label-width="100px" class="query-form-item">
            <el-input v-model="organization.username" disabled style=" width:300px;" />
          </el-form-item>
          <el-form-item label="手机号码" label-width="100px" class="query-form-item">
            <el-input v-model="organization.input" type="tel" maxlength="11" placeholder="请输入手机号码" style=" width:300px;" />
          </el-form-item>
          <el-form-item label="头像" label-width="100px" class="query-form-item" />
          <el-form-item label=" " label-width="100px" class="query-form-item">
            <el-button type="primary" icon="el-icon-s-home" @click.native="handleForm(null,null)">保存</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="修改密码" name="2">
        <el-form ref="pwdForm" :inline="false" :model="password" class="query-form" style="padding-bottom:20px;" :rules="pwdRules">
          <el-form-item label="旧密码" prop="old_password" label-width="100px" class="query-form-item">
            <el-input v-model="password.old_password" type="password" placeholder="请输入旧密码" style=" width:300px;" />
          </el-form-item>
          <el-form-item label="新密码" prop="new_password" label-width="100px" class="query-form-item">
            <el-input v-model="password.new_password" type="password" placeholder="请输入新密码" style=" width:300px;" />
          </el-form-item>
          <el-form-item label="确认密码" prop="check_password" label-width="100px" class="query-form-item">
            <el-input v-model="password.check_password" type="password" placeholder="请再次输入新密码" style=" width:300px;" />
          </el-form-item>
          <el-form-item label-width="100px" class="query-form-item">
            <el-button type="primary" @click.native="handlePwdForm()">保存</el-button>
          </el-form-item>
        </el-form>

      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script>
import { modifyPassword } from '@/api/user'
import Upload from '@/components/Upload/Upload'
import { validUsername } from '@/utils/validate'
export default {
  components: { Upload },
  data() {
    const validateNumLetter = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('请输入6-18位数字及小写字母'))
      } else {
        callback()
      }
    }
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.password.new_password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      activeName: this.$route.query.tab ? this.$route.query.tab : '1',
      organization: {
        schoolname: this.$store.getters.schoolname,
        username: this.$store.getters.name
      },
      filePathUrl: '',
      password: {
        old_password: '',
        new_password: '',
        check_password: ''
      },
      pwdRules: {
        old_password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { validator: validateNumLetter, trigger: 'blur' }
        ],
        new_password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { validator: validateNumLetter, trigger: 'blur' }
        ],
        check_password: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validatePass2, trigger: 'blur' }
        ]
      }

    }
  },
  mounted() {
  },
  methods: {
    handlePwdForm() {
      this.$refs['pwdForm'].validate(async valid => {
        if (valid) {
          modifyPassword(this.password).then(async res => {
            if (res.code == '20000') {
              this.$message.success('修改密码成功，请重新登录!')
              await this.$store.dispatch('user/logout')
              this.$router.push('/login')
            }
          })
        }
      })
    },
    handleClick(tab, event) {

    },
    onSelect(filePath, filePathUrl) {
      // this.filePath = filePath;
      this.filePathUrl = filePathUrl
    }
  }
}
</script>
