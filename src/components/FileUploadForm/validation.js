import * as yup from 'yup';

const VALIDATION_SCHEMA = yup.object().shape({
    file: yup.string().required('Required') });

export default VALIDATION_SCHEMA;
