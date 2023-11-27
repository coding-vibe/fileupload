import * as yup from 'yup';

const VALIDATION_SCHEMA = yup.object().shape({
    file: yup.string().required('errors.required') });

export default VALIDATION_SCHEMA;
