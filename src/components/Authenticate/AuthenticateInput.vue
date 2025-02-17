<template>
  <div>
    <label :for="id" :class="$style.title">{{ label }}</label>
    <div :class="$style.container">
      <input
        :id="id"
        :class="$style.input"
        :value="value"
        :type="typeWithShown"
        :autofocus="autofocus"
        :autocomplete="autocomplete"
        :autocapitalize="autocapitalize"
        :enterkeyhint="enterkeyhint"
        @input="onInput"
      />
      <button
        v-if="type === 'password'"
        type="button"
        :title="`パスワードを${isPasswordShown ? '非表示' : '表示'}`"
        :class="$style.toggle"
        @click.prevent="togglePassword"
      >
        <icon
          :name="isPasswordShown ? 'eye-off-outline' : 'eye-outline'"
          mdi
          :class="$style.toggleIcon"
        />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { randomString } from '@/lib/util/randomString'
import Icon from '@/components/UI/Icon.vue'
import useShowPassword from '@/use/showPassword'
import useTextModelSyncer from '@/use/textModelSyncer'

export default defineComponent({
  name: 'AuthenticateInput',
  components: { Icon },
  props: {
    modelValue: { type: String, default: '' },
    label: { type: String, default: '' },
    type: {
      type: String as PropType<'text' | 'password'>,
      default: 'text' as const
    },
    autocomplete: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    autofocus: {
      type: Boolean,
      default: false
    },
    autocapitalize: {
      type: String,
      default: 'off'
    },
    enterkeyhint: String
  },
  setup(props, { emit }) {
    const { value, onInput } = useTextModelSyncer(props, emit)

    const id = randomString()

    const { isPasswordShown, togglePassword, typeWithShown } = useShowPassword(
      props
    )

    return {
      value,
      onInput,
      id,
      isPasswordShown,
      togglePassword,
      typeWithShown
    }
  }
})
</script>

<style lang="scss" module>
.title {
  @include color-ui-secondary;
  margin-bottom: 16px;
  font: {
    size: 1rem;
    weight: bold;
  }
}
.container {
  @include background-secondary;
  display: flex;
  border-radius: 4px;
}
.input {
  @include color-text-primary;
  width: 100%;
  height: 2rem;
  padding: 0.5rem;
}
.toggle {
  @include color-ui-secondary;
  height: 100%;
  padding: 0.25rem;
  padding-left: 0;
  cursor: pointer;
}
.toggleIcon {
  vertical-align: middle;
}
</style>
