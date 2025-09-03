import * as yup from "yup";

export const buildValidator = (existingFeeds) => yup.object().shape({
    url: yup
      .string()
      .required('Не должно быть пустым')
      .url('Ссылка должна быть валидным URL')
      .test('unique', 'RSS уже существует', (value) => {
        if (!value) return true;
        return !existingFeeds.includes(value.trim());
      }),
});