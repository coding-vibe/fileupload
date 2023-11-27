/* eslint-disable react/prop-types */
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Formik, Form, Field } from 'formik';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import VALIDATION_SCHEMA from './validation';
import * as classes from './styles';

const FileUploadForm = () => {
  const handleSubmit = (
    values,
  ) => {
    console.log(values);
  }

  return (
    <Formik
      initialValues={{ file: null }}
      onSubmit={handleSubmit}
      validationSchema={VALIDATION_SCHEMA}
    >
      {() => (
        <Form>
          <Field
            component={ImageField}
            css={classes.wrap}
            name='file'
          />
          <Button
            type='submit'
            variant='contained'>
            Send files
          </Button>
        </Form>
      )}
    </Formik>
  );
}

const ImageField = ({
  className,
  field: { name, value },
  form: { getFieldMeta, setFieldValue },
}) => {

  const meta = getFieldMeta(name);
  const error = meta.touched && !!meta.error ? meta.error : '';

  if (value)
    return (
      <div css={classes.box}>
        <span>{value}</span>
        <DeleteIcon />
      </div>)

  return (
    <div>
      <FileUploader className={className} name={name} setFieldValue={setFieldValue} />
      {error &&
        <Box sx={{ color: 'error.dark', mb: 2 }}>
          {error}
        </Box>}
    </div>
  );
}

const ALLOWED_FILE_EXTENSIONS = ['.gif', '.jpeg', '.jpg', '.png'];
const RANDOM_IMAGE_DESCRIPTION = 'Lorem ipsum dolor sit amet';
const MAX_FILE_SIZE = 7000000;
const URL = 'http://localhost:8000/file-upload/';

const FileUploader = ({
  className,
  name,
  setFieldValue,
}) => {
  const onDrop = useCallback(acceptedFiles => {
    const [file] = acceptedFiles;
    const formData = new FormData();
    formData.append('title', file.name);
    formData.append('image', file);
    formData.append('description', RANDOM_IMAGE_DESCRIPTION);

    const requestOptions = {
      method: 'POST',
      body: formData,
    };

    fetch(URL, requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((response) => {
        setFieldValue(name, response.image_url);
      })
      .catch(error => {
        console.error('Error during file upload:', error);
      });
  }, [name, setFieldValue]);

  const {
    getRootProps,
    getInputProps
  } = useDropzone({
    onDrop,
    accept: {
        'image/*': ALLOWED_FILE_EXTENSIONS,
    },
    maxSize: MAX_FILE_SIZE,
  });

  return (
    <Box {...getRootProps()} className={className}>
      <input {...getInputProps()} id={name} name={name} />
      <div>Drag and drop some files here, or click to select files</div>
    </Box>
  );
}

export default FileUploadForm;