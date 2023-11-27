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
  const handleSubmit = (
    values,
    { setSubmitting },
  ) => {
    setSubmitting(false);
    console.log(values);
  }

  return (
    <Formik
      initialValues={{ file: null }}
      onSubmit={handleSubmit}
      validationSchema={yup.object().shape({ file: yup.string().required('Required') })}
    >
       {({ isSubmitting }) => (
        <Form>
          <Field
            component={ImageField}
            css={classes.wrap}
            name='file'
          />

          <LoadingButton
            disabled={isSubmitting}
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

const ImageField = ({
  field: { name, onChange, value },
  form: {getFieldMeta},
  className
}) => {

  const meta = getFieldMeta(name);
  const error = meta.touched && !!meta.error ? meta.error : '';

  if (value)
    return (
      <div>
        <span>{value}</span><DeleteIcon />
      </div>)

  return (
    <div>
      <FileUploader className={className} onChange={onChange} name={name} />
      {error && <Box sx={{mb: 2, color: 'error.dark'}}>{error}</Box>}
    </div>
  )
}

const URL = 'http://localhost:8000';

const FileUploader = ({
  className,
  onChange,
  name,
}) => {
  const onDrop = useCallback(acceptedFiles => {
    const [file] = acceptedFiles;
    const formData = new FormData();
    formData.append('title', file.name);
    formData.append('image', file.path);
    formData.append('description', 'Lorem ipsum dolor sit amet');

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    }

    fetch(URL, requestOptions)
      .then(async response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        onChange(file.path);
      })
      .catch(error => {
        console.error('Error during file upload:', error);
      });
    console.log(acceptedFiles);
  }, [onChange]);

  const {
    getRootProps,
    getInputProps
  } = useDropzone({
    onDrop
  })

  return (
      <Box {...getRootProps()} className={className}>
      <input {...getInputProps()} id={name}  name={name} />
      <div>Drag and drop your images here.</div>
      </Box>
  )
}

export default FileUploadForm;