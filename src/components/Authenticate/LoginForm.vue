<template>
  <!-- Enterキーでログインするため -->
  <form @submit.prevent="login">
    <authenticate-header :class="$style.header" />
    <login-form-saved
      v-if="saved"
      :saved="saved"
      @login="loginWithSaved"
      @use-other="dontUseSaved"
    />
    <template v-else>
      <authenticate-input
        v-model="loginState.name"
        label="traQ ID"
        autocomplete="username"
        :class="$style.item"
        autofocus
      />
      <span :class="$style.item">
        <authenticate-input
          v-model="loginState.pass"
          label="パスワード"
          type="password"
          autocomplete="current-password"
          enterkeyhint="done"
        />
        <a
          v-if="resetLink !== undefined"
          :href="resetLink"
          :class="$style.forgotPassword"
        >
          パスワードを忘れた
        </a>
      </span>
      <div :class="$style.error">
        <span v-if="loginState.error">{{ loginState.error }}</span>
      </div>
      <div :class="$style.buttons">
        <authenticate-button type="primary" label="ログイン" is-submit />
      </div>
      <template v-if="!isIOS && externalLogin.size > 0">
        <authenticate-separator label="または" :class="$style.separator" />
        <div :class="$style.exLoginButtons">
          <authenticate-button
            v-show="externalLogin.has('traQ')"
            type="secondary"
            :class="$style.exLoginButton"
            label="traP"
            icon-name="traQ"
            @click="loginExternal('traq')"
          />
          <authenticate-button
            v-show="externalLogin.has('google')"
            type="secondary"
            :class="$style.exLoginButton"
            label="Google"
            icon-mdi
            icon-name="google"
            @click="loginExternal('google')"
          />
          <authenticate-button
            v-show="externalLogin.has('github')"
            type="secondary"
            :class="$style.exLoginButton"
            label="GitHub"
            icon-mdi
            icon-name="github"
            @click="loginExternal('github')"
          />
          <authenticate-button
            v-show="externalLogin.has('oidc')"
            type="secondary"
            :class="$style.exLoginButton"
            label="OpenID Connect"
            icon-mdi
            icon-name="openid"
            @click="loginExternal('oidc')"
          />
        </div>
      </template>
      <template v-if="signUpAllowed">
        <authenticate-separator :class="$style.separator" />
        <authenticate-button
          type="secondary"
          :class="$style.registrationButton"
          label="新規登録"
          @click="moveToRegistration"
        />
      </template>
    </template>
  </form>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import useLogin from './use/login'
import { isIOSApp } from '@/lib/util/browser'
import AuthenticateInput from './AuthenticateInput.vue'
import AuthenticateHeader from './AuthenticateHeader.vue'
import AuthenticateButton from './AuthenticateButton.vue'
import AuthenticateSeparator from './AuthenticateSeparator.vue'
import config from '@/config'
import LoginFormSaved from './LoginFormSaved.vue'
import router, { RouteName } from '@/router'

export default defineComponent({
  name: 'LoginForm',
  components: {
    LoginFormSaved,
    AuthenticateInput,
    AuthenticateHeader,
    AuthenticateButton,
    AuthenticateSeparator
  },
  props: {
    externalLogin: {
      type: Set as PropType<Set<string>>,
      required: true
    },
    signUpAllowed: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const {
      loginState,
      saved,
      login,
      loginWithSaved,
      loginExternal,
      dontUseSaved
    } = useLogin()
    const isIOS = isIOSApp()
    const { resetLink } = config.auth
    const moveToRegistration = () => {
      router.push(RouteName.Registration)
    }

    return {
      resetLink,
      loginState,
      saved,
      login,
      loginWithSaved,
      loginExternal,
      dontUseSaved,
      isIOS,
      moveToRegistration
    }
  }
})
</script>

<style lang="scss" module>
.item {
  margin: 24px 0;
  display: block;
}
.header {
  margin-bottom: 48px;
}
.forgotPassword {
  @include color-ui-secondary;
  @include size-caption;
  display: block;
  margin-top: 16px;
}
.buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 48px;
}
.separator {
  margin: 32px 0;
}
.exLoginButtons {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 32px;
}
.exLoginButton {
  margin: 0 8px;
}
.error {
  color: $theme-accent-error;
  font-weight: bold;
}
.registrationButton {
  margin: 0 auto;
}
</style>
