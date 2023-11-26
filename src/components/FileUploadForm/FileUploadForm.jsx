/* eslint-disable react/prop-types */
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Formik, Form, Field } from 'formik';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box'
import * as yup from 'yup';
import * as classes from './styles';

const FileUploadForm = () => {
  const handleSubmit = () => {}

  return (
    <Formik
      initialValues={{ files: null }}
      onSubmit={handleSubmit}
      validationSchema={yup.object().shape({ files: yup.mixed().required('Required!') })}
    >
       {({ isSubmitting }) => (
        <Form>
          <Field
            component={FileUploader}
            css={classes.wrap}
            name='file-uploader'
          />
          <LoadingButton
            loading={isSubmitting}
            type='submit'
            variant='contained'>
            Send files
          </LoadingButton>
        </Form>
      )}
    </Formik>
  )
}

const FileUploader = ({
  field: { name, value },
  className
}) => {
  const onDrop = useCallback(acceptedFiles => {
    console.log(acceptedFiles);
  }, []);

  const {
    getRootProps,
    getInputProps
  } = useDropzone({
    onDrop
  });

  return (
    !value ?
      <Box {...getRootProps()} className={className}>
      <input {...getInputProps()} id={name}  name={name} />
      <div>Drag and drop your images here.</div>
      </Box> :
      <div><span>{value}</span><DeleteIcon /></div>
  )
}



export default FileUploadForm;