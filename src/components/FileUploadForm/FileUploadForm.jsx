/* eslint-disable react/prop-types */
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Formik, Form, Field } from 'formik';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
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
            sx={{ bgcolor: 'secondary.dark' }}
            type='submit'
            variant='contained'>
            Send image
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
      <div>
        <img alt={name} css={classes.img} src={`http://localhost:8000${value}`} />
        <div css={classes.box}>
          <span>{value}</span>
          <DeleteIcon />
        </div>
      </div>
    )

  return (
    <Box>
      <FileUploader className={className} name={name} onUploadSuccess={(url)=> setFieldValue(name, url)} />
      {error &&
        <Box sx={{ color: 'error.dark', mb: 2 }}>
          {error}
        </Box>}
    </Box>
  );
}

const ALLOWED_FILE_EXTENSIONS = ['.gif', '.jpeg', '.jpg', '.png'];
const RANDOM_IMAGE_DESCRIPTION = 'Lorem ipsum dolor sit amet';
const MAX_FILE_SIZE = 7000000;
const URL = 'http://localhost:8000/file-upload/';

const FileUploader = ({
  className,
  name,
  onUploadSuccess,
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
        onUploadSuccess(response.image_url);
      })
      .catch(error => {
        console.error('Error during file upload:', error);
      });
  }, [onUploadSuccess]);

  const {
    getRootProps,
    getInputProps
  } = useDropzone({
    onDrop,
    accept: {
        'image/*': ALLOWED_FILE_EXTENSIONS,
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  return (
    <Box {...getRootProps()} className={className}>
      <input {...getInputProps()} id={name} name={name} />
      <Typography component='div' variant='overline'>
        Drag and drop an image here, or click to select it
      </Typography>
    </Box>
  );
}

export default FileUploadForm;